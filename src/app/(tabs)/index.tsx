import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { colors, spacing } from "../../lib/theme";
import { fetchJobs, type Job } from "../../lib/api";
import { JobCard } from "../../components/JobCard";
import { useSavedJobs } from "../../hooks/useSavedJobs";

export default function HomeScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isSaved, toggleSave } = useSavedJobs();

  const load = useCallback(async (p: number, append = false) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    const { jobs: newJobs, total: t } = await fetchJobs(p);
    setTotal(t);
    setJobs((prev) => (append ? [...prev, ...newJobs] : newJobs));
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(1);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    load(1);
  };

  const onEndReached = () => {
    if (!loadingMore && jobs.length < total) {
      const next = page + 1;
      setPage(next);
      load(next, true);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Finding remote jobs…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>
          {total.toLocaleString()} active remote jobs
        </Text>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            saved={isSaved(item.id)}
            onToggleSave={toggleSave}
          />
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.footer}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No jobs found right now.</Text>
          </View>
        }
      />
    </View>
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
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  count: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
