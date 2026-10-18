import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../../lib/theme";
import {
  fetchJobDetails,
  fetchCompanyByEmployerId,
  type JobDetails,
  type Company,
} from "../../lib/api";
import { HtmlText } from "../../components/HtmlText";
import { useSavedJobs } from "../../hooks/useSavedJobs";

function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSave } = useSavedJobs();

  useEffect(() => {
    (async () => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        setLoading(false);
        return;
      }
      const details = await fetchJobDetails(numericId);
      setJob(details);
      if (details?.employer_id) {
        setCompany(await fetchCompanyByEmployerId(details.employer_id));
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
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.textFaint}
        />
        <Text style={styles.emptyText}>
          Couldn&apos;t load this job.{"\n"}Open it on hireskys.com instead.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL("https://www.hireskys.com")}
        >
          <Text style={styles.buttonText}>Open HireSkys</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = isSaved(job.id);
  const posted = timeAgo(job.date_posted);
  const companyName = company?.name ?? job.company;
  const companyLogo = company?.logo_url ?? job.company_logo_url;
  const jobUrl = `https://www.hireskys.com/jobs/${job.slug ?? job.id}`;

  return (
    <ScrollView style={styles.container}>
      {/* Header card — mirrors the website's job header */}
      <View style={styles.card}>
        <Text style={styles.title}>{job.title}</Text>

        {companyName ? (
          <View style={styles.companyRow}>
            {companyLogo ? (
              <Image source={{ uri: companyLogo }} style={styles.logo} />
            ) : null}
            <Text style={styles.company}>{companyName}</Text>
            {company?.verified || job.is_verified ? (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.verified}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.metaRow}>
          {job.location ? (
            <View style={styles.pill}>
              <Ionicons
                name="location-outline"
                size={13}
                color={colors.textMuted}
              />
              <Text style={styles.pillText}>{job.location}</Text>
            </View>
          ) : null}
          {job.salary_range ? (
            <View style={[styles.pill, styles.salaryPill]}>
              <Text style={[styles.pillText, styles.salaryText]}>
                {job.salary_range}
              </Text>
            </View>
          ) : null}
          {job.job_type ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{job.job_type}</Text>
            </View>
          ) : null}
          {job.experience_level ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{job.experience_level}</Text>
            </View>
          ) : null}
          {job.category ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{job.category}</Text>
            </View>
          ) : null}
          {posted ? (
            <View style={styles.pill}>
              <Ionicons name="time-outline" size={13} color={colors.textMuted} />
              <Text style={styles.pillText}>{posted}</Text>
            </View>
          ) : null}
        </View>

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

      {/* Full description — same content as the website's Job Description card */}
      {job.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <HtmlText
            html={job.description}
            style={styles.description}
            boldStyle={styles.descriptionBold}
          />
        </View>
      ) : null}

      {/* Company card — mirrors the website's company block */}
      {company ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About {company.name}</Text>
          <View style={styles.companyRow}>
            {company.logo_url ? (
              <Image source={{ uri: company.logo_url }} style={styles.logo} />
            ) : null}
            <View style={styles.companyInfo}>
              <View style={styles.companyNameRow}>
                <Text style={styles.companyCardName}>{company.name}</Text>
                {company.verified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.verified}
                  />
                ) : null}
              </View>
              {[company.industry, company.location]
                .filter(Boolean)
                .join(" • ") ? (
                <Text style={styles.companyMeta}>
                  {[company.industry, company.location]
                    .filter(Boolean)
                    .join(" • ")}
                </Text>
              ) : null}
            </View>
          </View>
          {company.description ? (
            <Text style={styles.companyDesc} numberOfLines={6}>
              {company.description}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() =>
              Linking.openURL(
                `https://www.hireskys.com/companies/${company.slug}`
              )
            }
          >
            <Text style={styles.outlineButtonText}>View Company Profile</Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => Linking.openURL(jobUrl)}
        >
          <Text style={styles.applyText}>View & Apply on HireSkys</Text>
          <Ionicons name="open-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saved && styles.saveButtonActive]}
          onPress={() => toggleSave(job)}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? "#fff" : colors.primary}
          />
          <Text
            style={[styles.saveText, saved && styles.saveTextActive]}
          >
            {saved ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Opens the full job page on hireskys.com — apply from there
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
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    // subtle shadow on light theme
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  company: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  companyInfo: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  companyCardName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  companyMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  companyDesc: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  salaryPill: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  salaryText: {
    color: colors.success,
    fontWeight: "700",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: "#EEF2FF",
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  description: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 22,
  },
  descriptionBold: {
    fontWeight: "700",
    color: colors.text,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    marginTop: spacing.md,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  saveText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  saveTextActive: {
    color: "#fff",
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
