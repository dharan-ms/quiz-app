import { isAttemptExpired } from "../../src/services/attempt.service";

describe("attempt service", () => {
  it("marks attempt as expired after duration", () => {
    const startedAt = new Date(Date.now() - 61_000);
    expect(isAttemptExpired(startedAt, 60)).toBe(true);
  });

  it("keeps attempt active before duration", () => {
    const startedAt = new Date(Date.now() - 30_000);
    expect(isAttemptExpired(startedAt, 60)).toBe(false);
  });
});
