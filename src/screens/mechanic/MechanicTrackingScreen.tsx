import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, type Socket } from 'socket.io-client';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

const WS_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.techtunehealer.com';

export function MechanicTrackingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { bookingId } = route.params || {};

  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'tracking' | 'arrived'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // ── Connect socket on mount ──────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    (async () => {
      const token = (await AsyncStorage.getItem('authToken')) || '';
      if (!active) return;

      const socket = io(WS_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => console.log('🔌 Socket connected'));
      socket.on('connect_error', (err) => console.warn('Socket connection failed:', err.message));
    })();

    return () => {
      active = false;
      socketRef.current?.disconnect();
      locationSubRef.current?.remove();
    };
  }, []);

  // ── Handle app background / foreground ──────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // App came to foreground – tracking continues silently
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, []);

  // ── Fetch initial location on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
        if (permStatus === 'granted') {
          // FOR TESTING: Hardcode initial location to Vuthy's shop (Russian Market)
          // const loc = await Location.getCurrentPositionAsync({});
          // setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          setCoords({ lat: 11.5350, lng: 104.9150 });
        }
      } catch (error) {
        console.warn('Error fetching initial location:', error);
      }
    })();
  }, []);

  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  // ── Fetch OSRM Route ─────────────────────────────────────────────────────
  const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      // OSRM expects coordinates in lng,lat format
      const response = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRouteCoords(coords);
      }
    } catch (error) {
      console.warn('Error fetching route:', error);
    }
  };

  const customerCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // ── Start tracking (Real GPS) ────────────────────────────────────────────
  const startTracking = useCallback(async () => {
    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== 'granted') {
      Alert.alert('Permission Required', 'Location permission is needed to share your position.');
      return;
    }

    setIsTracking(true);
    setStatus('tracking');

    // Immediately emit current coords if we have them so the customer doesn't wait
    if (coords) {
      socketRef.current?.emit('mechanic:location', {
        bookingId,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      if (!customerCoordsRef.current) {
        // Match the customer's actual location (Independence Monument)
        customerCoordsRef.current = { lat: 11.5556, lng: 104.9282 };
        setCustomerCoords(customerCoordsRef.current);
      }
      fetchRoute(coords, customerCoordsRef.current);
    }

    // FOR TESTING: Instead of real GPS, we just use a simulated interval that moves slightly or stays at Russian Market
    // locationSubRef.current = await Location.watchPositionAsync( ... )
    const intervalId = setInterval(() => {
      setCoords(current => {
        if (!current) return { lat: 11.5350, lng: 104.9150 };
        // Simulate a tiny movement just so the socket updates
        const nextLoc = { lat: current.lat + 0.0001, lng: current.lng + 0.0001 };
        
        setUpdateCount(c => c + 1);
        socketRef.current?.emit('mechanic:location', {
          bookingId,
          latitude: nextLoc.lat,
          longitude: nextLoc.lng,
        });
        
        return nextLoc;
      });
    }, 3000);
    
    // We can't return the interval directly to the ref, so we mock the remove function
    locationSubRef.current = { remove: () => clearInterval(intervalId) } as any;
  }, [bookingId, coords]);

  // ── Stop tracking ────────────────────────────────────────────────────────
  const stopTracking = useCallback(() => {
    locationSubRef.current?.remove();
    locationSubRef.current = null;
    setIsTracking(false);
    setStatus('idle');
  }, []);

  // ── Signal arrival ───────────────────────────────────────────────────────
  const signalArrival = useCallback(() => {
    socketRef.current?.emit('mechanic:arrived', { bookingId });
    stopTracking();
    setStatus('arrived');
    Alert.alert('Arrival Confirmed', 'The customer has been notified you have arrived!');
  }, [bookingId, stopTracking]);

  // ── Status styles ────────────────────────────────────────────────────────
  const statusMeta = {
    idle:     { icon: 'location-outline', color: colors.neutral[400], label: 'Not Sharing' },
    tracking: { icon: 'navigate',          color: colors.success[500],  label: 'Sharing Live' },
    arrived:  { icon: 'checkmark-circle',  color: colors.primary[500],  label: 'Arrived'      },
  }[status];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {coords ? (
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: coords.lat,
              longitude: coords.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} title="You" pinColor="blue" />
            {customerCoords && (
              <Marker coordinate={{ latitude: customerCoords.lat, longitude: customerCoords.lng }} title="Customer" pinColor="red" />
            )}
            {/* Future driving route (Border) */}
            {customerCoords && routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#1b5a90"
                strokeWidth={6}
                lineCap="round"
                lineJoin="round"
              />
            )}
            {/* Future driving route (Inner) */}
            {customerCoords && routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#3A82F6"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color={colors.neutral[300]} />
            <Text style={styles.mapPlaceholderText}>Waiting for location...</Text>
          </View>
        )}

        {/* Overlay Card */}
        <View style={styles.overlayCard}>
          <View style={styles.overlayRow}>
            <Ionicons name={statusMeta.icon as any} size={24} color={statusMeta.color} />
            <Text style={[styles.statusLabel, { color: statusMeta.color, marginLeft: 8 }]}>{statusMeta.label}</Text>
          </View>
          {isTracking && (
            <View style={styles.updatesBadge}>
              <Text style={styles.updatesText}>{updateCount} updates sent</Text>
            </View>
          )}
        </View>

        {/* Floating Actions */}
        <View style={styles.floatingActions}>
          <TouchableOpacity 
            style={styles.floatingChatBtn}
            onPress={() => (navigation as any).navigate("Chat", { bookingId })}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        {/* Booking ID pill */}
        <View style={[styles.bookingPill, { position: 'absolute', top: spacing.md, right: spacing.md }]}>
          <Ionicons name="receipt-outline" size={16} color={colors.neutral[500]} />
          <Text style={styles.bookingText}>#{bookingId?.slice(-6).toUpperCase() || 'N/A'}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {status === 'idle' && (
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={startTracking}>
            <Ionicons name="navigate" size={20} color={colors.white} />
            <Text style={styles.btnTextLight}>Start Sharing Location</Text>
          </TouchableOpacity>
        )}

        {status === 'tracking' && (
          <>
            <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={signalArrival}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.btnTextLight}>I&apos;ve Arrived</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={stopTracking}>
              <Ionicons name="stop-circle" size={20} color={colors.white} />
              <Text style={styles.btnTextLight}>Stop Sharing</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'arrived' && (
          <TouchableOpacity
            style={[styles.btn, styles.btnNeutral]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnTextDark}>Back to Bookings</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    marginTop: spacing.sm,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  overlayCard: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.md,
  },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  coordsText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  updatesBadge: {
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  updatesText: {
    fontSize: fontSize.xs,
    color: colors.success[700],
    fontWeight: fontWeight.semibold,
  },
  floatingActions: {
    position: 'absolute',
    bottom: spacing.md + 70,
    right: spacing.md,
    alignItems: 'center',
  },
  floatingChatBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  bookingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  bookingText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    fontWeight: fontWeight.medium,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  btnPrimary: { backgroundColor: colors.primary[600] },
  btnSuccess: { backgroundColor: colors.success[600] },
  btnDanger:  { backgroundColor: colors.error[500] },
  btnNeutral: { backgroundColor: colors.neutral[200] },
  btnTextLight: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnTextDark:  { color: colors.neutral[800], fontSize: fontSize.base, fontWeight: fontWeight.bold },
});
