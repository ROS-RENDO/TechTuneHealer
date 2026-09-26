import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedEntrance } from "../../components";
import { colors, spacing, borderRadius, shadows } from "../../constants/theme";
import { INITIAL_SERVICES, MockService } from "../../data/mockProviderData";
import { useTranslation } from "../../store";
import api from "../../services/api";

type CategoryFilter =
  | "All"
  | "Maintenance"
  | "Inspection"
  | "Diagnostics"
  | "Brakes"
  | "Tires"
  | "Electric/Hybrid"
  | "Engine";

export default function ServicesScreen() {
  const { t, language } = useTranslation();
  const [services, setServices] = useState<MockService[]>(INITIAL_SERVICES);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  const categories: { key: CategoryFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "All", label: t("all"), icon: "apps-outline" },
    { key: "Maintenance", label: language === "km" ? "ថែទាំទូទៅ" : "Maintenance", icon: "build-outline" },
    { key: "Diagnostics", label: language === "km" ? "វិនិច្ឆ័យ" : "Diagnostics", icon: "analytics-outline" },
    { key: "Brakes", label: language === "km" ? "ហ្វ្រាំង" : "Brakes", icon: "disc-outline" },
    { key: "Tires", label: language === "km" ? "កង់ & សំបក" : "Tires", icon: "sync-circle-outline" },
    { key: "Electric/Hybrid", label: language === "km" ? "EV/អគ្គិសនី" : "EV/Hybrid", icon: "flash-outline" },
    { key: "Inspection", label: language === "km" ? "ត្រួតពិនិត្យ" : "Inspection", icon: "search-outline" },
    { key: "Engine", label: language === "km" ? "ម៉ាស៊ីន" : "Engine", icon: "speedometer-outline" },
  ];
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<MockService | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadServices = useCallback(async () => {
    try {
      const me = await api.providers.getMe();
      if (me && (me as any).services && (me as any).services.length > 0) {
        const seededServices: MockService[] = (me as any).services.map((s: any) => {
          const nameLower = (s.name || "").toLowerCase();
          let category: MockService["category"] = "Maintenance";
          if (nameLower.includes("brake")) category = "Brakes";
          else if (nameLower.includes("tire") || nameLower.includes("wheel")) category = "Tires";
          else if (nameLower.includes("battery") || nameLower.includes("electric") || nameLower.includes("hybrid")) category = "Diagnostics";
          else if (nameLower.includes("engine") || nameLower.includes("tune")) category = "Engine";
          else if (nameLower.includes("scan") || nameLower.includes("diagnostic")) category = "Diagnostics";

          return {
            id: s.id,
            name: s.name,
            category,
            description: s.description || "Professional automotive service",
            price: Number(s.price) || 25,
            durationMinutes: 45,
            isActive: true,
          };
        });

        // Merge seeded provider services with default templates to ensure complete categories
        const existingIds = new Set(seededServices.map(s => s.name.toLowerCase()));
        const remainingTemplates = INITIAL_SERVICES.filter(t => !existingIds.has(t.name.toLowerCase()));
        setServices([...seededServices, ...remainingTemplates]);
      }
    } catch {
      // Keep initial templates on network error
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<MockService["category"]>("Maintenance");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDuration, setFormDuration] = useState("40");

  const filteredServices = services.filter((s) => {
    if (activeCategory === "All") return true;
    return s.category === activeCategory;
  });

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const deleteService = (id: string) => {
    Alert.alert("Delete Service", "Are you sure you want to remove this service from your catalog?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setServices((prev) => prev.filter((s) => s.id !== id)),
      },
    ]);
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormName("");
    setFormCategory("Maintenance");
    setFormDescription("");
    setFormPrice("");
    setFormDuration("40");
    setShowAddModal(true);
  };

  const handleOpenEdit = (service: MockService) => {
    setEditingService(service);
    setFormName(service.name);
    setFormCategory(service.category);
    setFormDescription(service.description);
    setFormPrice(service.price.toString());
    setFormDuration(service.durationMinutes.toString());
    setShowAddModal(true);
  };

  const handleSaveService = () => {
    const priceNum = parseFloat(formPrice);
    if (!formName.trim() || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Missing Information", "Please provide a valid service name and price in USD.");
      return;
    }

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: formName.trim(),
                category: formCategory,
                description: formDescription.trim(),
                price: priceNum,
                durationMinutes: parseInt(formDuration) || 40,
              }
            : s
        )
      );
    } else {
      const newServiceItem: MockService = {
        id: `srv-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim() || "Professional automotive service by certified technicians",
        price: priceNum,
        durationMinutes: parseInt(formDuration) || 40,
        isActive: true,
      };
      setServices([newServiceItem, ...services]);
    }

    setShowAddModal(false);
  };

  const getCategoryTheme = (category: string) => {
    let icon: keyof typeof Ionicons.glyphMap = "construct";
    switch (category) {
      case "Maintenance":
        icon = "build";
        break;
      case "Diagnostics":
        icon = "hardware-chip";
        break;
      case "Brakes":
        icon = "speedometer";
        break;
      case "Tires":
        icon = "disc";
        break;
      case "Electric/Hybrid":
        icon = "flash";
        break;
      case "Inspection":
        icon = "search";
        break;
      case "Engine":
        icon = "speedometer";
        break;
      default:
        icon = "construct";
    }
    return { color: colors.neutral[700], bg: colors.neutral[100], icon };
  };

  const renderServiceItem = ({ item }: { item: MockService }) => {
    const theme = getCategoryTheme(item.category);

    return (
      <View style={[styles.serviceCard, !item.isActive && styles.serviceCardInactive]}>
        <View style={styles.cardTopRow}>
          <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
            <Ionicons name={theme.icon} size={20} color={theme.color} />
          </View>

          <View style={styles.cardHeaderMeta}>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryPill, { backgroundColor: theme.bg }]}>
                <Text style={[styles.categoryPillText, { color: theme.color }]}>
                  {item.category}
                </Text>
              </View>
              <View style={styles.durationPill}>
                <Ionicons name="time-outline" size={11} color={colors.neutral[500]} />
                <Text style={styles.durationPillText}>{item.durationMinutes}m</Text>
              </View>
            </View>
            <Text style={styles.serviceNameText}>{item.name}</Text>
          </View>

          <Switch
            value={item.isActive}
            onValueChange={() => toggleService(item.id)}
            trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.cardBottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={styles.priceValue}>{item.price.toFixed(2)}</Text>
            <Text style={styles.pricePer}>USD</Text>
          </View>

          <View style={styles.cardActionButtons}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleOpenEdit(item)}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary[600]} />
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionIconButton, { backgroundColor: colors.error[50] }]}
              onPress={() => deleteService(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error[600]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t("tabServices")}</Text>
            <Text style={styles.headerSubtitle}>
              {services.filter((s) => s.isActive).length} {language === "km" ? "សកម្ម" : "Active"} • {services.length} {language === "km" ? "សេវាកម្មសរុប" : "Total Services"}
            </Text>
          </View>

          <TouchableOpacity style={styles.addServiceTopBtn} onPress={handleOpenAdd}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.addServiceTopBtnText}>
              {language === "km" ? "បន្ថែមសេវាកម្ម" : "Add Service"}
            </Text>
          </TouchableOpacity>
        </View>
      </AnimatedEntrance>

      {/* Category Filter Chips Strip */}
      <AnimatedEntrance delay={60} direction="down">
        <View style={styles.categoryStripContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.categoryStripContent}
            renderItem={({ item }) => {
              const isSelected = activeCategory === item.key;
              return (
                <TouchableOpacity
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  onPress={() => setActiveCategory(item.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon}
                    size={14}
                    color={isSelected ? colors.white : colors.neutral[600]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
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

      {/* Services List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No Services In This Category</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Add Service" above to list repair and maintenance packages.
            </Text>
          </View>
        }
      />

      {/* Add / Edit Service Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons
                name={editingService ? "create" : "add-circle"}
                size={24}
                color={colors.primary[600]}
              />
              <Text style={styles.modalTitle}>
                {editingService ? "Edit Service Package" : "Add New Workshop Service"}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Name</Text>
              <TextInput
                style={styles.inputField}
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g. Front Ceramic Brake Pad Replacement"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryScroll}>
                {(
                  [
                    "Maintenance",
                    "Diagnostics",
                    "Brakes",
                    "Tires",
                    "Electric/Hybrid",
                    "Inspection",
                    "Engine",
                  ] as MockService["category"][]
                ).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.modalCatPill,
                      formCategory === cat && styles.modalCatPillActive,
                    ]}
                    onPress={() => setFormCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.modalCatPillText,
                        formCategory === cat && styles.modalCatPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>Price (USD)</Text>
                <TextInput
                  style={styles.inputField}
                  value={formPrice}
                  onChangeText={setFormPrice}
                  placeholder="45.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Duration (Minutes)</Text>
                <TextInput
                  style={styles.inputField}
                  value={formDuration}
                  onChangeText={setFormDuration}
                  placeholder="40"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description & Included Labor</Text>
              <TextInput
                style={[styles.inputField, { height: 64, textAlignVertical: "top" }]}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Briefly describe what is inspected or replaced..."
                multiline
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveService}
              >
                <Text style={styles.modalSaveBtnText}>
                  {editingService ? "Update Service" : "Add Service"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.neutral[900],
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
  },
  addServiceTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    gap: 4,
    ...shadows.sm,
  },
  addServiceTopBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  categoryStripContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  categoryStripContent: {
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginRight: 6,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing["4xl"],
  },
  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  serviceCardInactive: {
    opacity: 0.6,
    backgroundColor: colors.neutral[50],
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderMeta: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  durationPillText: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  serviceNameText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  serviceDescription: {
    fontSize: 12,
    color: colors.neutral[600],
    lineHeight: 17,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceCurrency: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.success[700],
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  pricePer: {
    fontSize: 10,
    color: colors.neutral[400],
    marginLeft: 2,
  },
  cardActionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actionIconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    gap: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary[700],
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing["4xl"],
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: "center",
    maxWidth: 260,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 380,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.neutral[900],
  },
  modalCategoryScroll: {
    flexDirection: "row",
  },
  modalCatPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    marginRight: 6,
  },
  modalCatPillActive: {
    backgroundColor: colors.primary[600],
  },
  modalCatPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  modalCatPillTextActive: {
    color: colors.white,
  },
  rowInputs: {
    flexDirection: "row",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalCancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  modalSaveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
});
