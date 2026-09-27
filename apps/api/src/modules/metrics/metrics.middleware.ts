import { Injectable, NestMiddleware } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { MetricsService } from "./metrics.service";

/**
 * Path segments that must never feed the request metrics.
 *
 * - `metrics`: scraping /metrics would otherwise observe itself and inflate
 *   request rate/error rate with the scraper's own traffic.
 * - `health`: orchestrator probes hit the API on a fixed interval regardless of
 *   user activity, which flattens latency and error panels.
 *
 * The match is segment-exact, so routes such as
 * `/api/v1/monitoring/operational-health` or `.../health-check` are still
 * measured.
 */
const EXCLUDED_SEGMENT = /(^|\/)(metrics|health)(\/|$)/;

export function isExcludedFromRequestMetrics(rawUrl?: string): boolean {
  if (!rawUrl) return false;
  const path = rawUrl.split("?")[0];
  return EXCLUDED_SEGMENT.test(path);
}

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: FastifyRequest, res: FastifyReply["raw"], next: () => void) {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      if (isExcludedFromRequestMetrics(req.url)) return;
      const durationSeconds =
        Number(process.hrtime.bigint() - start) / 1_000_000_000;
      const route =
        req.routerPath ??
        req.routeOptions?.url?.toString() ??
        req.url?.split("?")[0] ??
        "unknown";
      this.metricsService.recordHttpRequest(
        req.method,
        route,
        res.statusCode,
        durationSeconds,
      );
    });
    next();
  }
}
