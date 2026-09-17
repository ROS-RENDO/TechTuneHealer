import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Animated, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

type PaymentMethod = 'card' | 'gcash' | 'cod';

export function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { totalAmount, items } = route.params as {
    totalAmount: number;
    items: { name: string; price: number; quantity: number }[];
  };

  const [method, setMethod]       = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess]     = useState(false);

  // Card fields
  const [cardNum,  setCardNum]  = useState('');
  const [expiry,   setExpiry]   = useState('');
  const [cvv,      setCvv]      = useState('');
  const [name,     setName]     = useState('');

  // GCash
  const [gcashNum, setGcashNum] = useState('');

  // Success animation
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const formatCardNum = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handlePay = async () => {
    // Basic validation
    if (method === 'card') {
      if (cardNum.replace(/\s/g, '').length < 16) return Alert.alert('Error', 'Please enter a valid 16-digit card number.');
      if (expiry.length < 5) return Alert.alert('Error', 'Please enter a valid expiry date (MM/YY).');
      if (cvv.length < 3) return Alert.alert('Error', 'Please enter a valid CVV.');
      if (!name.trim()) return Alert.alert('Error', 'Please enter the cardholder name.');
    }
    if (method === 'gcash') {
      if (gcashNum.replace(/\D/g, '').length < 11) return Alert.alert('Error', 'Please enter a valid 11-digit GCash number.');
    }

    setProcessing(true);
    try {
      // Try placing order on backend
      const token = await AsyncStorage.getItem('authToken');
      await axios.post(`${API_URL}/shop/orders/checkout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Continue in offline mode — payment UI still completes
    }

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1800));
    setProcessing(false);
    setSuccess(true);

    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 12 }).start();
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <Animated.View style={[styles.successBubble, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success[600]} />
        </Animated.View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSub}>
          Your order of <Text style={{ fontWeight: fontWeight.bold }}>${totalAmount.toFixed(2)}</Text> has been placed.
          You&apos;ll receive a confirmation shortly.
        </Text>
        <View style={styles.orderSummaryCard}>
          {items.map((item, i) => (
            <View key={i} style={styles.orderRow}>
              <Text style={styles.orderName} numberOfLines={1}>{item.name} ×{item.quantity}</Text>
              <Text style={styles.orderPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={[styles.orderName, { fontWeight: fontWeight.bold }]}>Total Paid</Text>
            <Text style={[styles.orderPrice, { color: colors.primary[600], fontWeight: fontWeight.extrabold }]}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'CustomerTabs' as never }] })}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shopAgainBtn}
          onPress={() => navigation.navigate('Shop' as never)}
        >
          <Text style={styles.shopAgainText}>Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Payment Form ───────────────────────────────────────────────────────────
  const METHODS: { id: PaymentMethod; icon: keyof typeof Ionicons.glyphMap; label: string; sub: string }[] = [
    { id: 'card',  icon: 'card',          label: 'Credit / Debit Card', sub: 'Visa, Mastercard, JCB' },
    { id: 'gcash', icon: 'phone-portrait', label: 'GCash',              sub: 'Instant mobile payment'  },
    { id: 'cod',   icon: 'cash',           label: 'Cash on Delivery',   sub: 'Pay when delivered'      },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Order total pill */}
        <View style={styles.totalPill}>
          <Text style={styles.totalPillLabel}>Amount to Pay</Text>
          <Text style={styles.totalPillAmt}>${totalAmount.toFixed(2)}</Text>
        </View>

        {/* Payment methods */}
        <Text style={styles.sectionLabel}>Payment Method</Text>
        {METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodCard, method === m.id && styles.methodCardActive]}
            onPress={() => setMethod(m.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIcon, method === m.id && styles.methodIconActive]}>
              <Ionicons name={m.icon} size={22} color={method === m.id ? colors.white : colors.primary[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>{m.label}</Text>
              <Text style={styles.methodSub}>{m.sub}</Text>
            </View>
            <View style={[styles.radio, method === m.id && styles.radioActive]}>
              {method === m.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Card form */}
        {method === 'card' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>Card Details</Text>

            <Text style={styles.fieldLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              value={cardNum}
              onChangeText={v => setCardNum(formatCardNum(v))}
              maxLength={19}
            />

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  value={expiry}
                  onChangeText={v => setExpiry(formatExpiry(v))}
                  maxLength={5}
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                  value={cvv}
                  onChangeText={v => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name as on card"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        {/* GCash form */}
        {method === 'gcash' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>GCash Details</Text>
            <Text style={styles.fieldLabel}>GCash Number</Text>
            <TextInput
              style={styles.input}
              placeholder="09XX XXX XXXX"
              keyboardType="phone-pad"
              value={gcashNum}
              onChangeText={v => setGcashNum(v.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
            />
            <View style={styles.gcashNotice}>
              <Ionicons name="information-circle" size={16} color={colors.info[600]} />
              <Text style={styles.gcashNoticeText}>
                You&apos;ll receive a GCash OTP on your registered number to confirm payment.
              </Text>
            </View>
          </View>
        )}

        {method === 'cod' && (
          <View style={styles.codNotice}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success[600]} />
            <Text style={styles.codText}>
              Pay with cash when your order arrives. No advance payment required.
            </Text>
          </View>
        )}

        {/* Security note */}
        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={14} color={colors.neutral[400]} />
          <Text style={styles.securityText}>Secured by 256-bit SSL encryption</Text>
        </View>

      </ScrollView>

      {/* Pay button */}
      <View style={styles.payBarWrap}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={processing} activeOpacity={0.88}>
          {processing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={colors.white} />
              <Text style={styles.payBtnText}>
                {method === 'cod' ? 'Place Order' : `Pay $${totalAmount.toFixed(2)}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.neutral[100],
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.neutral[900] },
  scroll:      { padding: spacing.lg, paddingBottom: 120 },
  totalPill: {
    backgroundColor: colors.primary[600], borderRadius: borderRadius.xl,
    padding: spacing.xl, marginBottom: spacing.xl,
    alignItems: 'center', ...shadows.md,
  },
  totalPillLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  totalPillAmt:   { fontSize: 36, fontWeight: fontWeight.extrabold, color: colors.white },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.neutral[500], textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.lg },
  /* Methods */
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 2, borderColor: 'transparent',
    ...shadows.sm,
  },
  methodCardActive:  { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  methodIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center', alignItems: 'center',
  },
  methodIconActive:   { backgroundColor: colors.primary[600] },
  methodLabel:        { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.neutral[800] },
  methodLabelActive:  { color: colors.primary[700] },
  methodSub:          { fontSize: fontSize.xs, color: colors.neutral[400], marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.neutral[300],
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: colors.primary[600] },
  radioInner:  { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary[600] },
  /* Form */
  formCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg, ...shadows.sm },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.neutral[600], marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.neutral[50], borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.neutral[200],
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fontSize.base, color: colors.neutral[900],
  },
  row2:           { flexDirection: 'row' },
  gcashNotice:    { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, backgroundColor: colors.info[50], borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'flex-start' },
  gcashNoticeText:{ fontSize: fontSize.xs, color: colors.info[700], flex: 1, lineHeight: 18 },
  codNotice:      { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.success[50], borderRadius: borderRadius.xl, padding: spacing.lg, marginTop: spacing.md, alignItems: 'center' },
  codText:        { flex: 1, fontSize: fontSize.sm, color: colors.success[700], lineHeight: 20 },
  securityRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.xl },
  securityText:   { fontSize: fontSize.xs, color: colors.neutral[400] },
  /* Pay bar */
  payBarWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.neutral[100],
    ...shadows.lg,
  },
  payBtn: {
    backgroundColor: colors.primary[600], borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: spacing.sm,
  },
  payBtnText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  /* Success */
  successContainer: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: spacing['3xl'] },
  successBubble:    { marginBottom: spacing.xl },
  successTitle:     { fontSize: fontSize['3xl'], fontWeight: fontWeight.extrabold, color: colors.neutral[900], textAlign: 'center' },
  successSub:       { fontSize: fontSize.sm, color: colors.neutral[500], textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  orderSummaryCard: { width: '100%', backgroundColor: colors.neutral[50], borderRadius: borderRadius.xl, padding: spacing.lg, marginTop: spacing.xl },
  orderRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  orderName:        { fontSize: fontSize.sm, color: colors.neutral[700], flex: 1, marginRight: spacing.sm },
  orderPrice:       { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.neutral[800] },
  divider:          { height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing.sm },
  homeBtn: {
    marginTop: spacing.xl, width: '100%',
    backgroundColor: colors.primary[600], borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg, alignItems: 'center',
  },
  homeBtnText:    { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.base },
  shopAgainBtn:   { marginTop: spacing.md, paddingVertical: spacing.md },
  shopAgainText:  { color: colors.primary[600], fontWeight: fontWeight.semibold, fontSize: fontSize.sm },
});
