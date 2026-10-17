import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../../lib/theme";
import { useAuth } from "../../context/AuthContext";
import { useSavedJobs } from "../../hooks/useSavedJobs";

export default function ProfileScreen() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { savedJobs } = useSavedJobs();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    if (mode === "up" && !name.trim()) {
      Alert.alert("Missing info", "Please enter your name.");
      return;
    }
    setBusy(true);
    const err =
      mode === "up"
        ? await signUp(email, password, name)
        : await signIn(email, password);
    setBusy(false);
    if (err) {
      Alert.alert(mode === "up" ? "Sign up failed" : "Login failed", err);
    } else {
      setPassword("");
      if (mode === "up") {
        Alert.alert(
          "Account created",
          "Welcome to HireSkys! Check your email to verify your account."
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Logged-in view
  if (user) {
    const displayName =
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Member";
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{savedJobs.length}</Text>
              <Text style={styles.statLabel}>Saved jobs</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          Your saved jobs sync to your account on every device.
        </Text>
      </View>
    );
  }

  // Auth view
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {mode === "in" ? "Welcome back" : "Create account"}
        </Text>
        <Text style={styles.subtitle}>
          {mode === "in"
            ? "Log in to sync saved jobs across devices."
            : "Save jobs to your account and access them anywhere."}
        </Text>

        {mode === "up" && (
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textFaint}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={colors.textFaint}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={submit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === "in" ? "Log in" : "Sign up"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switch}
          onPress={() => setMode(mode === "in" ? "up" : "in")}
        >
          <Text style={styles.switchText}>
            {mode === "in"
              ? "New here? Create an account"
              : "Have an account? Log in"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  switch: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  switchText: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: "600",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  email: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  stat: {
    alignItems: "center",
  },
  statNum: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.md,
    paddingVertical: 12,
  },
  signOutText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
