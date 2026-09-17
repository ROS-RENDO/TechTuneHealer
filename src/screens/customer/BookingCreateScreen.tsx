import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { useBookingStore, useProviderSearchStore } from "../../store";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  
} from "../../constants/theme";
import { format, addDays } from "date-fns";
import type { CustomerStackScreenProps } from "../../navigation/types";

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const SERVICES = [
  { id: "1", name: "Oil Change", price: 35 },
  { id: "2", name: "Tire Inspection", price: 20 },
  { id: "3", name: "Brake Check", price: 45 },
  { id: "4", name: "Battery Test", price: 15 },
  { id: "5", name: "AC Service", price: 75 },
  { id: "6", name: "Engine Diagnostics", price: 60 },
];

export function BookingCreateScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"BookingCreate">["navigation"]>();
  const route = useRoute<CustomerStackScreenProps<"BookingCreate">["route"]>();
  const { providerId, isEmergency } = route.params;

  const { createBooking, isLoading } = useBookingStore();
  const { providers } = useProviderSearchStore();

  const provider = providers.find((p) => p.id === providerId);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, serviceId) => {
      const service = SERVICES.find((s) => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedServices.length === 0) {
      Alert.alert("Select Services", "Please select at least one service.");
      return;
    }
    if (currentStep === 2 && !selectedTime) {
      Alert.alert("Select Time", "Please select an appointment time.");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const booking = await createBooking({
        providerId,
        serviceIds: selectedServices,
        scheduledDate: new Date(
          format(selectedDate, "yyyy-MM-dd") + "T" + selectedTime,
        ),
        estimatedPrice: calculateTotal(),
        notes,
        isEmergency: isEmergency || false,
      });

      Alert.alert(
        "Booking Confirmed",
        "Your booking request has been sent to the service provider.",
        [
          {
            text: "View Booking",
            onPress: () =>
              navigation.navigate("BookingDetail", { bookingId: booking.id }),
          },
        ],
      );
    } catch {
      Alert.alert("Error", "Failed to create booking. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                currentStep >= step && styles.progressDotActive,
              ]}
            >
              {currentStep > step ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.progressDotText,
                    currentStep >= step && styles.progressDotTextActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                currentStep >= step && styles.progressLabelActive,
              ]}
            >
              {step === 1 ? "Services" : step === 2 ? "Schedule" : "Confirm"}
            </Text>
            {step < 3 && (
              <View
                style={[
                  styles.progressLine,
                  currentStep > step && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Services */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Services</Text>
            <Text style={styles.stepSubtitle}>
              Choose the services you need
            </Text>

            {isEmergency && (
              <View style={styles.emergencyBanner}>
                <Ionicons name="warning" size={20} color={colors.error[600]} />
                <Text style={styles.emergencyBannerText}>
                  Emergency Request - Priority Service
                </Text>
              </View>
            )}

            <View style={styles.servicesGrid}>
              {SERVICES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedServices.includes(service.id) &&
                      styles.serviceCardSelected,
                  ]}
                  onPress={() => toggleService(service.id)}
                >
                  <View style={styles.serviceCardHeader}>
                    <View
                      style={[
                        styles.serviceCheckbox,
                        selectedServices.includes(service.id) &&
                          styles.serviceCheckboxSelected,
                      ]}
                    >
                      {selectedServices.includes(service.id) && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={colors.white}
                        />
                      )}
                    </View>
                    <Text style={styles.servicePrice}>${service.price}</Text>
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Select Date & Time */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Date & Time</Text>
            <Text style={styles.stepSubtitle}>
              Pick a convenient appointment slot
            </Text>

            {/* Date Selection */}
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesContainer}
              >
                {dates.map((date) => {
                  const isSelected =
                    format(date, "yyyy-MM-dd") ===
                    format(selectedDate, "yyyy-MM-dd");
                  return (
                    <TouchableOpacity
                      key={date.toString()}
                      style={[
                        styles.dateCard,
                        isSelected && styles.dateCardSelected,
                      ]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text
                        style={[
                          styles.dateDayName,
                          isSelected && styles.dateDayNameSelected,
                        ]}
                      >
                        {format(date, "EEE")}
                      </Text>
                      <Text
                        style={[
                          styles.dateDay,
                          isSelected && styles.dateDaySelected,
                        ]}
                      >
                        {format(date, "d")}
                      </Text>
                      <Text
                        style={[
                          styles.dateMonth,
                          isSelected && styles.dateMonthSelected,
                        ]}
                      >
                        {format(date, "MMM")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Time Selection */}
            <View style={styles.timeSection}>
              <Text style={styles.sectionLabel}>Time</Text>
              <View style={styles.timeSlotsGrid}>
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotSelected,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isSelected && styles.timeSlotTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirm Booking</Text>
            <Text style={styles.stepSubtitle}>Review your booking details</Text>

            {/* Provider Info */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Service Provider</Text>
              <View style={styles.providerRow}>
                <View style={styles.providerAvatar}>
                  <Ionicons
                    name="business"
                    size={20}
                    color={colors.neutral[400]}
                  />
                </View>
                <View>
                  <Text style={styles.providerName}>
                    {provider?.businessName || "Service Provider"}
                  </Text>
                  <Text style={styles.providerAddress}>
                    {provider?.address || "Address"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Appointment Info */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Appointment</Text>
              <View style={styles.summaryRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.neutral[500]}
                />
                <Text style={styles.summaryText}>
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.neutral[500]}
                />
                <Text style={styles.summaryText}>{selectedTime}</Text>
              </View>
            </View>

            {/* Services */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Services</Text>
              {selectedServices.map((serviceId) => {
                const service = SERVICES.find((s) => s.id === serviceId);
                return (
                  <View key={serviceId} style={styles.summaryServiceRow}>
                    <Text style={styles.summaryServiceName}>
                      {service?.name}
                    </Text>
                    <Text style={styles.summaryServicePrice}>
                      ${service?.price}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${calculateTotal()}</Text>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.summaryLabel}>
                Additional Notes (Optional)
              </Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any special requests or information..."
                placeholderTextColor={colors.neutral[400]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.neutral[700]} />
          </TouchableOpacity>
        )}
        <View style={styles.nextButtonContainer}>
          {currentStep < 3 ? (
            <Button
              title="Next"
              onPress={handleNext}
              variant="primary"
              size="large"
              fullWidth
            />
          ) : (
            <Button
              title="Confirm Booking"
              onPress={handleConfirmBooking}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
            />
          )}
        </View>
        {selectedServices.length > 0 && currentStep < 3 && (
          <View style={styles.totalPreview}>
            <Text style={styles.totalPreviewLabel}>Total</Text>
            <Text style={styles.totalPreviewValue}>${calculateTotal()}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotActive: {
    backgroundColor: colors.primary[600],
  },
  progressDotText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[500],
  },
  progressDotTextActive: {
    color: colors.white,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginLeft: spacing.xs,
  },
  progressLabelActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.medium,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.sm,
  },
  progressLineActive: {
    backgroundColor: colors.primary[600],
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: spacing.xl,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  stepSubtitle: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  emergencyBannerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.error[700],
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  serviceCard: {
    width: "47%",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  serviceCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  serviceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  serviceCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
  serviceCheckboxSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  servicePrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary[600],
  },
  serviceName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  dateSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  datesContainer: {
    gap: spacing.md,
  },
  dateCard: {
    width: 64,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    marginRight: spacing.md,
  },
  dateCardSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  dateDayName: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    textTransform: "uppercase",
  },
  dateDayNameSelected: {
    color: colors.primary[100],
  },
  dateDay: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginVertical: 2,
  },
  dateDaySelected: {
    color: colors.white,
  },
  dateMonth: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  dateMonthSelected: {
    color: colors.primary[100],
  },
  timeSection: {},
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  timeSlot: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  timeSlotSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  timeSlotText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  timeSlotTextSelected: {
    color: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[500],
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
    alignItems: "center",
    justifyContent: "center",
  },
  providerName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  providerAddress: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: fontSize.base,
    color: colors.neutral[700],
  },
  summaryServiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  summaryServiceName: {
    fontSize: fontSize.base,
    color: colors.neutral[700],
  },
  summaryServicePrice: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  notesSection: {},
  notesInput: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.neutral[900],
    minHeight: 100,
  },
  bottomActions: {
    flexDirection: "row",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.md,
    alignItems: "center",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonContainer: {
    flex: 1,
  },
  totalPreview: {
    alignItems: "flex-end",
  },
  totalPreviewLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  totalPreviewValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
});
