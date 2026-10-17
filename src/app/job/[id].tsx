import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../../lib/theme";
import { fetchJobById, type Job } from "../../lib/api";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        setJob(null);
      } else {
        setJob(await fetchJobById(numericId));
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textFaint} />
        <Text style={styles.emptyText}>
          Couldn&apos;t load this job.{"\n"}Open it on hireskys.com instead.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL(`https://www.hireskys.com/jobs/${id}`)}
        >
          <Text style={styles.buttonText}>View on Website</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{job.title}</Text>
        {job.company ? (
          <Text style={styles.company}>{job.company}</Text>
        ) : null}

        <View style={styles.metaRow}>
          {job.location ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
          ) : null}
          {job.job_type ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{job.job_type}</Text>
            </View>
          ) : null}
          {job.category ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{job.category}</Text>
            </View>
          ) : null}
        </View>

        {job.salary_range ? (
          <Text style={styles.salary}>{job.salary_range}</Text>
        ) : null}

        {job.tags && job.tags.length > 0 ? (
          <View style={styles.tags}>
            {job.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() =>
          Linking.openURL(job.link ?? `https://www.hireskys.com/jobs/${job.id}`)
        }
      >
        <Text style={styles.applyText}>Apply on HireSkys</Text>
        <Ionicons name="open-outline" size={18} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.hint}>
        Applying opens the full job page on hireskys.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    margin: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  company: {
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  salary: {
    color: colors.success,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginTop: spacing.md,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  hint: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
