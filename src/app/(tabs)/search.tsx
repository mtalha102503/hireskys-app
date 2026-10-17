import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, borderRadius } from "../../lib/theme";
import { searchJobs, type Job } from "../../lib/api";
import { JobCard } from "../../components/JobCard";

const SAVED_KEY = "@hireskys/saved_jobs";

const CATEGORIES = [
  "Engineering",
  "Marketing",
  "Design",
  "Sales",
  "Customer Service",
  "Finance",
  "Data",
  "Product",
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setJobs([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const { jobs: results, total: t } = await searchJobs(q.trim());
    setJobs(results);
    setTotal(t);
    setLoading(false);
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      if (raw) {
        const saved: Job[] = JSON.parse(raw);
        setSavedIds(new Set(saved.map((j) => j.id)));
      }
    } catch {}
  }, []);

  const toggleSave = async (job: Job) => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      let saved: Job[] = raw ? JSON.parse(raw) : [];
      if (savedIds.has(job.id)) {
        saved = saved.filter((j) => j.id !== job.id);
      } else {
        saved = [job, ...saved];
      }
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(saved));
      setSavedIds(new Set(saved.map((j) => j.id)));
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Job title, company, or keyword…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => doSearch(query)}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.textMuted}
            onPress={() => {
              setQuery("");
              setJobs([]);
              setSearched(false);
            }}
          />
        )}
      </View>

      {!searched && (
        <View style={styles.categories}>
          <Text style={styles.sectionTitle}>Browse by category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((cat) => (
              <Text
                key={cat}
                style={styles.chip}
                onPress={() => {
                  setQuery(cat);
                  doSearch(cat);
                }}
              >
                {cat}
              </Text>
            ))}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searched ? (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              saved={savedIds.has(item.id)}
              onToggleSave={toggleSave}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {total.toLocaleString()} results for “{query}”
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                No jobs match “{query}”. Try another keyword.
              </Text>
            </View>
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  categories: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    color: colors.primaryLight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
