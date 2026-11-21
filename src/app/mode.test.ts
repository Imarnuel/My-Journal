import { describe, expect, it } from "vitest";
import { detectedZone, localDate, localTime, REAL } from "./mode";

describe("journal mode", () => {
  it("tests run on the sample journal", () => {
    expect(REAL).toBe(false);
  });
  it("dates and times are the user's local day and clock, zero-padded", () => {
    const d = new Date(2027, 0, 5, 7, 3); // 5 January 2027, 07:03 local
    expect(localDate(d)).toBe("2027-01-05");
    expect(localTime(d)).toBe("07:03");
  });
  it("names the user's time zone as Settings does", () => {
    expect(detectedZone()).toMatch(/^.+ \(UTC(\+0|[+\u2212]\d{1,2}(:\d{2})?)\)$/);
  });
});
