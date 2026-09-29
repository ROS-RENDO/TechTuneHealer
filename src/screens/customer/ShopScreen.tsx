import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows } from '../../constants/theme';
import { AnimatedEntrance } from '../../components';
import axios from 'axios';

const { width } = Dimensions.get('window');
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
  brand?: string;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  All:         'grid-outline',
  Fluids:      'water-outline',
  Brakes:      'disc-outline',
  Tires:       'ellipse-outline',
  Electrical:  'flash-outline',
  Filters:     'funnel-outline',
  Ignition:    'sparkles-outline',
  Wipers:      'rainy-outline',
  Diagnostics: 'hardware-chip-outline',
  Tools:       'build-outline',
};

// Rich default OEM catalog fallback
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'fb-1',
    name: 'Mobil 1 Advanced Full Synthetic 5W-30 (1L)',
    price: 34.99,
    originalPrice: 42.00,
    imageUrl: null,
    brand: 'Mobil 1',
    description: 'Triple Action Formula engineered to deliver outstanding engine performance, protection, and cleanliness.',
    category: { name: 'Fluids' },
  },
  {
    id: 'fb-2',
    name: 'Brembo Premium Ceramic Front Brake Pads',
    price: 58.50,
    originalPrice: 72.00,
    imageUrl: null,
    brand: 'Brembo',
    description: 'OE-equivalent formulation designed to minimize brake dust and eliminate pedal noise.',
    category: { name: 'Brakes' },
  },
  {
    id: 'fb-3',
    name: 'Bosch QuietCast Disc Brake Rotor (Front Single)',
    price: 48.00,
    imageUrl: null,
    brand: 'Bosch',
    description: 'Precision balanced rotor preventing pedal pulsation with aluminum-zinc anti-corrosion coating.',
    category: { name: 'Brakes' },
  },
  {
    id: 'fb-4',
    name: 'VARTA AGM Start-Stop High Performance Battery 12V 70Ah',
    price: 119.99,
    originalPrice: 145.00,
    imageUrl: null,
    brand: 'VARTA',
    description: 'Absorbent Glass Mat technology offering 3x the cyclic life of conventional lead-acid batteries.',
    category: { name: 'Electrical' },
  },
  {
    id: 'fb-5',
    name: 'Castrol GTX Ultraclean 10W-40 Synthetic Blend (4L)',
    price: 38.00,
    imageUrl: null,
    brand: 'Castrol',
    description: 'Double-action formula clears away old sludge and protects against new sludge formation.',
    category: { name: 'Fluids' },
  },
  {
    id: 'fb-6',
    name: 'Michelin Pilot Sport 4 Tyre 215/55 R17 98Y',
    price: 135.00,
    originalPrice: 160.00,
    imageUrl: null,
    brand: 'Michelin',
    description: 'Dynamic response technology ensuring optimal steering precision and exceptional wet grip.',
    category: { name: 'Tires' },
  },
  {
    id: 'fb-7',
    name: 'K&N High-Flow Performance Engine Air Filter',
    price: 49.99,
    imageUrl: null,
    brand: 'K&N',
    description: 'Washable and reusable oiled cotton gauze designed to increase horsepower and acceleration.',
    category: { name: 'Filters' },
  },
  {
    id: 'fb-8',
    name: 'Bosch HEPA Activated Carbon Cabin Air Filter',
    price: 24.50,
    originalPrice: 32.00,
    imageUrl: null,
    brand: 'Bosch',
    description: 'Filters 99.97% of microscopic allergens, airborne bacteria, and toxic exhaust fumes.',
    category: { name: 'Filters' },
  },
  {
    id: 'fb-9',
    name: 'NGK Laser Iridium Long-Life Spark Plugs (Pack of 4)',
    price: 39.00,
    originalPrice: 48.00,
    imageUrl: null,
    brand: 'NGK',
    description: 'Laser-welded iridium center electrode tip ensures high durability and consistently stable spark.',
    category: { name: 'Ignition' },
  },
  {
    id: 'fb-10',
    name: 'Bosch Aerotwin Frameless Wiper Blades Pair (26" + 18")',
    price: 29.90,
    imageUrl: null,
    brand: 'Bosch',
    description: 'Power Protection Plus rubber technology with patented coating for streak-free silent wiping.',
    category: { name: 'Wipers' },
  },
  {
    id: 'fb-11',
    name: 'LAUNCH CRP129E Professional OBD-II Diagnostic Scanner',
    price: 149.00,
    originalPrice: 189.00,
    imageUrl: null,
    brand: 'LAUNCH',
    description: '4-system diagnostic tool with oil/EPB/SAS/TPMS/throttle reset and live data graph streaming.',
    category: { name: 'Diagnostics' },
  },
  {
    id: 'fb-12',
    name: 'Prestone Extended Life Antifreeze / Coolant 50/50 (3.78L)',
    price: 22.50,
    imageUrl: null,
    brand: 'Prestone',
    description: 'Cor-Guard technology provides guaranteed protection against corrosion, freeze-up, and boil-over.',
    category: { name: 'Fluids' },
  },
];

const MOCK_META: Record<string, { rating: number; sold: number; badge?: string }> = {
  'Mobil 1 Advanced Full Synthetic 5W-30 (1L)':            { rating: 4.9, sold: 412, badge: 'Best Seller' },
  'Brembo Premium Ceramic Front Brake Pads':              { rating: 4.8, sold: 188, badge: 'OEM Spec' },
  'Bosch QuietCast Disc Brake Rotor (Front Single)':      { rating: 4.7, sold: 124 },
  'VARTA AGM Start-Stop High Performance Battery 12V 70Ah':{ rating: 4.9, sold: 310, badge: 'Top Rated' },
  'Castrol GTX Ultraclean 10W-40 Synthetic Blend (4L)':   { rating: 4.6, sold: 290 },
  'Michelin Pilot Sport 4 Tyre 215/55 R17 98Y':           { rating: 4.9, sold: 145, badge: 'Premium' },
  'K&N High-Flow Performance Engine Air Filter':          { rating: 4.8, sold: 380 },
  'Bosch HEPA Activated Carbon Cabin Air Filter':         { rating: 4.7, sold: 620 },
  'NGK Laser Iridium Long-Life Spark Plugs (Pack of 4)':  { rating: 4.9, sold: 540, badge: 'Popular' },
  'Bosch Aerotwin Frameless Wiper Blades Pair (26" + 18")':{ rating: 4.6, sold: 890 },
  'LAUNCH CRP129E Professional OBD-II Diagnostic Scanner': { rating: 4.8, sold: 215, badge: 'Pro Tech' },
  'Prestone Extended Life Antifreeze / Coolant 50/50 (3.78L)':{ rating: 4.7, sold: 470 },
};

export function ShopScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/shop/products`, { timeout: 4000 });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setProducts(response.data);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch {
      // Offline / fallback
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleQuickAdd = (id: string) => {
    setAddedItems((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1400);
  };

  // Enrich products with metadata
  const enriched = useMemo(() => {
    return products.map((p) => {
      const meta = MOCK_META[p.name] ?? { rating: 4.7, sold: 120 };
      return {
        ...p,
        rating: meta.rating,
        sold: meta.sold,
        badge: meta.badge,
        brand: p.brand || p.name.split(' ')[0] || 'TechTune',
      };
    });
  }, [products]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    enriched.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return ['All', ...Array.from(set)];
  }, [enriched]);

  const deals = useMemo(() => {
    return enriched.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 5);
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter((p) => {
      const matchCat = activeCategory === 'All' || p.category?.name === activeCategory;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [enriched, activeCategory, search]);

  const renderProduct = ({ item }: { item: Product & { rating?: number; sold?: number; badge?: string; brand?: string } }) => {
    const icon = CATEGORY_ICONS[item.category?.name ?? ''] ?? 'construct-outline';
    const discount =
      item.originalPrice && item.originalPrice > item.price
        ? Math.round((1 - item.price / item.originalPrice) * 100)
        : null;
    const isFav = wishlist.has(item.id);
    const isAdded = addedItems.has(item.id);

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.88}
        onPress={() => (navigation as any).navigate('ProductDetail', { productId: item.id })}
      >
        {/* Product Image & Top Visual Container */}
        <View style={styles.imageBox}>
          {discount !== null && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          {item.badge && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{item.badge}</Text>
            </View>
          )}

          {/* Wishlist Heart */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={17}
              color={isFav ? '#EF4444' : '#64748B'}
            />
          </TouchableOpacity>

          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl}` }}
              style={styles.productImage}
            />
          ) : (
            <View style={styles.iconBackdrop}>
              <View style={styles.iconCircle}>
                <Ionicons name={icon} size={30} color="#2563EB" />
              </View>
            </View>
          )}

          {/* Genuine OEM watermark tag */}
          <View style={styles.genuinePill}>
            <Ionicons name="shield-checkmark" size={10} color="#2563EB" />
            <Text style={styles.genuineText}>100% Genuine</Text>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.productBody}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brand} · {item.category?.name ?? 'General'}
          </Text>

          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Rating & Sold */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingStarBox}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingVal}>{item.rating?.toFixed(1)}</Text>
            </View>
            <Text style={styles.ratingDot}>·</Text>
            <Text style={styles.soldText}>{item.sold} sold</Text>
          </View>

          {/* Price & Action Row */}
          <View style={styles.bottomRow}>
            <View style={styles.priceCol}>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
              onPress={() => handleQuickAdd(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isAdded ? 'checkmark' : 'cart-outline'}
                size={14}
                color="#FFF"
              />
              <Text style={styles.addBtnText}>{isAdded ? 'Added' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingFull}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Connecting to Genuine Auto Parts Hub…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Top Header ── */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.neutral[800]} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Auto Parts & Spares</Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={12} color="#2563EB" />
              <Text style={styles.headerSub}>Certified OEM & Aftermarket Spares</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('Cart' as never)}
            activeOpacity={0.8}
            accessibilityLabel="View Cart"
          >
            <Ionicons name="cart" size={20} color="#FFF" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </AnimatedEntrance>

      {/* ── Search & Filter Bar ── */}
      <AnimatedEntrance delay={60} direction="up">
        <View style={styles.searchSection}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={17} color="#2563EB" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search parts, brands, OEM numbers..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AnimatedEntrance>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Flash Deals Banner ── */}
            {deals.length > 0 && (
              <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dealsBanner}
              >
                <View style={styles.dealsHeaderRow}>
                  <View>
                    <View style={styles.dealsBadgeRow}>
                      <View style={styles.dealsPulseDot} />
                      <Text style={styles.dealsBadgeText}>FLASH SAVINGS</Text>
                    </View>
                    <Text style={styles.dealsTitle}>Genuine Parts On Sale</Text>
                    <Text style={styles.dealsSub}>Save up to 35% on certified OEM spares</Text>
                  </View>

                  <View style={styles.dealsDiscountPill}>
                    <Text style={styles.dealsDiscountPillText}>LIMITED TIME</Text>
                  </View>
                </View>

                {/* Horizontal Scroll of Deals */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsScroll}>
                  {deals.map((deal) => {
                    const discPct = deal.originalPrice
                      ? Math.round((1 - deal.price / deal.originalPrice) * 100)
                      : 0;
                    const icon = CATEGORY_ICONS[deal.category?.name ?? ''] ?? 'construct-outline';
                    return (
                      <TouchableOpacity
                        key={deal.id}
                        style={styles.dealCard}
                        onPress={() => (navigation as any).navigate('ProductDetail', { productId: deal.id })}
                        activeOpacity={0.88}
                      >
                        <View style={styles.dealIconBox}>
                          <Ionicons name={icon} size={22} color="#2563EB" />
                          {discPct > 0 && (
                            <View style={styles.dealPctBadge}>
                              <Text style={styles.dealPctText}>-{discPct}%</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.dealBrandText}>{deal.brand || 'OEM'}</Text>
                        <Text style={styles.dealName} numberOfLines={2}>
                          {deal.name}
                        </Text>

                        <View style={styles.dealPriceRow}>
                          <Text style={styles.dealPrice}>${deal.price.toFixed(2)}</Text>
                          {deal.originalPrice && (
                            <Text style={styles.dealOriginal}>${deal.originalPrice.toFixed(2)}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </LinearGradient>
            )}

            {/* ── Category Pill Filter Rail ── */}
            <View style={styles.catSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catContent}
              >
                {allCategories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const iconName = CATEGORY_ICONS[cat] ?? 'cube-outline';
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catPill, isActive && styles.catPillActive]}
                      onPress={() => setActiveCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={iconName}
                        size={14}
                        color={isActive ? '#FFF' : '#64748B'}
                      />
                      <Text style={[styles.catPillText, isActive && styles.catPillTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Section Title & Item Count ── */}
            <View style={styles.catalogHeader}>
              <Text style={styles.catalogTitle}>
                {activeCategory === 'All' ? 'All Automotive Parts' : activeCategory}
              </Text>
              <Text style={styles.catalogCount}>{filtered.length} items available</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={38} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Matching Spares Found</Text>
            <Text style={styles.emptyText}>
              {search
                ? `No auto parts matched "${search}". Try searching by brand, viscosity, or category.`
                : 'Pull down to refresh inventory.'}
            </Text>
            {search.length > 0 && (
              <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearch('')}>
                <Text style={styles.clearSearchBtnText}>Clear Search Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  headerSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },

  /* ── Search Bar ── */
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[900],
  },

  /* ── Grid Layout ── */
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: 110,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  /* ── Flash Deals Banner ── */
  dealsBanner: {
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginBottom: 16,
    ...shadows.md,
  },
  dealsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dealsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  dealsPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
  },
  dealsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.8,
  },
  dealsTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  dealsSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: 1,
  },
  dealsDiscountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  dealsDiscountPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  dealsScroll: {
    marginHorizontal: -4,
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    width: 140,
    ...shadows.sm,
  },
  dealIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  dealPctBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  dealPctText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  dealBrandText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  dealName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: 15,
    marginTop: 2,
    height: 30,
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 8,
  },
  dealPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2563EB',
  },
  dealOriginal: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  /* ── Category Pill Filter ── */
  catSection: {
    marginBottom: 14,
  },
  catContent: {
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    ...shadows.sm,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },

  /* ── Catalog Title & Count ── */
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  catalogTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.2,
  },
  catalogCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  /* ── Product Card ── */
  productCard: {
    width: (width - spacing.md * 2 - 10) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...shadows.sm,
  },
  imageBox: {
    height: 126,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  iconBackdrop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  metaBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  metaBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.sm,
  },
  genuinePill: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genuineText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#2563EB',
  },

  /* ── Product Body ── */
  productBody: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  productBrand: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[900],
    lineHeight: 16,
    marginTop: 2,
    height: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingStarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingVal: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.neutral[800],
  },
  ratingDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  soldText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },

  /* ── Price & Action ── */
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceCol: {
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  originalPrice: {
    fontSize: 9,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: -1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    ...shadows.sm,
  },
  addBtnSuccess: {
    backgroundColor: '#16A34A',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ── Empty State ── */
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  clearSearchBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  clearSearchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
