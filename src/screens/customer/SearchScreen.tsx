import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useLocationStore, useProviderSearchStore } from "../../store";
import { colors, spacing, fontSize, shadows } from "../../constants/theme";
import type { ServiceProvider } from "../../types";
import type { CustomerStackScreenProps } from "../../navigation/types";
import { getFormattedDistance, getProviderAvatarUrl, openMaps } from "../../utils/helpers";
import { ENERGY_STATIONS, type EnergyStation } from "../../data/energyStations";
import { AnimatedEntrance } from "../../components/AnimatedEntrance";

// Conditionally import react-native-maps only on native platforms
let MapView: any = View;
let Marker: any = View;
let PROVIDER_DEFAULT: any = undefined;

if (Platform.OS !== "web") {
  try {
    const maps = require("react-native-maps");
    MapView = maps.default || maps;
    Marker = maps.Marker;
    PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
  } catch {}
}

const { width } = Dimensions.get("window");

const SERVICE_CATEGORIES = [
  { id: "all", label: "All", icon: "apps" },
  { id: "fuel", label: "Fuel ⛽", icon: "flame" },
  { id: "ev", label: "EV Fast ⚡", icon: "flash" },
  { id: "emergency", label: "Emergency", icon: "warning" },
  { id: "maintenance", label: "Maintenance", icon: "construct" },
  { id: "repair", label: "Repair", icon: "build" },
  { id: "tires", label: "Tires", icon: "disc" },
  { id: "battery", label: "Battery", icon: "battery-charging" },
];

export function SearchScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"CustomerTabs">["navigation"]>();
  const route = useRoute<any>();
  const mapRef = useRef<any>(null);
  const { currentLocation } = useLocationStore();
  const { searchProviders, providers, setFilters } = useProviderSearchStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    route?.params?.category || "all"
  );
  const [selectedStation, setSelectedStation] = useState<EnergyStation | null>(null);
  // Default to list view on web, map on native platforms
  const [viewMode, setViewMode] = useState<"map" | "list">(
    Platform.OS === "web" ? "list" : "map",
  );

  useEffect(() => {
    if (route?.params?.category) {
      setSelectedCategory(route.params.category);
      setFilters({
        category:
          route.params.category === "all" ||
          route.params.category === "fuel" ||
          route.params.category === "ev"
            ? undefined
            : route.params.category,
      });
    }
  }, [route?.params?.category]);

  useEffect(() => {
    const loc = currentLocation || { latitude: 11.5564, longitude: 104.9282 };
    searchProviders(loc).catch(() => {});
  }, [currentLocation]);

  const isFuelCategory = selectedCategory === "fuel";
  const isEvCategory = selectedCategory === "ev";
  const isStationCategory = isFuelCategory || isEvCategory;

  const filteredStations = ENERGY_STATIONS.filter((station) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      station.name.toLowerCase().includes(q) ||
      station.address.toLowerCase().includes(q) ||
      station.brand.toLowerCase().includes(q) ||
      (station.province && station.province.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (isFuelCategory) return station.type === "fuel";
    if (isEvCategory) return station.type === "ev";
    if (selectedCategory === "all") return true;
    return false;
  });

  const filteredProviders = (isStationCategory ? [] : providers).filter((provider) => {
    const name = provider.businessName || "";
    const addr = provider.address || "";
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(q) || addr.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "all" ||
      (provider.services &&
        provider.services.some(
          (s: any) =>
            s.category === selectedCategory ||
            s.name?.toLowerCase().includes(selectedCategory)
        ));
    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedStation(null);
    setFilters({
      category:
        categoryId === "all" || categoryId === "fuel" || categoryId === "ev"
          ? undefined
          : categoryId,
    });
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
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>
              {isFuelCategory
                ? "Fuel Stations in Cambodia"
                : isEvCategory
                ? "EV Supercharging Hubs"
                : "Find Mechanics & Energy"}
            </Text>
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
      </AnimatedEntrance>

      {/* Categories */}
      <AnimatedEntrance delay={80} direction="down">
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
      </AnimatedEntrance>

      {/* Content */}
      <AnimatedEntrance delay={140} direction="up" style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
        {viewMode === "map" ? (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={initialRegion}
              showsUserLocation={!!currentLocation}
              showsMyLocationButton={false}
              loadingEnabled={true}
            >
              {/* Mechanic Providers */}
              {!isStationCategory &&
                filteredProviders.map((provider) => {
                  const lat = provider.location?.latitude ?? (provider as any).lat;
                  const lng = provider.location?.longitude ?? (provider as any).lng;
                  if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
                    return null;
                  }
                  return (
                    <Marker
                      key={`provider-${provider.id}`}
                      coordinate={{
                        latitude: Number(lat),
                        longitude: Number(lng),
                      }}
                      title={provider.businessName || "Mechanic"}
                      description={provider.address || ""}
                      pinColor={colors.primary[600]}
                      tracksViewChanges={false}
                      onPress={() => {
                        setSelectedStation(null);
                        navigation.navigate("ProviderDetail", {
                          providerId: provider.id,
                        } as any);
                      }}
                    >
                      <View style={styles.customMarker}>
                        <Ionicons name="construct" size={16} color={colors.white} />
                      </View>
                    </Marker>
                  );
                })}

              {/* Fuel & EV Energy Stations */}
              {filteredStations.map((station) => {
                const isFuel = station.type === "fuel";
                return (
                  <Marker
                    key={`station-${station.id}`}
                    coordinate={{
                      latitude: station.location.latitude,
                      longitude: station.location.longitude,
                    }}
                    title={station.name}
                    description={station.address}
                    tracksViewChanges={false}
                    onPress={() => {
                      setSelectedStation(station);
                      mapRef.current?.animateToRegion(
                        {
                          latitude: station.location.latitude - 0.015,
                          longitude: station.location.longitude,
                          latitudeDelta: 0.08,
                          longitudeDelta: 0.08,
                        },
                        450
                      );
                    }}
                  >
                    <View
                      style={[
                        styles.customMarker,
                        isFuel ? styles.fuelMarker : styles.evMarker,
                      ]}
                    >
                      <Ionicons
                        name={isFuel ? "flame" : "flash"}
                        size={16}
                        color={colors.white}
                      />
                    </View>
                  </Marker>
                );
              })}
            </MapView>

            <View style={styles.mapBottomSheet}>
              {selectedStation ? (
                <View style={styles.selectedStationWrapper}>
                  <StationMapCard
                    station={selectedStation}
                    distance={getFormattedDistance(currentLocation, selectedStation.location)}
                    onNavigate={() =>
                      openMaps(
                        selectedStation.location.latitude,
                        selectedStation.location.longitude,
                        selectedStation.name
                      )
                    }
                    onClose={() => setSelectedStation(null)}
                  />
                </View>
              ) : isStationCategory ? (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={filteredStations}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.providerCardsListMap}
                  renderItem={({ item }) => (
                    <StationMapCard
                      station={item}
                      distance={getFormattedDistance(currentLocation, item.location)}
                      onPress={() => {
                        setSelectedStation(item);
                        mapRef.current?.animateToRegion(
                          {
                            latitude: item.location.latitude - 0.015,
                            longitude: item.location.longitude,
                            latitudeDelta: 0.08,
                            longitudeDelta: 0.08,
                          },
                          450
                        );
                      }}
                      onNavigate={() =>
                        openMaps(
                          item.location.latitude,
                          item.location.longitude,
                          item.name
                        )
                      }
                    />
                  )}
                />
              ) : (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={filteredProviders}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.providerCardsListMap}
                  renderItem={({ item }) => (
                    <ProviderMapCard
                      provider={item}
                      distance={getFormattedDistance(currentLocation, item.location)}
                      onPress={() =>
                        navigation.navigate("ProviderDetail", {
                          providerId: item.id,
                        } as any)
                      }
                    />
                  )}
                />
              )}
            </View>
          </View>
        ) : isStationCategory ? (
          <FlatList
            data={filteredStations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <StationListCard
                station={item}
                distance={getFormattedDistance(currentLocation, item.location)}
                onNavigate={() =>
                  openMaps(
                    item.location.latitude,
                    item.location.longitude,
                    item.name
                  )
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name={isFuelCategory ? "flame" : "flash"}
                    size={32}
                    color={colors.neutral[400]}
                  />
                </View>
                <Text style={styles.emptyStateTitle}>
                  {isFuelCategory ? "No fuel stations found" : "No EV chargers found"}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try clearing your search query.
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={filteredProviders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              selectedCategory === "all" ? (
                <View style={styles.energyQuickSection}>
                  <View style={styles.energySectionHeader}>
                    <View style={styles.energyTitleRow}>
                      <Ionicons name="speedometer-outline" size={18} color={colors.primary[600]} />
                      <Text style={styles.energySectionTitle}>Fuel & EV Stations Nearby</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedCategory("fuel")}>
                      <Text style={styles.energySeeAllText}>See all fuel</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={ENERGY_STATIONS}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.energyHorizontalList}
                    renderItem={({ item }) => (
                      <StationMiniCard
                        station={item}
                        distance={getFormattedDistance(currentLocation, item.location)}
                        onNavigate={() =>
                          openMaps(
                            item.location.latitude,
                            item.location.longitude,
                            item.name
                          )
                        }
                      />
                    )}
                  />
                  <Text style={styles.mechanicsSectionHeading}>Auto Mechanics & Garages</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <ProviderListCard
                provider={item}
                distance={getFormattedDistance(currentLocation, item.location)}
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
      </AnimatedEntrance>
    </SafeAreaView>
  );
}

function ProviderMapCard({
  provider,
  distance,
  onPress,
}: {
  provider: ServiceProvider;
  distance?: string | null;
  onPress: () => void;
}) {
  const rating = typeof provider.rating === "number" ? provider.rating : 0;
  return (
    <TouchableOpacity
      style={styles.mapCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.mapCardAvatar}>
        <Image
          source={{ uri: getProviderAvatarUrl(provider) }}
          style={styles.mapCardAvatarImg}
          resizeMode="cover"
        />
        {provider.isAvailable && <View style={styles.mapCardOnlineDot} />}
      </View>
      <View style={styles.mapCardContent}>
        <Text style={styles.mapCardTitle} numberOfLines={1}>
          {provider.businessName || "Unnamed Provider"}
        </Text>
        <Text style={styles.mapCardAddress} numberOfLines={1}>
          {provider.address || "Location not provided"}
        </Text>
        <View style={styles.mapCardFooter}>
          <View style={styles.ratingInfo}>
            <Ionicons name="star" size={12} color={colors.warning[500]} />
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
          </View>
          {distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={10} color={colors.primary[600]} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          )}
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
  distance,
  onPress,
}: {
  provider: ServiceProvider;
  distance?: string | null;
  onPress: () => void;
}) {
  const rating = typeof provider.rating === "number" ? provider.rating : 0;
  const count = (provider as any).totalReviews ?? provider.reviewCount ?? 0;
  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.listCardAvatarContainer}>
        <Image
          source={{ uri: getProviderAvatarUrl(provider) }}
          style={styles.listCardAvatarImg}
          resizeMode="cover"
        />
        {provider.isAvailable && <View style={styles.listCardOnlineDot} />}
      </View>
      <View style={styles.listCardContent}>
        <View style={styles.listCardHeader}>
          <Text style={styles.listCardTitle} numberOfLines={1}>
            {provider.businessName || "Unnamed Provider"}
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
          {provider.address || "No address provided"}
        </Text>
        <Text style={styles.listCardDescription} numberOfLines={2}>
          {provider.description || "No description provided"}
        </Text>

        <View style={styles.listCardFooter}>
          <View style={styles.ratingInfo}>
            <Ionicons name="star" size={14} color={colors.warning[500]} />
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({count})</Text>
          </View>
          {distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={11} color={colors.primary[600]} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          )}
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

function StationMapCard({
  station,
  distance,
  onPress,
  onNavigate,
  onClose,
}: {
  station: EnergyStation;
  distance?: string | null;
  onPress?: () => void;
  onNavigate: () => void;
  onClose?: () => void;
}) {
  const isFuel = station.type === "fuel";
  return (
    <TouchableOpacity
      style={styles.mapStationCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={[styles.mapStationIconBox, isFuel ? styles.fuelIconBg : styles.evIconBg]}>
        <Ionicons
          name={isFuel ? "flame" : "flash"}
          size={24}
          color={colors.white}
        />
      </View>
      <View style={styles.mapCardContent}>
        <View style={styles.stationBrandRow}>
          <Text style={styles.mapCardTitle} numberOfLines={1}>
            {station.name}
          </Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.mapCardAddress} numberOfLines={1}>
          {station.address}
        </Text>

        <View style={styles.mapCardFooter}>
          {isFuel && station.fuelPrices ? (
            <View style={styles.fuelPriceTagPill}>
              <Text style={styles.fuelPriceTagText}>
                ${station.fuelPrices.regular.toFixed(2)}/L Reg
              </Text>
            </View>
          ) : station.evSpecs ? (
            <View style={styles.evPowerTagPill}>
              <Text style={styles.evPowerTagPillText}>
                {station.evSpecs.powerKw}kW • {station.evSpecs.availablePlugs}/{station.evSpecs.totalPlugs} Free
              </Text>
            </View>
          ) : null}

          {distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={10} color={colors.primary[600]} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.directionMiniBtn} onPress={onNavigate} activeOpacity={0.8}>
            <Ionicons name="compass" size={13} color={colors.white} />
            <Text style={styles.directionMiniText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StationListCard({
  station,
  distance,
  onNavigate,
}: {
  station: EnergyStation;
  distance?: string | null;
  onNavigate: () => void;
}) {
  const isFuel = station.type === "fuel";
  return (
    <View style={styles.stationListCard}>
      <View style={[styles.stationListIconBox, isFuel ? styles.fuelIconBg : styles.evIconBg]}>
        <Ionicons
          name={isFuel ? "flame" : "flash"}
          size={28}
          color={colors.white}
        />
        <View style={[styles.stationPillBadge, isFuel ? styles.fuelPillBadge : styles.evPillBadge]}>
          <Text style={styles.stationPillBadgeText}>{isFuel ? "FUEL" : "EV"}</Text>
        </View>
      </View>

      <View style={styles.stationListContent}>
        <View style={styles.stationHeaderRow}>
          <Text style={styles.stationTitle} numberOfLines={1}>
            {station.name}
          </Text>
          <View style={styles.ratingInfo}>
            <Ionicons name="star" size={13} color={colors.warning[500]} />
            <Text style={styles.ratingValue}>{station.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.stationAddress} numberOfLines={1}>
          {station.address}
        </Text>

        {isFuel && station.fuelPrices && (
          <View style={styles.fuelPricesRow}>
            <View style={styles.fuelPriceChip}>
              <Text style={styles.fuelChipLabel}>Regular</Text>
              <Text style={styles.fuelChipPrice}>${station.fuelPrices.regular.toFixed(2)}/L</Text>
            </View>
            <View style={styles.fuelPriceChip}>
              <Text style={styles.fuelChipLabel}>Diesel</Text>
              <Text style={styles.fuelChipPrice}>${station.fuelPrices.diesel.toFixed(2)}/L</Text>
            </View>
            <View style={styles.open24Pill}>
              <Text style={styles.open24Text}>24/7 OPEN</Text>
            </View>
          </View>
        )}

        {!isFuel && station.evSpecs && (
          <View style={styles.evSpecsRow}>
            <View style={styles.evPowerBadge}>
              <Ionicons name="flash" size={12} color="#047857" />
              <Text style={styles.evPowerText}>{station.evSpecs.powerKw} kW DC Fast</Text>
            </View>
            <View style={styles.evPlugsBadge}>
              <Text style={styles.evPlugsText}>
                {station.evSpecs.availablePlugs}/{station.evSpecs.totalPlugs} Available
              </Text>
            </View>
            <Text style={styles.evRateText}>${station.evSpecs.pricePerKwh.toFixed(2)}/kWh</Text>
          </View>
        )}

        <View style={styles.stationActionRow}>
          {distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={11} color={colors.primary[600]} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.directionsButton} onPress={onNavigate} activeOpacity={0.85}>
            <Ionicons name="compass" size={15} color={colors.white} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function StationMiniCard({
  station,
  distance,
  onNavigate,
}: {
  station: EnergyStation;
  distance?: string | null;
  onNavigate: () => void;
}) {
  const isFuel = station.type === "fuel";
  return (
    <TouchableOpacity
      style={styles.stationMiniCard}
      onPress={onNavigate}
      activeOpacity={0.85}
    >
      <View style={styles.stationMiniTop}>
        <View style={[styles.miniIconBox, isFuel ? styles.fuelIconBg : styles.evIconBg]}>
          <Ionicons
            name={isFuel ? "flame" : "flash"}
            size={16}
            color={colors.white}
          />
        </View>
        <View style={styles.miniBrandBadge}>
          <Text style={styles.miniBrandText}>{station.brand}</Text>
        </View>
      </View>

      <Text style={styles.miniStationName} numberOfLines={1}>
        {station.name}
      </Text>
      <Text style={styles.miniStationAddress} numberOfLines={1}>
        {station.address}
      </Text>

      <View style={styles.miniFooter}>
        <Text style={styles.miniHighlightText}>
          {isFuel && station.fuelPrices
            ? `$${station.fuelPrices.regular.toFixed(2)}/L`
            : station.evSpecs
            ? `${station.evSpecs.powerKw}kW • Free`
            : "Open"}
        </Text>
        {distance && <Text style={styles.miniDistanceText}>{distance}</Text>}
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
    position: "relative",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
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
    position: "relative",
  },
  mapCardAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  mapCardOnlineDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: colors.white,
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
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary[700],
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
  listCardAvatarContainer: {
    position: "relative",
  },
  listCardAvatarImg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
  listCardOnlineDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: colors.white,
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

  /* Energy Stations Additions */
  fuelMarker: {
    backgroundColor: "#F59E0B",
  },
  evMarker: {
    backgroundColor: "#10B981",
  },
  selectedStationWrapper: {
    paddingHorizontal: spacing.lg,
  },
  mapStationCard: {
    width: width * 0.85,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.lg,
  },
  mapStationIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fuelIconBg: {
    backgroundColor: "#F59E0B",
  },
  evIconBg: {
    backgroundColor: "#10B981",
  },
  stationBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fuelPriceTagPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fuelPriceTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
  },
  evPowerTagPill: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  evPowerTagPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },
  directionMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  directionMiniText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
  },

  /* Station List Cards */
  stationListCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    gap: spacing.md,
    ...shadows.sm,
  },
  stationListIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  stationPillBadge: {
    position: "absolute",
    bottom: -6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  fuelPillBadge: {
    backgroundColor: "#78350F",
  },
  evPillBadge: {
    backgroundColor: "#064E3B",
  },
  stationPillBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 0.5,
  },
  stationListContent: {
    flex: 1,
  },
  stationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
    marginRight: spacing.xs,
  },
  stationAddress: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
    fontWeight: "500",
  },
  fuelPricesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.sm,
    flexWrap: "wrap",
  },
  fuelPriceChip: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  fuelChipLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#92400E",
    textTransform: "uppercase",
  },
  fuelChipPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: "#78350F",
  },
  open24Pill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  open24Text: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary[700],
  },
  evSpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.sm,
    flexWrap: "wrap",
  },
  evPowerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evPowerText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },
  evPlugsBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evPlugsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  evRateText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.neutral[700],
  },
  stationActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.xs,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    ...shadows.sm,
  },
  directionsButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },

  /* Energy Quick Section (in List Mode "All") */
  energyQuickSection: {
    marginBottom: spacing.lg,
  },
  energySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  energyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  energySectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  energySeeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[600],
  },
  energyHorizontalList: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mechanicsSectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.neutral[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Station Mini Card */
  stationMiniCard: {
    width: 175,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  stationMiniTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  miniIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  miniBrandBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBrandText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral[600],
  },
  miniStationName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  miniStationAddress: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
  },
  miniFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  miniHighlightText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary[700],
  },
  miniDistanceText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[500],
  },
});
