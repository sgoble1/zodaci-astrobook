import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: vi.fn(async () => ({ data: { session: null } })) },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

import { ALL_READINGS, FREE_READINGS, TOPIC_READINGS, SYSTEM_READINGS, CORE_THEMES, canWriteAllReadings } from "@/lib/topicReadings";

describe("free-reading limits", () => {
  it("writes exactly two readings for free members", () => {
    expect(FREE_READINGS).toHaveLength(2);
    expect(FREE_READINGS).toEqual(["big-three", "core-personality"]);
  });

  it("the full library is 38 readings across topics, systems and core themes", () => {
    expect(TOPIC_READINGS).toHaveLength(18);
    expect(SYSTEM_READINGS).toHaveLength(8);
    expect(CORE_THEMES).toHaveLength(12);
    expect(ALL_READINGS).toHaveLength(38);
  });

  it("every free reading exists in the full set", () => {
    const slugs = new Set(ALL_READINGS.map(r => r.slug));
    for (const slug of FREE_READINGS) expect(slugs.has(slug)).toBe(true);
  });

  it("no duplicate slugs", () => {
    const slugs = ALL_READINGS.map(r => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("signed-out visitors may never write the full set", async () => {
    await expect(canWriteAllReadings()).resolves.toBe(false);
  });
});
