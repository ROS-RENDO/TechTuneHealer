import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const DEMO_CART = {
  items: [
    { id: '1', quantity: 2, product: { id: '1', name: 'Premium Motor Oil 5W-30 (4L)', price: 29.99 } },
    { id: '2', quantity: 1, product: { id: '2', name: 'Ceramic Brake Pads Set',        price: 45.50 } },
    { id: '3', quantity: 1, product: { id: '7', name: 'Spark Plugs Iridium (Set 4)',   price: 28.00 } },
  ],
};

export function CartScreen() {
  const navigation = useNavigation();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Slide-up animation for bottom bar
  const slideUp = useRef(new Animated.Value(100)).current;
  useEffect(() => {
    Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  }, [slideUp]);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/shop/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch {
      setCart(DEMO_CART);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = useCallback((itemId: string, delta: number) => {
    setCart((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items
          .map((i: any) => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter((i: any) => i.quantity > 0),
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    Alert.alert('Remove item', 'Remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () =>
          setCart((prev: any) => ({ ...prev, items: prev.items.filter((i: any) => i.id !== itemId) })),
      },
    ]);
  }, []);

  const total = cart?.items?.reduce(
    (sum: number, i: any) => sum + i.product.price * i.quantity,
    0
  ) ?? 0;

  const handleCheckout = () => {
    if (!cart?.items?.length) return;
    (navigation as any).navigate('Payment', {
      totalAmount: total,
      items: cart.items.map((i: any) => ({
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      {/* Icon placeholder */}
      <View style={styles.itemIcon}>
        <Ionicons name="cube-outline" size={26} color={colors.primary[500]} />
      </View>

      <View style={styles.itemMid}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemUnitPrice}>${item.product.price.toFixed(2)} each</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
            <Ionicons name="remove" size={16} color={colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
            <Ionicons name="add" size={16} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemRight}>
        <TouchableOpacity onPress={() => removeItem(item.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.error[500]} />
        </TouchableOpacity>
        <Text style={styles.itemTotal}>${(item.product.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  const hasItems = cart?.items?.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {hasItems && (
          <Text style={styles.itemCount}>{cart.items.length} item{cart.items.length > 1 ? 's' : ''}</Text>
        )}
      </View>

      {hasItems ? (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                {cart.items.map((i: any) => (
                  <View key={i.id} style={styles.summaryRow}>
                    <Text style={styles.summaryName} numberOfLines={1}>{i.product.name}</Text>
                    <Text style={styles.summaryVal}>${(i.product.price * i.quantity).toFixed(2)}</Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryName}>Shipping</Text>
                  <Text style={[styles.summaryVal, { color: colors.success[600] }]}>FREE</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryName, { fontWeight: fontWeight.bold }]}>Total</Text>
                  <Text style={styles.totalAmt}>${total.toFixed(2)}</Text>
                </View>
              </View>
            }
          />

          {/* Checkout bottom bar */}
          <Animated.View style={[styles.checkoutBar, { transform: [{ translateY: slideUp }] }]}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalBig}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
              <Ionicons name="card" size={20} color={colors.white} />
              <Text style={styles.checkoutBtnText}>Proceed to Payment</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
        </>
      ) : (
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={80} color={colors.neutral[200]} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Browse our shop to find the parts you need</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Shop' as never)}>
            <Text style={styles.shopBtnText}>Browse Shop</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.neutral[100],
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.neutral[900] },
  itemCount:   { fontSize: fontSize.sm, color: colors.neutral[500] },
  list:        { padding: spacing.md, paddingBottom: 120 },
  cartItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    padding: spacing.md, marginBottom: spacing.sm,
    ...shadows.sm,
  },
  itemIcon: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: colors.primary[50],
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  itemMid:      { flex: 1 },
  itemName:     { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.neutral[900], lineHeight: 18 },
  itemUnitPrice:{ fontSize: fontSize.xs, color: colors.neutral[400], marginTop: 2 },
  qtyRow:       { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center', alignItems: 'center',
  },
  qtyNum: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.neutral[900], minWidth: 24, textAlign: 'center' },
  itemRight:  { alignItems: 'flex-end', gap: spacing.md, paddingLeft: spacing.sm },
  itemTotal:  { fontSize: fontSize.base, fontWeight: fontWeight.extrabold, color: colors.neutral[900] },
  /* Summary card */
  summaryCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    padding: spacing.lg, ...shadows.sm, marginTop: spacing.sm,
  },
  summaryTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.neutral[900], marginBottom: spacing.md },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryName:  { fontSize: fontSize.sm, color: colors.neutral[600], flex: 1, marginRight: spacing.sm },
  summaryVal:   { fontSize: fontSize.sm, color: colors.neutral[700], fontWeight: fontWeight.medium },
  divider:      { height: 1, backgroundColor: colors.neutral[100], marginVertical: spacing.sm },
  totalAmt:     { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.primary[600] },
  /* Checkout bar */
  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, padding: spacing.lg,
    borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'],
    ...shadows.lg,
  },
  totalRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  totalLabel:{ fontSize: fontSize.sm, color: colors.neutral[500] },
  totalBig:  { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.neutral[900] },
  checkoutBtn: {
    backgroundColor: colors.primary[600], borderRadius: borderRadius.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, gap: spacing.sm,
    ...shadows.md,
  },
  checkoutBtnText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold, flex: 1, textAlign: 'center' },
  /* Empty */
  emptyWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['3xl'] },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.neutral[800], marginTop: spacing.lg },
  emptySub:   { fontSize: fontSize.sm, color: colors.neutral[500], textAlign: 'center', marginTop: spacing.sm },
  shopBtn: {
    marginTop: spacing.xl, backgroundColor: colors.primary[600],
    borderRadius: borderRadius.xl, paddingVertical: spacing.md, paddingHorizontal: spacing['3xl'],
  },
  shopBtnText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.base },
});
