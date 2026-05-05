import { describe, expect, it } from "vitest";

import { executeBrowserSearch, parseDuckDuckGoHtml } from "../src/core/browserSearch";

const sampleHtml = `
  <html>
    <body>
      <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fhello-hermes">Hello Hermes</a>
      <a class="result__a" href="https://example.org/guide">Hermes Guide</a>
    </body>
  </html>
`;

describe("parseDuckDuckGoHtml", () => {
  it("extracts titles and urls from search result anchors", () => {
    const results = parseDuckDuckGoHtml(sampleHtml, 5);

    expect(results).toEqual([
      {
        title: "Hello Hermes",
        url: "https://example.com/hello-hermes",
      },
      {
        title: "Hermes Guide",
        url: "https://example.org/guide",
      },
    ]);
  });
});

describe("executeBrowserSearch", () => {
  it("returns parsed results and records browser opening state", async () => {
    const result = await executeBrowserSearch(
      {
        jobType: "browser_search",
        query: "hello hermes",
        options: {
          resultLimit: 2,
        },
      },
      {
        fetchImpl: async () =>
          new Response(sampleHtml, {
            status: 200,
          }),
        openUrl: async () => undefined,
      },
    );

    expect(result.browserOpened).toBe(true);
    expect(result.results[0]?.title).toBe("Hello Hermes");
    expect(result.results).toHaveLength(2);
  });
});
