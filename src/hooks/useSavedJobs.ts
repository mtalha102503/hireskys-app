import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { fetchJobById, type Job } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const SAVED_KEY = "@hireskys/saved_jobs";

/**
 * Saved jobs: stored locally always (works offline + logged out).
 * When logged in, also synced to the user's Supabase account.
 */
export function useSavedJobs() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const loadLocal = useCallback(async (): Promise<Job[]> => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      return raw ? (JSON.parse(raw) as Job[]) : [];
    } catch {
      return [];
    }
  }, []);

  const persistLocal = useCallback(async (jobs: Job[]) => {
    try {
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(jobs));
    } catch {}
  }, []);

  // Load: merge local + cloud (cloud wins on conflict).
  const refresh = useCallback(async () => {
    const local = await loadLocal();
    const localMap = new Map(local.map((j) => [j.id, j]));

    if (user) {
      const { data } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user.id);
      const cloudIds = (data ?? []).map((r) => r.job_id as number);
      // Fetch any cloud-saved jobs missing locally (one batched pass).
      const missing = cloudIds.filter((id) => !localMap.has(id));
      for (const id of missing) {
        const job = await fetchJobById(id);
        if (job) localMap.set(id, job);
      }
      // Push local-only saves up to the cloud.
      const localOnly = [...localMap.keys()].filter(
        (id) => !cloudIds.includes(id)
      );
      if (localOnly.length > 0) {
        await supabase.from("saved_jobs").upsert(
          localOnly.map((job_id) => ({ user_id: user.id, job_id })),
          { onConflict: "user_id,job_id" }
        );
      }
    }

    const merged = [...localMap.values()];
    setSavedJobs(merged);
    setSavedIds(new Set(merged.map((j) => j.id)));
    await persistLocal(merged);
  }, [user, loadLocal, persistLocal]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const isSaved = useCallback((id: number) => savedIds.has(id), [savedIds]);

  const toggleSave = useCallback(
    async (job: Job) => {
      const next = new Map(savedJobs.map((j) => [j.id, j]));
      if (next.has(job.id)) {
        next.delete(job.id);
        if (user) {
          await supabase
            .from("saved_jobs")
            .delete()
            .eq("user_id", user.id)
            .eq("job_id", job.id);
        }
      } else {
        next.set(job.id, job);
        if (user) {
          await supabase
            .from("saved_jobs")
            .upsert(
              { user_id: user.id, job_id: job.id },
              { onConflict: "user_id,job_id" }
            );
        }
      }
      const arr = [...next.values()];
      setSavedJobs(arr);
      setSavedIds(new Set(arr.map((j) => j.id)));
      await persistLocal(arr);
    },
    [savedJobs, user, persistLocal]
  );

  return { savedJobs, savedIds, isSaved, toggleSave, refresh };
}
