import { describe, it, expect } from "vitest";
import { requiredPlan, planAllows } from "@/content/navigation";

describe("plan gating", () => {
  it("free members get exactly the two spotlight readings", () => {
    expect(requiredPlan("/my-readings/topic/big-three")).toBe("free");
    expect(requiredPlan("/my-readings/topic/core-personality")).toBe("free");
  });

  it("all other topic readings need a full plan", () => {
    for (const slug of ["love", "career", "money", "health", "sex-attraction", "timing", "core-emotions", "core-legacy"]) {
      expect(requiredPlan(`/my-readings/topic/${slug}`)).toBe("full");
    }
  });

  it("creator-only tools need the creator plan", () => {
    expect(requiredPlan("/podcasts")).toBe("creator");
    expect(requiredPlan("/create")).toBe("creator");
    expect(requiredPlan("/creator")).toBe("creator");
  });

  it("masterbook and counselors need a full plan", () => {
    expect(requiredPlan("/my-masterbook")).toBe("full");
    expect(requiredPlan("/counselors")).toBe("full");
    expect(requiredPlan("/workbook/companion")).toBe("full");
  });

  it("everyday member pages stay free", () => {
    expect(requiredPlan("/my-chart")).toBe("free");
    expect(requiredPlan("/my-readings")).toBe("free");
    expect(requiredPlan("/start")).toBe("free");
  });

  it("a plan only unlocks its own rank and below", () => {
    expect(planAllows("free", "free")).toBe(true);
    expect(planAllows("free", "full")).toBe(false);
    expect(planAllows("free", "creator")).toBe(false);
    expect(planAllows("full", "free")).toBe(true);
    expect(planAllows("full", "full")).toBe(true);
    expect(planAllows("full", "creator")).toBe(false);
    expect(planAllows("creator", "creator")).toBe(true);
  });
});
