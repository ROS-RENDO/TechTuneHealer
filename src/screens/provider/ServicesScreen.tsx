import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
  category: string;
}

const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Oil Change',
    description: 'Complete oil and filter change service',
    price: 45,
    duration: '30-45 min',
    isActive: true,
    category: 'Maintenance',
  },
  {
    id: '2',
    name: 'Brake Inspection',
    description: 'Full brake system inspection and adjustment',
    price: 35,
    duration: '30 min',
    isActive: true,
    category: 'Inspection',
  },
  {
    id: '3',
    name: 'Tire Rotation',
    description: 'Rotate all four tires for even wear',
    price: 25,
    duration: '20-30 min',
    isActive: true,
    category: 'Maintenance',
  },
  {
    id: '4',
    name: 'Engine Diagnostics',
    description: 'Computer diagnostic scan and analysis',
    price: 75,
    duration: '45-60 min',
    isActive: true,
    category: 'Diagnostics',
  },
  {
    id: '5',
    name: 'AC Service',
    description: 'Air conditioning inspection and recharge',
    price: 85,
    duration: '60 min',
    isActive: false,
    category: 'Repair',
  },
];

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Maintenance',
  });

  const toggleService = (id: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, isActive: !service.isActive } : service
      )
    );
  };

  const deleteService = (id: string) => {
    Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setServices(services.filter((s) => s.id !== id)),
      },
    ]);
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const service: Service = {
      id: Date.now().toString(),
      name: newService.name,
      description: newService.description,
      price: parseFloat(newService.price),
      duration: newService.duration,
      category: newService.category,
      isActive: true,
    };

    setServices([...services, service]);
    setNewService({ name: '', description: '', price: '', duration: '', category: 'Maintenance' });
    setShowAddModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Maintenance':
        return 'build-outline';
      case 'Repair':
        return 'hammer-outline';
      case 'Inspection':
        return 'search-outline';
      case 'Diagnostics':
        return 'analytics-outline';
      default:
        return 'construct-outline';
    }
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={[styles.serviceCard, !item.isActive && styles.serviceCardInactive]}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIconContainer}>
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={24}
            color={item.isActive ? colors.primary[500] : colors.textSecondary}
          />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={[styles.serviceName, !item.isActive && styles.textInactive]}>
            {item.name}
          </Text>
          <Text style={styles.serviceCategory}>{item.category}</Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleService(item.id)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={item.isActive ? colors.primary[500] : colors.textSecondary}
        />
      </View>

      <Text style={[styles.serviceDescription, !item.isActive && styles.textInactive]}>
        {item.description}
      </Text>

      <View style={styles.serviceDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>${item.price}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.serviceActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingService(item);
            setNewService({
              name: item.name,
              description: item.description,
              price: item.price.toString(),
              duration: item.duration,
              category: item.category,
            });
            setShowAddModal(true);
          }}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteService(item.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.error[500]} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingService(null);
            setNewService({ name: '', description: '', price: '', duration: '', category: 'Maintenance' });
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{services.length}</Text>
          <Text style={styles.statLabel}>Total Services</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{services.filter((s) => s.isActive).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{services.filter((s) => !s.isActive).length}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Services Yet</Text>
            <Text style={styles.emptyText}>Add your first service to start receiving bookings</Text>
          </View>
        }
      />

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Oil Change"
                value={newService.name}
                onChangeText={(text) => setNewService({ ...newService, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your service..."
                value={newService.description}
                onChangeText={(text) => setNewService({ ...newService, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={newService.price}
                  onChangeText={(text) => setNewService({ ...newService, price: text })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
                <Text style={styles.inputLabel}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 30 min"
                  value={newService.duration}
                  onChangeText={(text) => setNewService({ ...newService, duration: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryOptions}>
                {['Maintenance', 'Repair', 'Inspection', 'Diagnostics'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      newService.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setNewService({ ...newService, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        newService.category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddService}>
              <Text style={styles.saveButtonText}>
                {editingService ? 'Save Changes' : 'Add Service'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary[500],
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  serviceCardInactive: {
    opacity: 0.7,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  serviceName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  serviceCategory: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  serviceDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textInactive: {
    color: colors.textSecondary,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButtonText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.error[500],
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary[500],
  },
  categoryChipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
