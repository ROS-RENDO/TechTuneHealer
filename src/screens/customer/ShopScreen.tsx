import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  imageUrl: string | null;
  description?: string;
  category?: { name: string };
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Fluids:      'water',
  Brakes:      'disc',
  Tires:       'ellipse',
  Electrical:  'flash',
  Filters:     'funnel',
  Ignition:    'sparkles',
  Wipers:      'rainy',
  Suspension:  'car-sport',
  Diagnostics: 'scan',
  Accessories: 'apps',
};

// Simulated ratings / sold counts for display (backend doesn't store these yet)
const MOCK_META: Record<string, { rating: number; sold: number; originalPrice?: number }> = {
  'Mobil 1 Full Synthetic 5W-30 (1L)':      { rating: 4.8, sold: 312, originalPrice: 39.99 },
  'Castrol GTX 10W-40 Semi Synthetic (1L)': { rating: 4.6, sold: 189 },
  'Radiator Coolant / Antifreeze 1L':       { rating: 4.5, sold: 1200 },
  'Brembo Brake Pads Front Set':            { rating: 4.7, sold: 88,  originalPrice: 68.00 },
  'Bosch Disc Brake Rotor (Single)':        { rating: 4.5, sold: 64 },
  'All-Season Tire 205/55R16':              { rating: 4.6, sold: 97 },
  'AGM Car Battery 12V 60Ah':              { rating: 4.9, sold: 254, originalPrice: 99.99 },
  'LED Headlight Bulbs H7 Pair':           { rating: 4.8, sold: 570, originalPrice: 45.00 },
  'Air Filter K&N Performance':            { rating: 4.5, sold: 421 },
  'Cabin Air Filter (Carbon)':             { rating: 4.4, sold: 880 },
  'NGK Iridium Spark Plugs (Set of 4)':    { rating: 4.7, sold: 564, originalPrice: 36.00 },
  'Bosch Aerotwin Wiper Blades (Pair)':    { rating: 4.3, sold: 730 },
  'Monroe Shock Absorber Front Pair':      { rating: 4.6, sold: 68 },
  'LAUNCH CRP129E OBD2 Scanner':           { rating: 4.8, sold: 390, originalPrice: 99.99 },
  '4K Dash Cam with Night Vision':         { rating: 4.7, sold: 215 },
  'Car Vacuum Cleaner 12V 120W':           { rating: 4.4, sold: 310 },
};

export function ShopScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/shop/products`);
      if (response.data?.length > 0) setProducts(response.data);
    } catch {
      // backend unreachable – leave empty for clean UX
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Merge backend products with display metadata
  const enriched = useMemo(() =>
    products.map(p => ({ ...p, ...(MOCK_META[p.name] ?? { rating: 4.5, sold: 50 }) }))
  , [products]);

  const allCategories = useMemo(() =>
    ['All', ...Array.from(new Set(products.map(p => p.category?.name ?? 'General')))]
  , [products]);

  const deals = useMemo(() =>
    enriched.filter(p => (p as any).originalPrice).slice(0, 4)
  , [enriched]);

  const filtered = useMemo(() =>
    enriched.filter(p => {
      const matchCat = activeCategory === 'All' || p.category?.name === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
  , [enriched, activeCategory, search]);

  const renderProduct = ({ item }: { item: Product & { rating?: number; sold?: number; originalPrice?: number } }) => {
    const icon = CATEGORY_ICONS[item.category?.name ?? ''] ?? 'construct';
    const discount = item.originalPrice
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.85}
        onPress={() => (navigation as any).navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.imageBox}>
          {discount !== null && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
          {item.imageUrl
            ? <Image source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl}` }} style={styles.productImage} />
            : (
              <View style={styles.iconCircle}>
                <Ionicons name={icon} size={32} color={colors.primary[600]} />
              </View>
            )
          }
        </View>

        <View style={styles.productBody}>
          <Text style={styles.productCat}>{item.category?.name ?? 'General'}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#FBBF24" />
            <Text style={styles.ratingText}>{item.rating?.toFixed(1)} · {item.sold} sold</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
          </View>

          {/* Quick-add button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => (navigation as any).navigate('ProductDetail', { productId: item.id })}
          >
            <Ionicons name="cart-outline" size={14} color={colors.white} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingFull}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading shop…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Auto Parts Shop</Text>
          <Text style={styles.headerSub}>{filtered.length} products available</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart' as never)}>
          <Ionicons name="cart" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.neutral[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search parts, accessories..."
          placeholderTextColor={colors.neutral[400]}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(true)} tintColor={colors.primary[600]} />
        }
        ListHeaderComponent={
          <>
            {/* ── Flash Deals banner ── */}
            {deals.length > 0 && (
              <LinearGradient
                colors={['#1E3A8A', '#2563EB', '#60A5FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dealsBanner}
              >
                <View style={styles.dealsHeaderRow}>
                  <View>
                    <Text style={styles.dealsTitle}>⚡ Flash Deals</Text>
                    <Text style={styles.dealsSub}>Limited-time savings — grab them now</Text>
                  </View>
                  <View style={styles.dealsBadge}>
                    <Text style={styles.dealsBadgeText}>{deals.length} offers</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsScroll}>
                  {deals.map(deal => {
                    const discPct = deal.originalPrice
                      ? Math.round((1 - deal.price / deal.originalPrice) * 100)
                      : 0;
                    const icon = CATEGORY_ICONS[deal.category?.name ?? ''] ?? 'construct';
                    return (
                      <TouchableOpacity
                        key={deal.id}
                        style={styles.dealCard}
                        onPress={() => (navigation as any).navigate('ProductDetail', { productId: deal.id })}
                      >
                        <View style={styles.dealIconWrap}>
                          <Ionicons name={icon} size={22} color={colors.primary[600]} />
                        </View>
                        {discPct > 0 && (
                          <View style={styles.dealPctBadge}>
                            <Text style={styles.dealPctText}>-{discPct}%</Text>
                          </View>
                        )}
                        <Text style={styles.dealName} numberOfLines={2}>{deal.name}</Text>
                        <Text style={styles.dealPrice}>${deal.price.toFixed(2)}</Text>
                        <Text style={styles.dealOriginal}>${deal.originalPrice?.toFixed(2)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </LinearGradient>
            )}

            {/* ── Category Pills ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
              {allCategories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  {cat !== 'All' && (
                    <Ionicons
                      name={CATEGORY_ICONS[cat] ?? 'construct'}
                      size={13}
                      color={activeCategory === cat ? colors.white : colors.neutral[500]}
                    />
                  )}
                  <Text style={[styles.catPillText, activeCategory === cat && styles.catPillTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.gridTitle}>
              {activeCategory === 'All' ? 'All Products' : activeCategory}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={52} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              {search ? `No results for "${search}"` : 'Pull down to refresh'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F1F5F9' },
  loadingFull:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  loadingText:  { marginTop: spacing.md, fontSize: fontSize.sm, color: colors.neutral[500] },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.neutral[100],
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.neutral[900] },
  headerSub:   { fontSize: fontSize.xs, color: colors.neutral[500], marginTop: 2 },
  cartBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary[600],
    alignItems: 'center', justifyContent: 'center', ...shadows.md,
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg, marginVertical: spacing.md,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.neutral[200], ...shadows.sm,
  },
  searchIcon:  { marginRight: spacing.sm },
  searchInput: { flex: 1, height: 46, fontSize: fontSize.sm, color: colors.neutral[900] },

  grid: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  row:  { justifyContent: 'space-between', marginBottom: spacing.md },

  /* Flash Deals */
  dealsBanner: { borderRadius: 20, padding: spacing.lg, marginBottom: spacing.md, overflow: 'hidden' },
  dealsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  dealsTitle:  { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.white },
  dealsSub:    { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  dealsBadge:  { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dealsBadgeText: { fontSize: 11, fontWeight: fontWeight.bold, color: colors.white },
  dealsScroll: { },
  dealCard: {
    backgroundColor: colors.white, borderRadius: 16,
    padding: spacing.md, marginRight: spacing.sm, width: 128,
  },
  dealIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  dealPctBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#EF4444', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  dealPctText:   { fontSize: 10, fontWeight: fontWeight.bold, color: colors.white },
  dealName:      { fontSize: 11, color: colors.neutral[700], fontWeight: fontWeight.semibold, lineHeight: 15, marginBottom: 4 },
  dealPrice:     { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.primary[700] },
  dealOriginal:  { fontSize: 10, color: colors.neutral[400], textDecorationLine: 'line-through' },

  /* Category pills */
  catScroll:         { marginBottom: spacing.sm },
  catContent:        { paddingHorizontal: spacing.md, gap: spacing.xs },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: borderRadius.full, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.neutral[200], marginRight: 6,
  },
  catPillActive:     { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  catPillText:       { fontSize: 13, color: colors.neutral[600], fontWeight: fontWeight.medium },
  catPillTextActive: { color: colors.white, fontWeight: fontWeight.bold },

  gridTitle: {
    fontSize: fontSize.base, fontWeight: fontWeight.bold,
    color: colors.neutral[800], marginBottom: spacing.md, marginTop: spacing.xs,
  },

  /* Product card */
  productCard: {
    width: '48.5%', backgroundColor: colors.white,
    borderRadius: 16, overflow: 'hidden', ...shadows.sm,
  },
  imageBox: {
    height: 120, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primary[50],
    justifyContent: 'center', alignItems: 'center',
  },
  productImage:  { width: '100%', height: '100%', resizeMode: 'cover' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#EF4444', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, zIndex: 1,
  },
  discountText:  { fontSize: 10, fontWeight: fontWeight.bold, color: colors.white },
  productBody:   { padding: spacing.sm },
  productCat:    { fontSize: 10, color: colors.primary[600], fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: 2 },
  productName:   { fontSize: 12, fontWeight: fontWeight.semibold, color: colors.neutral[900], height: 34, lineHeight: 17 },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText:    { fontSize: 10, color: colors.neutral[500] },
  priceRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
  productPrice:  { fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.neutral[900] },
  originalPrice: { fontSize: 10, color: colors.neutral[400], textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: spacing.sm,
    backgroundColor: colors.primary[600], borderRadius: 8,
    paddingVertical: 6,
  },
  addBtnText:    { fontSize: 11, fontWeight: fontWeight.bold, color: colors.white },

  /* Empty */
  emptyWrap:  { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.neutral[700], marginTop: spacing.md },
  emptyText:  { fontSize: fontSize.sm, color: colors.neutral[500], marginTop: 4 },
});
