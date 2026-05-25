import { isbot } from "isbot";
import type { NextFunction, Request, Response } from "express";

const ANALYTICS_BOT_FILTER_ENABLED = true;
const TOOL_USER_AGENT_PATTERNS = [
  /\baxios\b/i,
  /\bcurl\b/i,
  /\bgot\//i,
  /\bheadlesschrome\b/i,
  /\binsomnia\b/i,
  /\bnode-fetch\b/i,
  /\bplaywright\b/i,
  /\bpostmanruntime\b/i,
  /\bpuppeteer\b/i,
  /\bpython-requests\b/i,
  /\bpython-urllib\b/i,
  /\bselenium\b/i,
  /\bwget\b/i
];

function readUserAgent(request: Request) {
  const userAgent = request.headers["user-agent"];

  return Array.isArray(userAgent) ? userAgent[0]?.trim() : userAgent?.trim();
}

function readAnalyticsEventCount(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return 0;
  }

  const events = (body as { events?: unknown }).events;

  return Array.isArray(events) ? events.length : 0;
}

function shouldDropAnalyticsRequest(request: Request) {
  const userAgent = readUserAgent(request);

  if (!userAgent) {
    return true;
  }

  return isbot(userAgent) || TOOL_USER_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function filterAnalyticsBotRequest(
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (!ANALYTICS_BOT_FILTER_ENABLED || !shouldDropAnalyticsRequest(request)) {
    next();
    return;
  }

  response.status(202).json({
    accepted: 0,
    dropped: readAnalyticsEventCount(request.body)
  });
}
