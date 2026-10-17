import { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../lib/theme";
import type { Job } from "../../lib/api";
import { JobCard } from "../../components/JobCard";

const SAVED_KEY = "@hireskys/saved_jobs";

export default function SavedScreen() {
  const [saved, setSaved] = useState<Job[]>([]);

  const loadSaved = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      setSaved(raw ? JSON.parse(raw) : []);
    } catch {
      setSaved([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [loadSaved])
  );

  const removeSaved = async (job: Job) => {
    try {
      const updated = saved.filter((j) => j.id !== job.id);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      setSaved(updated);
    } catch {}
  };

  return (
    <View style={styles.container}>
      {saved.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={56} color={colors.textFaint} />
          <Text style={styles.emptyTitle}>No saved jobs yet</Text>
          <Text style={styles.emptyText}>
            Tap the bookmark icon on any job to save it here for later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard job={item} saved onToggleSave={removeSaved} />
          )}
          ListHeaderComponent={
            <Text style={styles.count}>
              {saved.length} saved job{saved.length === 1 ? "" : "s"}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  count: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
