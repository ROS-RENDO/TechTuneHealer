import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, type Socket } from 'socket.io-client';
import { useLocationStore } from '../../store';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { AnimatedEntrance } from '../../components';
import { getProviderAvatarUrl } from '../../utils/helpers';

// Conditionally import react-native-maps only on native platforms
let MapView: any = View;
let Marker: any = View;
let Polyline: any = View;
let PROVIDER_DEFAULT: any = undefined;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default || maps;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
  } catch {}
}

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

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

  const mapRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Pulse animation for the mechanic marker ─────────────────────────────
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
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
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRouteCoords(coords);
        return;
      }
    } catch {
      // Smooth fallback path if offline / rate limited
    }

    const fallbackPoints = [0.2, 0.4, 0.6, 0.8].map((fraction) => ({
      latitude: start.latitude + (end.latitude - start.latitude) * fraction + 0.0008 * Math.sin(fraction * Math.PI),
      longitude: start.longitude + (end.longitude - start.longitude) * fraction + 0.0008 * Math.cos(fraction * Math.PI),
    }));
    setRouteCoords([
      { latitude: start.latitude, longitude: start.longitude },
      ...fallbackPoints,
      { latitude: end.latitude, longitude: end.longitude },
    ]);
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

  // ── Initial region (Phnom Penh default if no location yet) ───────────────────
  const initialRegion: Region = {
    latitude: mechanicLocation?.latitude ?? 11.5564,
    longitude: mechanicLocation?.longitude ?? 104.9282,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.neutral[900]} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Live Tracking</Text>
            <View style={[styles.liveStatusPill, { backgroundColor: connected ? "#ECFDF5" : "#F1F5F9" }]}>
              <View
                style={[
                  styles.connDot,
                  { backgroundColor: connected ? colors.success[500] : colors.neutral[400] },
                ]}
              />
              <Text
                style={[
                  styles.liveStatusText,
                  { color: connected ? colors.success[700] : colors.neutral[600] },
                ]}
              >
                {connected ? "LIVE" : "SYNCING"}
              </Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </AnimatedEntrance>

      {/* Map */}
      {Platform.OS === 'web' ? (
        <View style={styles.webMapContainer}>
          <View style={styles.webMapInner}>
            <View style={styles.webGpsHeader}>
              <View style={styles.webPulseDot} />
              <Text style={styles.webGpsHeaderText}>
                LIVE GPS TELEMETRY • PHNOM PENH
              </Text>
            </View>

            {/* Radar Simulation Board */}
            <View style={styles.webMapStage}>
              {/* Route Line */}
              <View style={styles.webRouteLine} />

              {/* Specialist marker */}
              <View style={[styles.webMarkerPos, { top: '35%', left: '25%' }]}>
                <View style={styles.customerHaloRing} />
                <View style={[styles.markerBubble, { backgroundColor: colors.primary[600] }]}>
                  <Ionicons name="navigate" size={16} color={colors.white} />
                </View>
                <View style={styles.webLabelPill}>
                  <Text style={styles.webLabelText}>{mechanicName || 'Specialist'}</Text>
                </View>
              </View>

              {/* Motorist marker */}
              <View style={[styles.webMarkerPos, { top: '65%', left: '70%' }]}>
                <View style={styles.customerHaloRing} />
                <View style={styles.customerMarkerBubble}>
                  <Ionicons name="car" size={16} color={colors.white} />
                </View>
                <View style={styles.webLabelPill}>
                  <Text style={styles.webLabelText}>Your Vehicle</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : (
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
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.customerMarkerContainer}>
                <View style={styles.customerHaloRing} />
                <View style={styles.customerMarkerBubble}>
                  <Ionicons name="car" size={15} color={colors.white} />
                </View>
                <View style={styles.customerLabelPill}>
                  <Text style={styles.customerLabelText}>Your Vehicle</Text>
                </View>
              </View>
            </Marker>
          )}
        </MapView>
      )}

      {/* Info card */}
      <AnimatedEntrance delay={120} direction="up">
        <View style={styles.card}>
          {arrived ? (
            <View style={styles.arrivedBanner}>
              <Ionicons name="checkmark-circle" size={28} color={colors.success[600]} />
              <Text style={styles.arrivedText}>Mechanic has arrived!</Text>
            </View>
          ) : mechanicLocation ? (
            <>
              <View style={styles.mechRow}>
                <Image
                  source={{ uri: getProviderAvatarUrl({ businessName: mechanicName }) }}
                  style={styles.mechAvatarImg}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mechName}>{mechanicName || 'Your Mechanic'}</Text>
                  <Text style={styles.mechSub}>On the way • Updated {lastUpdated || 'just now'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callMechBtn}
                  onPress={() => Linking.openURL('tel:012345678')}
                >
                  <Ionicons name="call" size={18} color={colors.white} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.mechRow}>
              <Image
                source={{ uri: getProviderAvatarUrl({ businessName: mechanicName }) }}
                style={styles.mechAvatarImg}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.mechName}>{mechanicName || 'Assigned Specialist'}</Text>
                <Text style={styles.waitingText}>
                  {connected ? 'Connecting live GPS telemetry…' : 'Connecting to dispatch…'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </AnimatedEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    zIndex: 10,
    ...shadows.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  liveStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  connDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  map: {
    flex: 1,
  },
  markerWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
  },
  markerBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
    ...shadows.md,
  },
  markerArrived: {
    backgroundColor: colors.success[600],
  },
  customerMarkerContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  customerHaloRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  customerMarkerBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
    ...shadows.md,
  },
  customerLabelPill: {
    position: 'absolute',
    top: 52,
    backgroundColor: colors.error[700],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    ...shadows.sm,
  },
  customerLabelText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.3,
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
  mechAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
  mechAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  callMechBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
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
  webMapContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  webMapInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  webGpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  webPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  webGpsHeaderText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  webMapStage: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webRouteLine: {
    position: 'absolute',
    top: '40%',
    left: '28%',
    width: '45%',
    height: 3,
    backgroundColor: '#38BDF8',
    transform: [{ rotate: '32deg' }],
  },
  webMarkerPos: {
    position: 'absolute',
    alignItems: 'center',
  },
  webLabelPill: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  webLabelText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
