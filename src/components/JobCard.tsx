import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../lib/theme";
import type { Job } from "../lib/api";

interface Props {
  job: Job;
  saved?: boolean;
  onToggleSave?: (job: Job) => void;
}

export function JobCard({ job, saved = false, onToggleSave }: Props) {
  return (
    <Link href={`/job/${job.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.row}>
          <View style={styles.main}>
            <Text style={styles.title} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={styles.company} numberOfLines={1}>
              {job.company}
            </Text>
            <View style={styles.meta}>
              {job.location ? (
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {job.location}
                  </Text>
                </View>
              ) : null}
              {job.job_type ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{job.job_type}</Text>
                </View>
              ) : null}
            </View>
            {job.salary_range ? (
              <Text style={styles.salary} numberOfLines={1}>
                {job.salary_range}
              </Text>
            ) : null}
          </View>
          {onToggleSave ? (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => onToggleSave(job)}
              hitSlop={12}
            >
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={saved ? colors.primaryLight : colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  main: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  company: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    maxWidth: 180,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  salary: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  saveBtn: {
    padding: 4,
    marginLeft: spacing.sm,
  },
});
