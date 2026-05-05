import { spawn } from "node:child_process";

import { createToolError, ToolErrorException } from "./errors";
import type { BrowserSearchJobInput } from "./types";

export type SearchResultItem = {
  title: string;
  url: string;
};

export type BrowserSearchExecution = {
  query: string;
  searchUrl: string;
  browserOpened: boolean;
  browserOpenAttempted: boolean;
  warnings: string[];
  results: SearchResultItem[];
};

type BrowserSearchDependencies = {
  fetchImpl?: typeof fetch;
  openUrl?: (url: string) => Promise<void>;
};

export async function executeBrowserSearch(
  input: BrowserSearchJobInput,
  dependencies: BrowserSearchDependencies = {},
): Promise<BrowserSearchExecution> {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const openUrl = dependencies.openUrl ?? openExternalUrl;
  const searchUrl = buildDuckDuckGoSearchUrl(input.query);
  const resultLimit = input.options.resultLimit ?? 5;
  const warnings: string[] = [];
  let browserOpened = false;
  let browserOpenAttempted = false;

  if (input.options.openBrowser !== false) {
    browserOpenAttempted = true;

    try {
      await openUrl(searchUrl);
      browserOpened = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Browser open failed";
      warnings.push(`Browser open failed: ${message}`);
    }
  }

  const response = await fetchImpl(getDuckDuckGoHtmlEndpoint(input.query), {
    headers: {
      "user-agent": "hello-hermes/0.1.0",
    },
  });

  if (!response.ok) {
    throw new ToolErrorException(
      createToolError("SEARCH_REQUEST_FAILED", "Search request failed.", true, {
        status: response.status,
        statusText: response.statusText,
      }),
    );
  }

  const html = await response.text();
  const results = parseDuckDuckGoHtml(html, resultLimit);

  if (results.length === 0) {
    throw new ToolErrorException(
      createToolError("SEARCH_RESULTS_EMPTY", "No search results were parsed from the browser search page.", false, {
        query: input.query,
      }),
    );
  }

  return {
    query: input.query,
    searchUrl,
    browserOpened,
    browserOpenAttempted,
    warnings,
    results,
  };
}

export function parseDuckDuckGoHtml(html: string, limit: number): SearchResultItem[] {
  const matches = html.matchAll(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
  const results: SearchResultItem[] = [];

  for (const match of matches) {
    const rawUrl = decodeHtml(match[1] ?? "");
    const title = stripTags(decodeHtml(match[2] ?? "")).trim();
    const url = unwrapDuckDuckGoRedirect(rawUrl);

    if (!title || !url) {
      continue;
    }

    results.push({ title, url });
    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

function buildDuckDuckGoSearchUrl(query: string): string {
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}

function getDuckDuckGoHtmlEndpoint(query: string): string {
  return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
}

function unwrapDuckDuckGoRedirect(url: string): string {
  try {
    const normalized = url.startsWith("//") ? `https:${url}` : url;
    const parsedUrl = new URL(normalized);
    const redirected = parsedUrl.searchParams.get("uddg");
    return redirected ? decodeURIComponent(redirected) : normalized;
  } catch {
    return url;
  }
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function openExternalUrl(url: string): Promise<void> {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args =
    process.platform === "darwin"
      ? [url]
      : process.platform === "win32"
        ? ["/c", "start", "", url]
        : [url];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
    });

    child.on("error", reject);
    child.unref();
    resolve();
  });
}
