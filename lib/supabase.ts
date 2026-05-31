import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "mockKeyPart1.mockKeyPart2.mockKeyPart3";

// Check if Supabase environment variables are real
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://") &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes(".") &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.split(".").length === 3
);

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "Supabase env missing. Dynamic operations will run in degraded/direct-fail mode.",
  );
}

// Client initialization. We use eslint-disable-next-line to allow any and prevent schema mismatch compilation crashes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForSupabase = globalThis as unknown as { supabaseClient: any };
let supabaseClient = globalForSupabase.supabaseClient || null;

if (!supabaseClient) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    if (process.env.NODE_ENV !== "production") {
      globalForSupabase.supabaseClient = supabaseClient;
    }
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

export interface UserSubmission {
  name: string;
  phone: string;
  gender: string;
  dob: string;
}

/**
 * Submit waitlist registration for a specific project.
 * Checks the database first to verify if the phone number is a duplicate.
 */
export async function submitWaitlist(
  data: UserSubmission,
  projectId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      error:
        "Supabase is not configured. Please set your environment variables.",
    };
  }

  try {
    // 1. Verify that the phone number is not a duplicate for this project
    const { data: existingUsers, error: checkError } = await supabaseClient
      .from("interested_users")
      .select("id")
      .eq("project_id", projectId)
      .eq("phone", data.phone.trim())
      .limit(1);

    if (checkError) {
      console.error("Supabase check error:", checkError);
      return {
        success: false,
        error: "Database verification failed. Please try again.",
      };
    }

    if (existingUsers && existingUsers.length > 0) {
      return {
        success: false,
        error: "This phone number has already shown interest.",
      };
    }

    // 2. Perform the insertion
    const { error: insertError } = await supabaseClient
      .from("interested_users")
      .insert([
        {
          project_id: projectId,
          name: data.name.trim(),
          phone: data.phone.trim(),
          gender: data.gender,
          dob: data.dob,
        },
      ]);

    if (insertError) {
      console.error("Supabase insertion error:", insertError);
      // Catch duplicate constraint error
      if (insertError.code === "23505") {
        return {
          success: false,
          error: "This phone number has already shown interest.",
        };
      }
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Supabase connection exception:", err);
    const message =
      err instanceof Error ? err.message : "Database connection failed";
    return { success: false, error: message };
  }
}

/**
 * Log analytics event.
 */
export async function logClick(
  visitorId: string,
  projectId: string,
  clickedJoin: boolean = true,
): Promise<void> {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.warn(
      `Click analytics log bypassed (unconfigured db) for: ${projectId}`,
    );
    return;
  }

  try {
    await supabaseClient.from("analytics").insert([
      {
        project_id: projectId,
        visitor_id: visitorId,
        clicked_join: clickedJoin,
      },
    ]);
  } catch (err) {
    console.error("Supabase analytics logging error:", err);
  }
}

/**
 * Fetch total interest count for a specific project.
 */
export async function getInterestCount(projectId: string): Promise<number> {
  const BASE_COUNT = 428;
  let dynamicCount = 0;

  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { count, error } = await supabaseClient
        .from("interested_users")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (!error && count !== null) {
        dynamicCount = count;
      }
    } catch (err) {
      console.error(
        `Error fetching interest count from Supabase for ${projectId}:`,
        err,
      );
    }
  }

  return BASE_COUNT + dynamicCount;
}

export const supabase = supabaseClient;
