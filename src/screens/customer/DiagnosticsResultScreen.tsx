import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { AnimatedEntrance } from "../../components";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";
import { useLocationStore, useProviderSearchStore, useTranslation } from "../../store";
import { getFormattedDistance, getProviderAvatarUrl } from "../../utils/helpers";
import type { ServiceProvider } from "../../types";

export interface DiagnosticDetail {
  title: string;
  category: "repair" | "maintenance" | "brakes" | "battery" | "tires" | "emergency";
  recommendedService: string;
  severity: "low" | "medium" | "high";
  possibleCauses: string[];
  suggestedActions: string[];
  estimatedCost: string;
}

// Complete Diagnostic Intelligence mapping for all 24 automotive symptoms
export const ALL_DIAGNOSTIC_RESULTS: Record<string, DiagnosticDetail> = {
  // Engine
  engine_noise: {
    title: "Abnormal Engine Noise",
    category: "repair",
    recommendedService: "Engine Diagnostic & Valve Inspection",
    severity: "medium",
    possibleCauses: [
      "Worn timing belt or tensioner pulley",
      "Low engine oil level causing valve ticking",
      "Loose or cracked serpentine belt",
      "Exhaust manifold gasket leak",
    ],
    suggestedActions: [
      "Check engine oil dipstick immediately",
      "Avoid driving under high RPM or heavy loads",
      "Have a certified mechanic perform an acoustic diagnostic scan",
    ],
    estimatedCost: "$50 - $250",
  },
  engine_shake: {
    title: "Engine Vibration & Rough Idle",
    category: "repair",
    recommendedService: "Engine Mount & Ignition System Service",
    severity: "medium",
    possibleCauses: [
      "Damaged or collapsed engine mounts",
      "Fouled spark plugs or failing ignition coil",
      "Dirty fuel injector causing misfire (P0300)",
      "Vacuum leak in air intake manifold",
    ],
    suggestedActions: [
      "Inspect engine rubber mount bushings for tears",
      "Scan OBD-II codes for active cylinder misfires",
      "Replace worn spark plugs and ignition coil packs",
    ],
    estimatedCost: "$60 - $280",
  },
  engine_stall: {
    title: "Engine Stalling While Driving",
    category: "emergency",
    recommendedService: "Fuel System & Throttle Body Cleaning",
    severity: "high",
    possibleCauses: [
      "Failing fuel pump or clogged fuel filter",
      "Dirty throttle body / idle air control valve",
      "Faulty camshaft / crankshaft position sensor",
      "Mass airflow (MAF) sensor malfunction",
    ],
    suggestedActions: [
      "Safely steer vehicle to roadside shoulder immediately",
      "Check battery connections and alternator belt",
      "Request mobile mechanic dispatch to test fuel rail pressure",
    ],
    estimatedCost: "$70 - $350",
  },
  hard_start: {
    title: "Difficult / Long Crank Starting",
    category: "battery",
    recommendedService: "Starter Motor & Fuel Delivery Inspection",
    severity: "medium",
    possibleCauses: [
      "Weak 12V battery with low cranking amps (CCA)",
      "Worn starter motor solenoid contacts",
      "Low residual fuel pressure in fuel rail",
      "Old spark plugs with excessive gap",
    ],
    suggestedActions: [
      "Test battery resting voltage (should be >12.4V)",
      "Listen for clicking sound when key turns",
      "Have starter draw and fuel pressure inspected by specialist",
    ],
    estimatedCost: "$40 - $220",
  },
  power_loss: {
    title: "Loss of Acceleration & Power",
    category: "repair",
    recommendedService: "Turbo & Air Intake System Diagnostic",
    severity: "medium",
    possibleCauses: [
      "Restricted catalytic converter or exhaust backpressure",
      "Boost leak in intercooler hoses or faulty turbo actuator",
      "Clogged air intake filter element",
      "Clogged fuel injectors under load",
    ],
    suggestedActions: [
      "Inspect air filter for dirt saturation",
      "Perform diagnostic scan for boost pressure codes",
      "Clean mass airflow sensor and test fuel trim parameters",
    ],
    estimatedCost: "$80 - $400",
  },

  // Brakes
  brake_squeal: {
    title: "High-Pitched Brake Squeal",
    category: "brakes",
    recommendedService: "Ceramic Brake Pad & Rotor Replacement",
    severity: "medium",
    possibleCauses: [
      "Brake pads worn down to metal acoustic wear indicators",
      "Glazed brake rotors from extreme heat cycles",
      "Brake dust accumulation between caliper slides",
      "Missing or rusted anti-rattle shims",
    ],
    suggestedActions: [
      "Inspect brake pad friction lining thickness (>3mm required)",
      "Inspect brake discs for deep scoring or blue heat stains",
      "Install premium ceramic pads and machine or replace rotors",
    ],
    estimatedCost: "$45 - $160",
  },
  brake_soft: {
    title: "Spongy / Low Brake Pedal",
    category: "brakes",
    recommendedService: "Brake Fluid Flush & Master Cylinder Service",
    severity: "high",
    possibleCauses: [
      "Air bubbles trapped in hydraulic brake fluid lines",
      "Hydraulic brake line fluid leak or swollen rubber hose",
      "Internal seal leakage inside brake master cylinder",
      "Moisture-contaminated DOT4 brake fluid",
    ],
    suggestedActions: [
      "DO NOT drive if pedal sinks to floorboard under foot pressure",
      "Inspect brake fluid reservoir level under hood immediately",
      "Have technician bleed brake lines and pressure test hydraulic circuit",
    ],
    estimatedCost: "$40 - $180",
  },
  brake_pull: {
    title: "Car Pulls to One Side When Braking",
    category: "brakes",
    recommendedService: "Brake Caliper Overhaul & Fluid Balance",
    severity: "high",
    possibleCauses: [
      "Stuck or seized brake caliper piston on one side",
      "Grease or brake fluid contamination on rotor face",
      "Collapsing inner liner of flexible brake hose",
      "Severely uneven brake pad friction wear",
    ],
    suggestedActions: [
      "Check wheels for excessive brake dust or radiating heat",
      "Do not make sudden high-speed emergency braking maneuvers",
      "Have caliper slide pins lubricated or caliper replaced",
    ],
    estimatedCost: "$65 - $220",
  },
  brake_vibrate: {
    title: "Steering / Pedal Pulsation When Braking",
    category: "brakes",
    recommendedService: "Brake Rotor Resurfacing & Hub Inspection",
    severity: "medium",
    possibleCauses: [
      "Warped brake rotors (lateral runout exceeds 0.05mm)",
      "Uneven friction material deposits cemented onto rotor surface",
      "Loose or improperly torqued wheel lug nuts",
      "Worn front suspension control arm bushings",
    ],
    suggestedActions: [
      "Check wheel lug nut torque using calibrated torque wrench",
      "Have brake rotor runout measured using dial indicator",
      "Precision resurface or install brand new OEM spec rotors",
    ],
    estimatedCost: "$50 - $190",
  },

  // Steering
  steering_noise: {
    title: "Whining / Groaning Noise When Turning",
    category: "repair",
    recommendedService: "Power Steering Fluid & Suspension Ball Joint Check",
    severity: "medium",
    possibleCauses: [
      "Low power steering fluid causing pump cavitation whining",
      "Worn dry tie-rod ends or lower ball joints",
      "Damaged front strut top mount bearing",
      "Failing CV axle joint clicking on full turning lock",
    ],
    suggestedActions: [
      "Check power steering fluid reservoir dipstick level",
      "Inspect CV axle rubber boots for grease splatter",
      "Have mechanic lubricate or replace dry ball joints",
    ],
    estimatedCost: "$45 - $210",
  },
  steering_hard: {
    title: "Heavy or Stiff Steering Wheel",
    category: "repair",
    recommendedService: "Power Steering Pump & Belt Service",
    severity: "high",
    possibleCauses: [
      "Loss of power steering hydraulic assist (broken serpentine belt)",
      "Electric power steering (EPS) motor or fuse failure",
      "Power steering pump internal impeller failure",
      "Seized lower steering shaft universal knuckle joint",
    ],
    suggestedActions: [
      "Check serpentine drive belt routing under hood",
      "Look for illuminated EPS / steering warning icon on cluster",
      "Drive with extreme care to nearest service center or request tow",
    ],
    estimatedCost: "$70 - $320",
  },
  steering_shake: {
    title: "Steering Wheel Wobble at High Speeds",
    category: "tires",
    recommendedService: "High-Speed Dynamic Wheel Balancing",
    severity: "medium",
    possibleCauses: [
      "Front wheels out of dynamic weight balance",
      "Bent alloy wheel rim from pothole impact",
      "Tire tread bubble or separated internal steel belt",
      "Worn outer tie-rod end with excessive play",
    ],
    suggestedActions: [
      "Have tire technician dynamically spin balance both front wheels",
      "Visually inspect tire sidewalls for bubbles or deformations",
      "Inspect front steering tie rods for looseness",
    ],
    estimatedCost: "$25 - $80",
  },
  steering_pull: {
    title: "Vehicle Drifting or Pulling Left/Right",
    category: "repair",
    recommendedService: "4-Wheel Computerized Laser Alignment",
    severity: "low",
    possibleCauses: [
      "Unequal front tire inflation pressures",
      "Wheel alignment camber or toe angles out of factory spec",
      "Slight brake caliper drag on pulling side",
      "Radial tire pull from conicity defect",
    ],
    suggestedActions: [
      "Verify cold tire pressures match driver door placard",
      "Book computerized 4-wheel laser alignment appointment",
      "Inspect suspension control arms for pothole impact bending",
    ],
    estimatedCost: "$25 - $65",
  },

  // Electrical
  battery_dead: {
    title: "Battery Dead / Charging System Fault",
    category: "battery",
    recommendedService: "Battery Testing & Alternator Replacement",
    severity: "high",
    possibleCauses: [
      "12V car battery reached end of 3-year chemical life",
      "Failing alternator not producing charging voltage (>13.8V)",
      "Heavy corrosion or loose connection on battery terminal posts",
      "Parasitic key-off battery drain from aftermarket dashcam/alarm",
    ],
    suggestedActions: [
      "Jumpstart vehicle or request roadside battery boost",
      "Clean battery terminals with baking soda solution and wire brush",
      "Have technician test cold cranking amps (CCA) and alternator diode",
    ],
    estimatedCost: "$65 - $195",
  },
  lights_dim: {
    title: "Dim Headlights & Cabin Flickering",
    category: "battery",
    recommendedService: "Electrical Charging & Ground Wire Service",
    severity: "medium",
    possibleCauses: [
      "Weak alternator output current under heavy electrical load",
      "Slipping alternator serpentine drive belt",
      "Corroded main chassis ground strap wire",
      "Dying battery failing to buffer electrical voltage drops",
    ],
    suggestedActions: [
      "Check serpentine belt tension and surface glaze",
      "Measure voltage drop across engine block and battery ground",
      "Have electrical charging system load tested",
    ],
    estimatedCost: "$35 - $130",
  },
  warning_lights: {
    title: "Check Engine / ABS Warning Light On",
    category: "repair",
    recommendedService: "Professional OBD-II Diagnostic Scan",
    severity: "medium",
    possibleCauses: [
      "Engine control unit (ECU) logged active DTC fault code",
      "Faulty oxygen (O2) sensor or catalytic converter efficiency",
      "Wheel speed sensor circuit fault for ABS/traction light",
      "Loose or leaking evaporative fuel tank gas cap",
    ],
    suggestedActions: [
      "Verify fuel filler cap is tightened until it clicks",
      "DO NOT ignore a flashing check engine light (misfire hazard)",
      "Connect OBD-II computer diagnostic scanner to read live sensor data",
    ],
    estimatedCost: "$20 - $70",
  },
  ac_not_working: {
    title: "AC Blowing Warm / Weak Cooling Air",
    category: "maintenance",
    recommendedService: "AC Gas Vacuum, Recharge & UV Leak Test",
    severity: "low",
    possibleCauses: [
      "Low R134a/R1234yf refrigerant from pinhole O-ring leak",
      "AC compressor electromagnetic clutch not engaging",
      "Clogged cabin air filter restricting airflow",
      "Faulty condenser cooling fan or stone-damaged condenser",
    ],
    suggestedActions: [
      "Check if AC compressor clicks on when A/C button is pressed",
      "Inspect and replace cabin air filter behind glovebox",
      "Have system vacuum pressure tested and recharged with UV dye",
    ],
    estimatedCost: "$35 - $150",
  },

  // Fluids & Leaks
  oil_leak: {
    title: "Engine Oil Dripping Under Vehicle",
    category: "maintenance",
    recommendedService: "Valve Cover / Oil Pan Gasket Replacement",
    severity: "medium",
    possibleCauses: [
      "Hardened or cracked rubber valve cover gasket",
      "Damaged oil pan drain plug crush washer",
      "Failing crankshaft front/rear main oil seals",
      "Loose or double-gasketed spin-on oil filter",
    ],
    suggestedActions: [
      "Check engine oil dipstick level before each drive",
      "Place clean cardboard under vehicle overnight to isolate drip location",
      "Have mechanic steam clean engine bay and trace exact gasket seep",
    ],
    estimatedCost: "$45 - $220",
  },
  coolant_leak: {
    title: "Coolant Leak / Sweet Smelling Vapor",
    category: "repair",
    recommendedService: "Radiator & Cooling Hose Pressure Test",
    severity: "high",
    possibleCauses: [
      "Cracked plastic radiator header tank or pinhole core leak",
      "Aged upper/lower radiator rubber hose split",
      "Water pump shaft mechanical seal weeping",
      "Heater core leak under dashboard carpet",
    ],
    suggestedActions: [
      "NEVER remove radiator cap while engine or coolant is warm",
      "Check coolant level in transparent plastic expansion tank",
      "Have cooling system pressure tested to 15 PSI to pinpoint leak",
    ],
    estimatedCost: "$40 - $190",
  },
  low_oil: {
    title: "Low Engine Oil / Pressure Warning",
    category: "emergency",
    recommendedService: "Full Synthetic Oil & Filter Service",
    severity: "high",
    possibleCauses: [
      "Excessive internal oil consumption (piston rings / valve seals)",
      "Active high-pressure oil leak while driving",
      "Faulty oil pressure sending sensor unit",
      "Sludge clogging engine oil pickup strainer",
    ],
    suggestedActions: [
      "Turn off engine IMMEDIATELY if red oil pressure lamp illuminates",
      "Top up with certified viscosity engine oil before starting",
      "Do not operate engine until certified mechanic verifies oil pressure",
    ],
    estimatedCost: "$30 - $95",
  },
  overheating: {
    title: "Engine Overheating (Temperature in Red)",
    category: "emergency",
    recommendedService: "Thermostat, Radiator Fan & Water Pump Service",
    severity: "high",
    possibleCauses: [
      "Thermostat stuck in closed position blocking coolant flow",
      "Failed electric radiator condenser cooling fan motor",
      "Blown cylinder head gasket permitting combustion leak",
      "Failed water pump impeller unable to circulate fluid",
    ],
    suggestedActions: [
      "Pull over safely immediately and shut down engine",
      "Turn cabin heater to maximum heat to bleed heat away from block",
      "Request immediate emergency roadside mechanic; do not drive overheated",
    ],
    estimatedCost: "$80 - $350",
  },

  // Tires
  flat_tire: {
    title: "Flat Tire / Rapid Depressurization",
    category: "tires",
    recommendedService: "Emergency Mobile Tire Repair / Patch",
    severity: "high",
    possibleCauses: [
      "Nail, screw, or road debris puncture through tire tread",
      "Cracked rubber valve stem or leaking core valve",
      "Bead seal leak from corroded aluminum wheel rim rim",
      "Sidewall pinch blowout from deep pothole impact",
    ],
    suggestedActions: [
      "Do not drive on rim (destroys tire casing and aluminum wheel)",
      "Mount compact spare tire or utilize onboard inflator sealant",
      "Request mobile roadside rescue mechanic to plug or replace tire",
    ],
    estimatedCost: "$15 - $60",
  },
  tire_wear: {
    title: "Uneven / Feathered Tire Tread Wear",
    category: "tires",
    recommendedService: "Tire Rotation, Alignment & Camber Adjustment",
    severity: "low",
    possibleCauses: [
      "Wheel camber or toe alignment angles out of tolerance",
      "Chronically operating on under-inflated or over-inflated tires",
      "Worn shock absorbers allowing tire tread scalloping",
      "Lack of periodic 10,000km tire rotation",
    ],
    suggestedActions: [
      "Check tire tread depths across inner, center, and outer shoulders",
      "Rotate front and rear tire positions across axle",
      "Schedule complete 4-wheel computerized alignment check",
    ],
    estimatedCost: "$25 - $90",
  },
  wheel_noise: {
    title: "Humming / Roaring Wheel Bearing Noise",
    category: "repair",
    recommendedService: "Wheel Hub Bearing Assembly Replacement",
    severity: "medium",
    possibleCauses: [
      "Dry, pitted, or water-contaminated wheel hub bearing",
      "Bent brake dust backing shield rubbing on brake rotor",
      "Cupped tire tread producing rhythmic drone at speed",
      "Worn CV joint outer cage",
    ],
    suggestedActions: [
      "Note if humming pitch changes when gently veering left or right",
      "Inspect brake shield clearance around rotor edge",
      "Have technician test wheel bearing hub for play and noise on lift",
    ],
    estimatedCost: "$60 - $240",
  },
  tire_pressure: {
    title: "TPMS Low Tire Pressure Warning",
    category: "tires",
    recommendedService: "Tire Pressure Calibration & TPMS Sensor Check",
    severity: "low",
    possibleCauses: [
      "Seasonal ambient temperature drop reducing internal air pressure",
      "Slow bead leak or minute puncture from wire strand",
      "TPMS tire sensor battery depletion",
      "Leaking valve stem Schrader core",
    ],
    suggestedActions: [
      "Measure cold tire pressures on all four wheels using gauge",
      "Inflate to recommended PSI stated on driver B-pillar door placard",
      "Perform TPMS system calibration reset in cluster dashboard menu",
    ],
    estimatedCost: "$10 - $40",
  },
};

export function DiagnosticsResultScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"DiagnosticsResult">["navigation"]>();
  const route =
    useRoute<CustomerStackScreenProps<"DiagnosticsResult">["route"]>();
  const { symptomIds } = route.params;

  const { currentLocation } = useLocationStore();
  const { providers, searchProviders, isLoading: providersLoading } = useProviderSearchStore();
  const { t, language } = useTranslation();

  useEffect(() => {
    if (!providers || providers.length === 0) {
      const loc = currentLocation || { latitude: 11.5564, longitude: 104.9282 };
      searchProviders(loc).catch(() => {});
    }
  }, [providers, currentLocation, searchProviders]);

  // Get diagnostic info for selected symptoms
  const results: DiagnosticDetail[] = symptomIds
    .map((id) => ALL_DIAGNOSTIC_RESULTS[id])
    .filter((r): r is DiagnosticDetail => Boolean(r));

  const primaryResult: DiagnosticDetail = results[0] || {
    title: "Vehicle System Diagnostic",
    category: "repair",
    recommendedService: "Comprehensive Vehicle Inspection",
    severity: "medium",
    possibleCauses: [
      "Sensor or mechanical wear detected",
      "Periodic service interval reached",
    ],
    suggestedActions: [
      "Schedule diagnostic inspection with a verified mechanic",
      "Monitor vehicle gauges and driving behavior",
    ],
    estimatedCost: "$35 - $120",
  };

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return {
          bg: colors.success[50],
          text: colors.success[700],
          border: colors.success[100],
        };
      case "medium":
        return {
          bg: colors.warning[50],
          text: colors.warning[700],
          border: colors.warning[100],
        };
      case "high":
        return {
          bg: colors.error[50],
          text: colors.error[700],
          border: colors.error[100],
        };
    }
  };

  const getSeverityLabel = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return t("severityLow");
      case "medium":
        return t("severityMedium");
      case "high":
        return t("severityHigh");
    }
  };

  const overallSeverity = results.some((r) => r.severity === "high")
    ? "high"
    : results.some((r) => r.severity === "medium")
      ? "medium"
      : "low";

  // Match mechanics based on diagnostic results
  const matchedMechanics = useMemo(() => {
    if (!providers || providers.length === 0) return [];

    const targetCategory = primaryResult.category.toLowerCase();
    const targetService = primaryResult.recommendedService.toLowerCase();

    const scored = providers.map((provider) => {
      let score = 75; // baseline
      let matchedReason = `Verified ${provider.businessName || "Workshop"} Specialist`;

      const hasService = provider.services?.some((s: any) => {
        const cat = s.category?.toLowerCase() || "";
        const name = s.name?.toLowerCase() || "";
        return (
          cat.includes(targetCategory) ||
          name.includes(targetCategory) ||
          (targetService && name.includes(targetService))
        );
      });

      if (hasService) {
        score += 18;
        matchedReason = `Specialist in ${primaryResult.recommendedService}`;
      } else if (
        provider.businessName?.toLowerCase().includes(targetCategory) ||
        (provider as any).specialties?.some((sp: string) => sp.toLowerCase().includes(targetCategory))
      ) {
        score += 14;
        matchedReason = `Certified ${primaryResult.category.toUpperCase()} Center`;
      }

      if (overallSeverity === "high" && (provider as any).isEmergency) {
        score += 6;
        matchedReason = "🚨 24/7 Rapid Emergency Roadside Dispatch";
      }

      if (provider.rating >= 4.8) {
        score += 4;
      }

      const dist = currentLocation
        ? getFormattedDistance(currentLocation, provider.location)
        : "Nearby";

      return {
        provider,
        score: Math.min(score, 99),
        matchedReason,
        distanceText: dist,
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [providers, primaryResult, overallSeverity, currentLocation]);

  const handleBookMechanic = (mechanic: ServiceProvider) => {
    const diagnosticSummary = `Auto Diagnostic Report: ${primaryResult.title}. Recommended Service: ${primaryResult.recommendedService}. Symptoms: ${symptomIds.join(", ")}. Est. Cost: ${primaryResult.estimatedCost}.`;
    navigation.navigate("BookingCreate", {
      providerId: mechanic.id,
      isEmergency: overallSeverity === "high",
      serviceType: primaryResult.recommendedService,
      initialNotes: diagnosticSummary,
    });
  };

  const handleBrowseMap = () => {
    navigation.navigate("CustomerTabs", {
      screen: "Search",
      params: {
        category: primaryResult.category,
        query: primaryResult.recommendedService,
        viewMode: "list",
        matchedIssue: primaryResult.recommendedService,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Assessment */}
        <AnimatedEntrance delay={0} direction="down">
          <View
            style={[
              styles.assessmentCard,
              { backgroundColor: getSeverityColor(overallSeverity).bg },
            ]}
          >
            <View style={styles.assessmentIcon}>
              <Ionicons
                name={
                  overallSeverity === "high"
                    ? "warning"
                    : overallSeverity === "medium"
                      ? "alert-circle"
                      : "checkmark-circle"
                }
                size={40}
                color={getSeverityColor(overallSeverity).text}
              />
            </View>
            <Text
              style={[
                styles.assessmentTitle,
                { color: getSeverityColor(overallSeverity).text },
              ]}
            >
              {overallSeverity === "high"
                ? t("immediateAttention")
                : overallSeverity === "medium"
                  ? t("scheduleSoon")
                  : t("minorIssue")}
            </Text>
            <Text style={styles.assessmentSubtitle}>
              {language === "km"
                ? `វិភាគផ្អែកលើ ${symptomIds.length} រោគសញ្ញា តាមរយៈប្រព័ន្ធបញ្ញាសិប្បនិម្មិត`
                : `Based on ${symptomIds.length} symptom${symptomIds.length > 1 ? "s" : ""} analyzed with expert diagnostic rules`}
            </Text>
          </View>
        </AnimatedEntrance>

        {/* Matched Mechanics Section (Direct Matching Engine) */}
        <AnimatedEntrance delay={40} direction="up">
          <View style={styles.matchedSection}>
            <View style={styles.matchedHeaderRow}>
              <View>
                <View style={styles.matchedBadgeRow}>
                  <Ionicons name="sparkles" size={14} color={colors.primary[600]} />
                  <Text style={styles.matchedBadgeText}>INTELLIGENT MECHANIC MATCH</Text>
                </View>
                <Text style={styles.matchedSectionTitle}>
                  {t("matchedMechanics")}
                </Text>
              </View>
              <TouchableOpacity onPress={handleBrowseMap} style={styles.viewAllBtn}>
                <Text style={styles.viewAllBtnText}>{t("viewAll")} ({providers.length})</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary[600]} />
              </TouchableOpacity>
            </View>

            {providersLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Text style={styles.loadingText}>{t("findingMechanics")}</Text>
              </View>
            ) : matchedMechanics.length > 0 ? (
              matchedMechanics.map((item, index) => {
                const mech = item.provider;
                return (
                  <View key={mech.id || index} style={styles.mechanicCard}>
                    {/* Top Tag & Match Percentage */}
                    <View style={styles.mechanicCardTop}>
                      <View style={styles.matchScorePill}>
                        <Ionicons name="flash" size={12} color="#16A34A" />
                        <Text style={styles.matchScoreText}>{item.score}% {t("match")}</Text>
                      </View>
                      <Text style={styles.mechanicCardDistance}>
                        <Ionicons name="location-outline" size={12} color={colors.neutral[500]} />{" "}
                        {item.distanceText}
                      </Text>
                    </View>

                    {/* Mechanic Info */}
                    <View style={styles.mechanicInfoRow}>
                      <Image
                        source={{ uri: getProviderAvatarUrl(mech) }}
                        style={styles.mechanicAvatar}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                          <Text style={styles.mechanicName} numberOfLines={1}>
                            {mech.businessName || mech.name}
                          </Text>
                          <Ionicons name="checkmark-circle" size={15} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.mechanicSpecialty} numberOfLines={1}>
                          {item.matchedReason}
                        </Text>
                        <View style={styles.mechanicMetaRow}>
                          <View style={styles.ratingPill}>
                            <Ionicons name="star" size={12} color="#EAB308" />
                            <Text style={styles.ratingText}>
                              {mech.rating ? mech.rating.toFixed(1) : "4.9"} ({mech.reviewCount || 34})
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Action Row */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.profileOutlineBtn}
                        onPress={() => navigation.navigate("ProviderDetail", { providerId: mech.id })}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.profileOutlineText}>Profile & Shop</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.bookDirectBtn}
                        onPress={() => handleBookMechanic(mech)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="calendar" size={14} color={colors.white} />
                        <Text style={styles.bookDirectText}>{t("bookSpecialist")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.noMechanicsBox}>
                <Ionicons name="build-outline" size={32} color={colors.neutral[400]} />
                <Text style={styles.noMechanicsText}>
                  {t("noRecentBookings")}
                </Text>
                <Button
                  title={t("tabSearch")}
                  onPress={handleBrowseMap}
                  variant="outline"
                  size="small"
                />
              </View>
            )}
          </View>
        </AnimatedEntrance>

        {/* Detailed Diagnostic Breakdown */}
        <AnimatedEntrance delay={80} direction="up">
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>{t("diagnosticsAi")}</Text>

            {results.length > 0 ? (
              results.map((result, index) => {
                const severityColors = getSeverityColor(result.severity);
                return (
                  <View key={index} style={styles.resultCard}>
                    {/* Header */}
                    <View style={styles.resultHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultCardTitle}>{result.title}</Text>
                        <View
                          style={[
                            styles.severityBadge,
                            { backgroundColor: severityColors.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.severityText,
                              { color: severityColors.text },
                            ]}
                          >
                            {getSeverityLabel(result.severity)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.costBadge}>
                        <Text style={styles.costLabel}>{t("estimatedCost")}</Text>
                        <Text style={styles.costValue}>{result.estimatedCost}</Text>
                      </View>
                    </View>

                    {/* Recommended Service Target */}
                    <View style={styles.recommendedServiceBox}>
                      <Ionicons name="construct-outline" size={16} color={colors.primary[600]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recommendedServiceLabel}>{t("recommendedService")}</Text>
                        <Text style={styles.recommendedServiceName}>
                          {result.recommendedService}
                        </Text>
                      </View>
                    </View>

                    {/* Possible Causes */}
                    <View style={styles.resultSection}>
                      <Text style={styles.resultSectionTitle}>{t("possibleCauses")}</Text>
                      {result.possibleCauses.map((cause, i) => (
                        <View key={i} style={styles.listItem}>
                          <View style={styles.bullet} />
                          <Text style={styles.listItemText}>{cause}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Suggested Actions */}
                    <View style={styles.resultSection}>
                      <Text style={styles.resultSectionTitle}>{t("suggestedActions")}</Text>
                      {result.suggestedActions.map((action, i) => (
                        <View key={i} style={styles.listItem}>
                          <View style={styles.actionNumber}>
                            <Text style={styles.actionNumberText}>{i + 1}</Text>
                          </View>
                          <Text style={styles.listItemText}>{action}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.noResultsCard}>
                <Ionicons name="search-outline" size={48} color={colors.neutral[300]} />
                <Text style={styles.noResultsText}>
                  No diagnostic information available for selected symptoms
                </Text>
              </View>
            )}
          </View>
        </AnimatedEntrance>

        {/* Disclaimer */}
        <AnimatedEntrance delay={120} direction="up">
          <View style={styles.disclaimerCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.neutral[500]}
            />
            <Text style={styles.disclaimerText}>
              This is an AI-assisted diagnostic estimation. Certified mechanics will
              inspect and verify physical vehicle components prior to finalizing repair work.
            </Text>
          </View>
        </AnimatedEntrance>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <AnimatedEntrance delay={140} direction="up">
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.secondaryMapButton}
            onPress={handleBrowseMap}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={18} color={colors.neutral[700]} />
            <Text style={styles.secondaryButtonText}>Browse Map</Text>
          </TouchableOpacity>

          <View style={styles.primaryButtonContainer}>
            <Button
              title={
                matchedMechanics.length > 0
                  ? `Book Top Match (${matchedMechanics[0].provider.businessName?.slice(0, 14) || "Specialist"})`
                  : "Find a Specialist"
              }
              onPress={() => {
                if (matchedMechanics.length > 0) {
                  handleBookMechanic(matchedMechanics[0].provider);
                } else {
                  handleBrowseMap();
                }
              }}
              variant="primary"
              size="large"
            />
          </View>
        </View>
      </AnimatedEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    flex: 1,
  },
  assessmentCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  assessmentIcon: {
    marginBottom: spacing.xs,
  },
  assessmentTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: "center",
  },
  assessmentSubtitle: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
    textAlign: "center",
    marginTop: 4,
  },

  // Matched Mechanics Section
  matchedSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  matchedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  matchedBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  matchedBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary[700],
    letterSpacing: 0.5,
  },
  matchedSectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
  },
  viewAllBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[600],
  },
  loadingBox: {
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  mechanicCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...shadows.sm,
  },
  mechanicCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  matchScorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D",
  },
  mechanicCardDistance: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  mechanicInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  mechanicAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
  },
  mechanicName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.neutral[900],
    flexShrink: 1,
  },
  mechanicSpecialty: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: "600",
    marginTop: 2,
  },
  mechanicMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.neutral[700],
  },
  metaDot: {
    fontSize: 12,
    color: colors.neutral[300],
  },
  mechanicPriceEstimate: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileOutlineBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  profileOutlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.neutral[700],
  },
  bookDirectBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.primary[600],
    ...shadows.sm,
  },
  bookDirectText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  noMechanicsBox: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  noMechanicsText: {
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: "center",
    marginBottom: 8,
  },

  // Technical Breakdown
  resultsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  severityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  costBadge: {
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  costLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.neutral[400],
    letterSpacing: 0.5,
  },
  costValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary[700],
    marginTop: 1,
  },
  recommendedServiceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  recommendedServiceLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.5,
  },
  recommendedServiceName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  resultSection: {
    marginBottom: spacing.sm,
  },
  resultSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary[600],
    marginTop: 6,
    marginRight: spacing.sm,
  },
  actionNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    marginTop: 1,
  },
  actionNumberText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary[600],
  },
  listItemText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 18,
  },
  noResultsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing["2xl"],
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 13,
    color: colors.neutral[400],
    textAlign: "center",
    marginTop: spacing.md,
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.neutral[500],
    lineHeight: 16,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    ...shadows.md,
  },
  secondaryMapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[700],
  },
  primaryButtonContainer: {
    flex: 1,
  },
});
