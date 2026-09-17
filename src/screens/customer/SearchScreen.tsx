import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useLocationStore, useProviderSearchStore } from "../../store";
import { colors, spacing, fontSize, shadows } from "../../constants/theme";
import type { ServiceProvider } from "../../types";
import type { CustomerStackScreenProps } from "../../navigation/types";

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== "web") {
  const mapsModule = require("react-native-maps");
  MapView = mapsModule.default;
  Marker = mapsModule.Marker;
  PROVIDER_GOOGLE = mapsModule.PROVIDER_GOOGLE;
}

const { width } = Dimensions.get("window");

const SERVICE_CATEGORIES = [
  { id: "all", label: "All", icon: "apps" },
  { id: "emergency", label: "Emergency", icon: "warning" },
  { id: "maintenance", label: "Maintenance", icon: "construct" },
  { id: "repair", label: "Repair", icon: "build" },
  { id: "tires", label: "Tires", icon: "disc" },
  { id: "battery", label: "Battery", icon: "battery-charging" },
];

export function SearchScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"CustomerTabs">["navigation"]>();
  const mapRef = useRef<any>(null);
  const { currentLocation } = useLocationStore();
  const { providers, setFilters } = useProviderSearchStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  // Default to list view on web, map on native platforms
  const [viewMode, setViewMode] = useState<"map" | "list">(
    Platform.OS === "web" ? "list" : "map",
  );

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      provider.services.some((s) => s.category === selectedCategory);
    return matchesSearch && (selectedCategory === "all" || matchesCategory);
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFilters({ category: categoryId === "all" ? undefined : categoryId });
  };

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 11.5564,
        longitude: 104.9282,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header & Search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Find a Mechanic</Text>
          <View style={styles.viewToggle}>
            {MapView && (
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  viewMode === "map" && styles.toggleBtnActive,
                ]}
                onPress={() => setViewMode("map")}
              >
                <Ionicons
                  name="map"
                  size={16}
                  color={
                    viewMode === "map" ? colors.white : colors.neutral[500]
                  }
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    viewMode === "map" && styles.toggleBtnTextActive,
                  ]}
                >
                  Map
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === "list" && styles.toggleBtnActive,
              ]}
              onPress={() => setViewMode("list")}
            >
              <Ionicons
                name="list"
                size={16}
                color={viewMode === "list" ? colors.white : colors.neutral[500]}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  viewMode === "list" && styles.toggleBtnTextActive,
                ]}
              >
                List
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.neutral[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, service, location..."
              placeholderTextColor={colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearBtn}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color={colors.neutral[900]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SERVICE_CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                onPress={() => handleCategorySelect(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={isSelected ? colors.white : colors.neutral[600]}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
        {viewMode === "map" && MapView ? (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton
            >
              {filteredProviders.map((provider) => (
                <Marker
                  key={provider.id}
                  coordinate={{
                    latitude: provider.location.latitude,
                    longitude: provider.location.longitude,
                  }}
                  onPress={() =>
                    navigation.navigate("ProviderDetail", {
                      providerId: provider.id,
                    } as any)
                  }
                >
                  <View style={styles.customMarker}>
                    <Ionicons name="construct" size={16} color={colors.white} />
                  </View>
                </Marker>
              ))}
            </MapView>
            <View style={styles.mapBottomSheet}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={filteredProviders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.providerCardsListMap}
                renderItem={({ item }) => (
                  <ProviderMapCard
                    provider={item}
                    onPress={() =>
                      navigation.navigate("ProviderDetail", {
                        providerId: item.id,
                      } as any)
                    }
                  />
                )}
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredProviders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ProviderListCard
                provider={item}
                onPress={() =>
                  navigation.navigate("ProviderDetail", {
                    providerId: item.id,
                  } as any)
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="search"
                    size={32}
                    color={colors.neutral[400]}
                  />
                </View>
                <Text style={styles.emptyStateTitle}>No mechanics found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try a different search or pick another category.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ProviderMapCard({
  provider,
  onPress,
}: {
  provider: ServiceProvider;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.mapCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.mapCardAvatar}>
        <Text style={styles.mapCardAvatarText}>
          {provider.businessName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.mapCardContent}>
        <Text style={styles.mapCardTitle} numberOfLines={1}>
          {provider.businessName}
        </Text>
        <Text style={styles.mapCardAddress} numberOfLines={1}>
          {provider.address}
        </Text>
        <View style={styles.mapCardFooter}>
          <View style={styles.ratingInfo}>
            <Ionicons name="star" size={12} color={colors.warning[500]} />
            <Text style={styles.ratingValue}>{provider.rating.toFixed(1)}</Text>
          </View>
          {provider.isAvailable && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>Available Now</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ProviderListCard({
  provider,
  onPress,
}: {
  provider: ServiceProvider;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.listCardAvatar}>
        <Text style={styles.listCardAvatarText}>
          {provider.businessName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.listCardContent}>
        <View style={styles.listCardHeader}>
          <Text style={styles.listCardTitle} numberOfLines={1}>
            {provider.businessName}
          </Text>
          {provider.isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.primary[500]}
            />
          )}
        </View>
        <Text style={styles.listCardAddress} numberOfLines={1}>
          {provider.address}
        </Text>
        <Text style={styles.listCardDescription} numberOfLines={2}>
          {provider.description}
        </Text>

        <View style={styles.listCardFooter}>
          <View style={styles.ratingInfo}>
            <Ionicons name="star" size={14} color={colors.warning[500]} />
            <Text style={styles.ratingValue}>{provider.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({provider.reviewCount})</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: provider.isAvailable
                  ? colors.success[50]
                  : colors.neutral[100],
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: provider.isAvailable
                    ? colors.success[500]
                    : colors.neutral[400],
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: provider.isAvailable
                    ? colors.success[700]
                    : colors.neutral[600],
                },
              ]}
            >
              {provider.isAvailable ? "Available" : "Busy"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  toggleBtnActive: {
    backgroundColor: colors.neutral[900],
    ...shadows.sm,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  toggleBtnTextActive: {
    color: colors.white,
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.neutral[900],
    fontWeight: "500",
  },
  clearBtn: {
    padding: 4,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  categoriesContainer: {
    backgroundColor: colors.white,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  categoriesList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.sm,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: colors.neutral[900],
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  categoryChipTextSelected: {
    color: colors.white,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: colors.primary[600],
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapBottomSheet: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  providerCardsListMap: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  mapCard: {
    width: width * 0.75,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    marginRight: spacing.md,
    gap: spacing.md,
    ...shadows.lg,
  },
  mapCardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  mapCardAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary[700],
  },
  mapCardContent: {
    flex: 1,
    justifyContent: "center",
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: 2,
  },
  mapCardAddress: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  mapCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  availableBadge: {
    backgroundColor: colors.success[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availableText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success[700],
    textTransform: "uppercase",
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing["4xl"],
  },
  listCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    gap: spacing.md,
    ...shadows.sm,
  },
  listCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  listCardAvatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary[600],
  },
  listCardContent: {
    flex: 1,
  },
  listCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
  },
  listCardAddress: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: "500",
    marginTop: 2,
  },
  listCardDescription: {
    fontSize: 13,
    color: colors.neutral[600],
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  listCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  ratingCount: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 4,
    textAlign: "center",
  },
});
