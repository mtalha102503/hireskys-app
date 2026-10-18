import { supabase } from "./supabase";

export interface Job {
  id: number;
  title: string;
  company: string | null;
  company_logo_url: string | null;
  location: string | null;
  category: string | null;
  job_type: string | null;
  experience_level: string | null;
  salary_range: string | null;
  tags: string[] | null;
  link: string | null;
  slug: string | null;
  date_posted: string | null;
}

// Only the columns the UI needs — keeps every query light on the DB.
const JOB_COLUMNS =
  "id,title,company,company_logo_url,location,category,job_type,experience_level,salary_range,tags,link,slug,date_posted";

function baseQuery() {
  return supabase
    .from("jobs")
    .select(JOB_COLUMNS, { count: "exact" })
    .eq("active", true)
    .eq("approved", true)
    .order("date_posted", { ascending: false });
}

export async function fetchJobs(
  page = 1,
  perPage = 20
): Promise<{ jobs: Job[]; total: number }> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, error, count } = await baseQuery().range(from, to);
  if (error) {
    console.error("fetchJobs error:", error.message);
    return { jobs: [], total: 0 };
  }
  return { jobs: (data ?? []) as Job[], total: count ?? 0 };
}

export async function searchJobs(
  query: string,
  page = 1,
  perPage = 20
): Promise<{ jobs: Job[]; total: number }> {
  const q = query.trim();
  if (!q) return fetchJobs(page, perPage);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  // ilike on title/company — single query, no extra round trips.
  const { data, error, count } = await baseQuery()
    .or(`title.ilike.%${q}%,company.ilike.%${q}%`)
    .range(from, to);
  if (error) {
    console.error("searchJobs error:", error.message);
    return { jobs: [], total: 0 };
  }
  return { jobs: (data ?? []) as Job[], total: count ?? 0 };
}

export async function fetchJobsByCategory(
  category: string,
  page = 1,
  perPage = 20
): Promise<{ jobs: Job[]; total: number }> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, error, count } = await baseQuery()
    .eq("category", category)
    .range(from, to);
  if (error) {
    console.error("fetchJobsByCategory error:", error.message);
    return { jobs: [], total: 0 };
  }
  return { jobs: (data ?? []) as Job[], total: count ?? 0 };
}

export async function fetchJobById(id: number): Promise<Job | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_COLUMNS)
    .eq("id", id)
    .eq("active", true)
    .eq("approved", true)
    .single();
  if (error) {
    console.error("fetchJobById error:", error.message);
    return null;
  }
  return data as Job;
}

// Full job record for the details screen — description is heavy,
// so it is only fetched here, never in list queries.
export interface JobDetails extends Job {
  description: string | null;
  employer_id: string | null;
  is_verified: boolean | null;
}

export async function fetchJobDetails(id: number): Promise<JobDetails | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select(`${JOB_COLUMNS},description,employer_id,is_verified`)
    .eq("id", id)
    .eq("active", true)
    .eq("approved", true)
    .single();
  if (error) {
    console.error("fetchJobDetails error:", error.message);
    return null;
  }
  return data as JobDetails;
}

export interface Company {
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  location: string | null;
  industry: string | null;
  verified: boolean | null;
}

export async function fetchCompanyByEmployerId(
  employerId: string
): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("slug,name,description,logo_url,website,location,industry,verified")
    .eq("employer_id", employerId)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("fetchCompanyByEmployerId error:", error.message);
    return null;
  }
  return data as Company | null;
}
