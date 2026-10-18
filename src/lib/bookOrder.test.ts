import { describe, it, expect } from "vitest";
import { validateBookOrder, type BookOrderDraft } from "@/lib/bookOrder";

const ok: BookOrderDraft = {
  userId: "11111111-1111-1111-1111-111111111111",
  coverReady: true,
  manuscriptReady: true,
  extras: [],
  address: { name: "Jane Doe", line1: "1 Main St", line2: "", city: "Portland", state: "OR", postal_code: "97201", country: "US" },
};

describe("book order checkout validation", () => {
  it("accepts a complete order", () => {
    expect(validateBookOrder(ok)).toBeNull();
  });

  it("rejects signed-out visitors", () => {
    expect(validateBookOrder({ ...ok, userId: null })).toMatch(/sign in/i);
  });

  it("rejects an order without a chosen cover", () => {
    expect(validateBookOrder({ ...ok, coverReady: false })).toMatch(/cover/i);
  });

  it("rejects an order without a composed manuscript", () => {
    expect(validateBookOrder({ ...ok, manuscriptReady: false })).toMatch(/manuscript/i);
  });

  it("rejects blank extra sections", () => {
    expect(validateBookOrder({ ...ok, extras: ["Creativity", "  "] })).toMatch(/extra section/i);
  });

  it("rejects a missing address field", () => {
    expect(validateBookOrder({ ...ok, address: { ...ok.address, city: "" } })).toMatch(/address/i);
  });

  it("rejects non-US shipping", () => {
    expect(validateBookOrder({ ...ok, address: { ...ok.address, country: "CA" } })).toMatch(/United States/i);
  });

  it("rejects a malformed ZIP code", () => {
    expect(validateBookOrder({ ...ok, address: { ...ok.address, postal_code: "97" } })).toMatch(/ZIP/i);
    expect(validateBookOrder({ ...ok, address: { ...ok.address, postal_code: "ABCDE" } })).toMatch(/ZIP/i);
  });

  it("rejects a full state name instead of the two-letter code", () => {
    expect(validateBookOrder({ ...ok, address: { ...ok.address, state: "Oregon" } })).toMatch(/state code/i);
  });
});

import { bookTotal } from "./books";
describe("digital AstroBook", () => {
  const empty = { name: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "US" };
  it("costs $19.99 for both standard and expanded", () => {
    expect(bookTotal("standard", 0, "digital")).toBe(1999);
    expect(bookTotal("expanded", 0, "digital")).toBe(1999);
  });
  it("does not need a shipping address", () => {
    expect(validateBookOrder({ userId: "u", coverReady: true, manuscriptReady: true, extras: [], address: empty, digital: true })).toBeNull();
  });
  it("printed books still need an address", () => {
    expect(validateBookOrder({ userId: "u", coverReady: true, manuscriptReady: true, extras: [], address: empty })).not.toBeNull();
  });
});
