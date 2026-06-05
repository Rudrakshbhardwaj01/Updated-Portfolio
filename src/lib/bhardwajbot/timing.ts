import { logBhardwajBot } from "./logger";

export class RequestTiming {
  private readonly start = Date.now();
  private readonly marks = new Map<string, number>();

  constructor(private readonly requestId: string) {}

  mark(label: string): number {
    const elapsed = Date.now() - this.start;
    this.marks.set(label, elapsed);
    return elapsed;
  }

  get(label: string): number | undefined {
    return this.marks.get(label);
  }

  report(): Record<string, number> {
    const report = Object.fromEntries(
      [...this.marks.entries()].sort(([, a], [, b]) => a - b),
    );

    logBhardwajBot(this.requestId, "info", "stream_closed", {
      timing: JSON.stringify(report),
      firstTokenMs: report.first_token ?? null,
      totalMs: report.response_complete ?? null,
    });

    return report;
  }
}
