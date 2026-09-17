import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";

export function EditProfileScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"EditProfile">["navigation"]>();
  const { user } = useAuthStore();

  const menuItems = [
    {
      title: "Personal Information",
      icon: "person-outline" as const,
      onPress: () => {},
    },
    {
      title: "Phone Number",
      icon: "call-outline" as const,
      onPress: () => {},
    },
    {
      title: "Email Address",
      icon: "mail-outline" as const,
      onPress: () => {},
    },
    {
      title: "Profile Photo",
      icon: "image-outline" as const,
      onPress: () => {},
    },
    {
      title: "Change Password",
      icon: "lock-closed-outline" as const,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.neutral[700]}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || "User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={colors.primary[600]}
              />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.neutral[300]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  menuSection: {
    paddingVertical: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.neutral[900],
    fontWeight: fontWeight.medium,
  },
});
