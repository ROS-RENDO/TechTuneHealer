import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export function AdminDashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = 'MOCK_ADMIN_TOKEN'; // In a real app, this comes from auth store
      const response = await axios.get(`${API_URL}/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
      // Fallback dummy data
      setData({
        metrics: {
          totalUsers: 142,
          activeProviders: 38,
          totalBookings: 856,
          totalOrders: 112,
          totalRevenue: 5430.50
        },
        recentBookings: [
          { id: '1', createdAt: new Date().toISOString(), customer: { name: 'John Doe' }, provider: { businessName: 'AutoFix Pro' } },
          { id: '2', createdAt: new Date(Date.now() - 86400000).toISOString(), customer: { name: 'Jane Smith' }, provider: { businessName: 'Quick Lube' } }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  const { metrics, recentBookings } = data || {};

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={fetchMetrics}>
          <Ionicons name="refresh" size={24} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Overview</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.info[100] }]}>
              <Ionicons name="people" size={24} color={colors.info[600]} />
            </View>
            <Text style={styles.metricValue}>{metrics?.totalUsers || 0}</Text>
            <Text style={styles.metricLabel}>Customers</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success[100] }]}>
              <Ionicons name="construct" size={24} color={colors.success[600]} />
            </View>
            <Text style={styles.metricValue}>{metrics?.activeProviders || 0}</Text>
            <Text style={styles.metricLabel}>Providers</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warning[100] }]}>
              <Ionicons name="calendar" size={24} color={colors.warning[600]} />
            </View>
            <Text style={styles.metricValue}>{metrics?.totalBookings || 0}</Text>
            <Text style={styles.metricLabel}>Bookings</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="cart" size={24} color={colors.primary[600]} />
            </View>
            <Text style={styles.metricValue}>{metrics?.totalOrders || 0}</Text>
            <Text style={styles.metricLabel}>Shop Orders</Text>
          </View>
        </View>

        <View style={styles.revenueCard}>
          <View>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueValue}>${(metrics?.totalRevenue || 0).toFixed(2)}</Text>
          </View>
          <View style={[styles.iconContainer, { backgroundColor: colors.success[100], width: 56, height: 56, borderRadius: 28 }]}>
            <Ionicons name="cash" size={32} color={colors.success[600]} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Recent Bookings</Text>
        
        <View style={styles.listContainer}>
          {recentBookings?.length > 0 ? (
            recentBookings.map((booking: any) => (
              <View key={booking.id} style={styles.listItem}>
                <View style={styles.listItemIcon}>
                  <Ionicons name="car" size={20} color={colors.primary[600]} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{booking.customer?.name} → {booking.provider?.businessName}</Text>
                  <Text style={styles.listItemSubtitle}>{new Date(booking.createdAt).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent bookings found.</Text>
          )}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  metricLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    fontWeight: fontWeight.medium,
  },
  revenueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  revenueLabel: {
    fontSize: fontSize.base,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  listItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  listItemSubtitle: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  emptyText: {
    padding: spacing.lg,
    textAlign: 'center',
    color: colors.neutral[500],
  },
});
