// HireSkys API client — talks to the public hireskys.com API
// No keys needed; uses the same search backend as the website.

const API_BASE = "https://www.hireskys.com/api/v1";

export interface Job {
  id: string;
  title: string;
  company: string;
  company_logo_url?: string;
  location: string;
  category?: string;
  job_type?: string;
  experience_level?: string;
  salary_range?: string;
  tags?: string[];
  link?: string;
  date_posted?: string;
  description?: string;
}

interface JobsResponse {
  success: boolean;
  data?: Job[];
  total_jobs?: number;
  page?: number;
  total_pages?: number;
}

async function apiGet(path: string, params: Record<string, string> = {}): Promise<JobsResponse | null> {
  try {
    const url = new URL(`${API_BASE}${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return (await res.json()) as JobsResponse;
  } catch (e) {
    console.error("API error:", e);
    return null;
  }
}

export async function fetchJobs(page = 1, perPage = 20): Promise<{ jobs: Job[]; total: number }> {
  const data = await apiGet("/jobs", {
    q: "*",
    page: String(page),
    per_page: String(perPage),
  });
  return { jobs: data?.data ?? [], total: data?.total_jobs ?? 0 };
}

export async function searchJobs(query: string, page = 1): Promise<{ jobs: Job[]; total: number }> {
  const data = await apiGet("/jobs", {
    q: query || "*",
    page: String(page),
    per_page: "20",
  });
  return { jobs: data?.data ?? [], total: data?.total_jobs ?? 0 };
}

export async function fetchJobsByCategory(category: string, page = 1): Promise<{ jobs: Job[]; total: number }> {
  const data = await apiGet("/jobs", {
    q: "*",
    category,
    page: String(page),
    per_page: "20",
  });
  return { jobs: data?.data ?? [], total: data?.total_jobs ?? 0 };
}
