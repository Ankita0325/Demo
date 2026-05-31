import { describe, it, expect, vi, beforeEach } from "vitest";

const { chain, queryResult } = vi.hoisted(() => {
  const queryResult = {
    data: [] as unknown[] | null,
    error: null as unknown,
    count: null as number | null,
  };

  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn((onfulfilled) => {
      return Promise.resolve({
        data: queryResult.data,
        error: queryResult.error,
        count: queryResult.count,
      }).then(onfulfilled);
    }),
  };

  return { chain, queryResult };
});

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({
      from: vi.fn().mockReturnValue(chain),
    })),
  };
});

// Import the module after mocking
import {
  isSupabaseConfigured,
  submitWaitlist,
  logClick,
  getInterestCount,
} from "../lib/supabase";

describe("Supabase Client Configuration", () => {
  it("should export isSupabaseConfigured as a boolean", () => {
    expect(typeof isSupabaseConfigured).toBe("boolean");
  });
});

describe("submitWaitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResult.data = [];
    queryResult.error = null;
    queryResult.count = null;
  });

  it("should return error if supabase is not configured", async () => {
    // If not configured in the test run environment (e.g. no env variables set)
    if (!isSupabaseConfigured) {
      const result = await submitWaitlist(
        {
          name: "John Doe",
          phone: "1234567890",
          gender: "male",
          dob: "1990-01-01",
        },
        "test-project",
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("Supabase is not configured");
    }
  });

  it("should prevent registration if phone number already exists", async () => {
    if (!isSupabaseConfigured) return; // skip if not configured in this test env

    // Mock existing user found
    queryResult.data = [{ id: "existing-id" }];
    queryResult.error = null;

    const result = await submitWaitlist(
      {
        name: "John Doe",
        phone: "1234567890",
        gender: "male",
        dob: "1990-01-01",
      },
      "test-project",
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("This phone number has already shown interest.");
  });

  it("should insert new record if phone number does not exist", async () => {
    if (!isSupabaseConfigured) return; // skip if not configured in this test env

    // Mock first check: no existing users
    queryResult.data = [];
    queryResult.error = null;

    const result = await submitWaitlist(
      {
        name: "John Doe",
        phone: "9876543210",
        gender: "female",
        dob: "1995-05-05",
      },
      "test-project",
    );

    expect(result.success).toBe(true);
    expect(chain.insert).toHaveBeenCalledWith([
      {
        project_id: "test-project",
        name: "John Doe",
        phone: "9876543210",
        gender: "female",
        dob: "1995-05-05",
      },
    ]);
  });
});

describe("getInterestCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResult.data = null;
    queryResult.error = null;
    queryResult.count = null;
  });

  it("should return BASE_COUNT + supabase count if configured", async () => {
    if (!isSupabaseConfigured) {
      const count = await getInterestCount("test-project");
      expect(count).toBe(428); // base count
      return;
    }

    queryResult.count = 22;

    const count = await getInterestCount("test-project");
    expect(count).toBe(450); // 428 + 22
  });
});

describe("logClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call insert on analytics table if configured", async () => {
    if (!isSupabaseConfigured) {
      await logClick("visitor-123", "test-project");
      expect(chain.insert).not.toHaveBeenCalled();
      return;
    }

    await logClick("visitor-123", "test-project", true);
    expect(chain.insert).toHaveBeenCalledWith([
      {
        project_id: "test-project",
        visitor_id: "visitor-123",
        clicked_join: true,
      },
    ]);
  });
});
