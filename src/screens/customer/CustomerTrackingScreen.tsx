import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, type Region } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, type Socket } from 'socket.io-client';
import { useLocationStore } from '../../store';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';

const WS_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.techtunehealer.com';

type LocationPoint = { latitude: number; longitude: number };

export function CustomerTrackingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { bookingId, mechanicName } = route.params || {};
  const { currentLocation: customerLocation } = useLocationStore();

  const [mechanicLocation, setMechanicLocation] = useState<LocationPoint | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [arrived, setArrived] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const mapRef = useRef<MapView>(null);
  const socketRef = useRef<Socket | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Pulse animation for the mechanic marker ─────────────────────────────
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const [routeCoords, setRouteCoords] = useState<LocationPoint[]>([]);
  
  // Use the customer's real device location as the target. If not available, fallback to middle of Phnom Penh.
  const initialTarget = customerLocation ? { latitude: customerLocation.latitude, longitude: customerLocation.longitude } : { latitude: 11.5556, longitude: 104.9282 };
  const [customerTargetState] = useState<LocationPoint | null>(initialTarget);
  const customerTargetRef = useRef<LocationPoint | null>(initialTarget);

  // ── Fetch OSRM Route ─────────────────────────────────────────────────────
  const fetchRoute = async (start: LocationPoint, end: LocationPoint) => {
    try {
      const response = await fetch(
        `http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
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

  // ── Connect and watch booking ───────────────────────────────────────
  useEffect(() => {
    let active = true;

    (async () => {
      const token = (await AsyncStorage.getItem('authToken')) || '';
      if (!active) return;

      const socket = io(WS_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('customer:watch', { bookingId });
      });

      socket.on('disconnect', () => setConnected(false));

      socket.on('connect_error', (err) => {
        console.warn('Socket connection failed:', err.message);
        setConnected(false);
      });

      socket.on('location:update', (data: { latitude: number; longitude: number; timestamp: string }) => {
        const point: LocationPoint = { latitude: data.latitude, longitude: data.longitude };

        let target = customerTargetRef.current!;

        setMechanicLocation(point);
        setLocationHistory(prev => [...prev, point]);
        fetchRoute(point, target);
        setLastUpdated(new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Pan map to mechanic
        mapRef.current?.animateToRegion({
          latitude: point.latitude,
          longitude: point.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 1000);
      });

      socket.on('mechanic:arrived', () => {
        setArrived(true);
        Alert.alert(
          '🎉 Mechanic Arrived!',
          `${mechanicName || 'Your mechanic'} has arrived at your location.`,
          [{ text: 'OK' }]
        );
      });

      socket.on('booking:error', (err: { message: string }) => {
        console.warn('Socket error:', err?.message);
        setConnected(false);
      });

      startPulse();
    })();

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [bookingId, mechanicName, startPulse]);

  // ── Initial region (Manila default if no location yet) ───────────────────
  const initialRegion: Region = {
    latitude: mechanicLocation?.latitude ?? 14.5995,
    longitude: mechanicLocation?.longitude ?? 120.9842,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <View style={[styles.connDot, { backgroundColor: connected ? colors.success[500] : colors.neutral[400] }]} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {mechanicLocation && (
          <Marker coordinate={mechanicLocation} title={mechanicName || 'Mechanic'}>
            <View style={styles.markerWrapper}>
              {/* Pulse ring */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseAnim }], opacity: arrived ? 0 : 0.4 },
                ]}
              />
              {/* Icon */}
              <View style={[styles.markerBubble, arrived && styles.markerArrived]}>
                <Ionicons name={arrived ? 'checkmark' : 'construct'} size={18} color={colors.white} />
              </View>
            </View>
          </Marker>
        )}

        {/* Trail polyline (historical) */}
        {locationHistory.length > 1 && (
          <Polyline
            coordinates={locationHistory}
            strokeColor={colors.neutral[400]}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Future driving route (Border) */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#1b5a90"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {/* Future driving route (Inner) */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#3A82F6"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Target customer marker */}
        {customerTargetState && (
          <Marker
            coordinate={{ latitude: customerTargetState.latitude, longitude: customerTargetState.longitude }}
            title="Your Location"
            pinColor="red"
          />
        )}
      </MapView>

      {/* Info card */}
      <View style={styles.card}>
        {arrived ? (
          <View style={styles.arrivedBanner}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success[600]} />
            <Text style={styles.arrivedText}>Mechanic has arrived!</Text>
          </View>
        ) : mechanicLocation ? (
          <>
            <View style={styles.mechRow}>
              <View style={styles.mechAvatar}>
                <Text style={styles.mechAvatarText}>{(mechanicName || 'M').charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.mechName}>{mechanicName || 'Your Mechanic'}</Text>
                <Text style={styles.mechSub}>On the way • Updated {lastUpdated}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.waitingRow}>
            <Ionicons name="time-outline" size={22} color={colors.neutral[400]} />
            <Text style={styles.waitingText}>
              {connected ? 'Waiting for mechanic to share location…' : 'Connecting…'}
            </Text>
          </View>
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
    zIndex: 10,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  connDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  map: {
    flex: 1,
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
  },
  markerBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.md,
  },
  markerArrived: {
    backgroundColor: colors.success[600],
  },
  card: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  arrivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  arrivedText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success[700],
  },
  mechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mechAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mechAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  mechName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  mechSub: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  waitingText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
});
