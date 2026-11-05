import { describe, expect, test } from "vitest";
import {
  canTransition,
  isOrderStatus,
  nextStatuses,
  ORDER_STATUSES,
} from "@/lib/orders";

describe("nextStatuses", () => {
  test("follows the kitchen workflow", () => {
    expect(nextStatuses("pending")).toEqual(["preparing", "cancelled"]);
    expect(nextStatuses("preparing")).toEqual(["ready", "cancelled"]);
    expect(nextStatuses("ready")).toEqual(["delivered"]);
    expect(nextStatuses("delivered")).toEqual([]);
    expect(nextStatuses("cancelled")).toEqual([]);
  });
});

describe("canTransition", () => {
  test("allows only the declared moves", () => {
    expect(canTransition("pending", "preparing")).toBe(true);
    expect(canTransition("pending", "cancelled")).toBe(true);
    expect(canTransition("preparing", "ready")).toBe(true);
    expect(canTransition("ready", "delivered")).toBe(true);
    expect(canTransition("ready", "pending")).toBe(false);
    expect(canTransition("delivered", "pending")).toBe(false);
    expect(canTransition("delivered", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "pending")).toBe(false);
  });
});

describe("isOrderStatus", () => {
  test("accepts known statuses only", () => {
    for (const status of ORDER_STATUSES) {
      expect(isOrderStatus(status)).toBe(true);
    }
    for (const bad of ["shipped", "", null, undefined, 1, {}]) {
      expect(isOrderStatus(bad)).toBe(false);
    }
  });
});