import {
  MetricsMiddleware,
  isExcludedFromRequestMetrics,
} from "./metrics.middleware";

function makeRes(statusCode = 200) {
  const handlers: Record<string, () => void> = {};
  return {
    statusCode,
    on: jest.fn((event: string, cb: () => void) => {
      handlers[event] = cb;
    }),
    finish: () => handlers.finish?.(),
  };
}

function makeReq(url: string, routerPath?: string) {
  return { method: "GET", url, routerPath } as unknown as Parameters<
    MetricsMiddleware["use"]
  >[0];
}

describe("isExcludedFromRequestMetrics", () => {
  it.each([
    "/metrics",
    "/metrics?format=json",
    "/health",
    "/health/live",
    "/api/v1/health/ready",
    "/api/v1/v1/health/startup",
  ])("excludes %s", (url) => {
    expect(isExcludedFromRequestMetrics(url)).toBe(true);
  });

  it.each([
    "/api/v1/workspaces",
    "/api/v1/monitoring/operational-health",
    "/api/v1/contracts/health-check",
    undefined,
  ])("keeps %s", (url) => {
    expect(isExcludedFromRequestMetrics(url)).toBe(false);
  });
});

describe("MetricsMiddleware", () => {
  let recordHttpRequest: jest.Mock;
  let middleware: MetricsMiddleware;

  beforeEach(() => {
    recordHttpRequest = jest.fn();
    middleware = new MetricsMiddleware({ recordHttpRequest } as never);
  });

  it("records a normal request with its resolved route and status", () => {
    const res = makeRes(200);
    const next = jest.fn();

    middleware.use(
      makeReq("/api/v1/workspaces?page=1", "/api/v1/workspaces"),
      res as never,
      next,
    );
    res.finish();

    expect(next).toHaveBeenCalled();
    expect(recordHttpRequest).toHaveBeenCalledTimes(1);
    const [method, route, status, duration] = recordHttpRequest.mock.calls[0];
    expect(method).toBe("GET");
    expect(route).toBe("/api/v1/workspaces");
    expect(status).toBe(200);
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it("falls back to the URL path when no route was matched", () => {
    const res = makeRes(404);
    middleware.use(makeReq("/api/v1/does-not-exist"), res as never, jest.fn());
    res.finish();

    expect(recordHttpRequest).toHaveBeenCalledWith(
      "GET",
      "/api/v1/does-not-exist",
      404,
      expect.any(Number),
    );
  });

  it("does not record the scrape of /metrics", () => {
    const res = makeRes();
    middleware.use(makeReq("/metrics"), res as never, jest.fn());
    res.finish();

    expect(recordHttpRequest).not.toHaveBeenCalled();
  });

  it.each(["/api/v1/health/live", "/api/v1/v1/health/ready"])(
    "does not record the health probe %s",
    (url) => {
      const res = makeRes();
      middleware.use(makeReq(url), res as never, jest.fn());
      res.finish();

      expect(recordHttpRequest).not.toHaveBeenCalled();
    },
  );

  it("still records a business route whose name merely contains health", () => {
    const res = makeRes();
    middleware.use(
      makeReq("/api/v1/monitoring/operational-health"),
      res as never,
      jest.fn(),
    );
    res.finish();

    expect(recordHttpRequest).toHaveBeenCalledTimes(1);
  });
});
