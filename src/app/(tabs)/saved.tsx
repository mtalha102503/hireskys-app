import { useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../lib/theme";
import { JobCard } from "../../components/JobCard";
import { useSavedJobs } from "../../hooks/useSavedJobs";

export default function SavedScreen() {
  const { savedJobs, toggleSave, refresh } = useSavedJobs();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View style={styles.container}>
      {savedJobs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={56} color={colors.textFaint} />
          <Text style={styles.emptyTitle}>No saved jobs yet</Text>
          <Text style={styles.emptyText}>
            Tap the bookmark icon on any job to save it here for later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <JobCard job={item} saved onToggleSave={toggleSave} />
          )}
          ListHeaderComponent={
            <Text style={styles.count}>
              {savedJobs.length} saved job{savedJobs.length === 1 ? "" : "s"}
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
