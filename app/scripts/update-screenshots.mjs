#!/usr/bin/env node
/**
 * Reads scripts/screenshot-urls.config and captures a screenshot for each URL.
 * Output dir: SCREENSHOTS_DIR env or ./screenshots (relative to app root).
 */
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdir } from "fs/promises";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(__dirname, "..");
const CONFIG_PATH = join(__dirname, "screenshot-urls.config");
const DEFAULT_OUTPUT_DIR = join(APP_ROOT, "screenshots");

function slugFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/\./g, "_");
    const path = (u.pathname || "/")
      .replace(/^\/+|\/+$/g, "")
      .replace(/\//g, "_") || "index";
    return `${host}${path ? "_" + path : ""}.png`;
  } catch {
    return `screenshot_${Date.now()}.png`;
  }
}

async function parseConfig() {
  const lines = createInterface({
    input: createReadStream(CONFIG_PATH),
    crlfDelay: Infinity,
  });
  const entries = [];
  for await (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [url, ...rest] = trimmed.split(/\s+/);
    if (!url) continue;
    const outputName = rest.join(" ").trim() || slugFromUrl(url);
    entries.push({ url, outputName });
  }
  return entries;
}

async function main() {
  const outputDir = process.env.SCREENSHOTS_DIR || DEFAULT_OUTPUT_DIR;
  await mkdir(outputDir, { recursive: true });

  const entries = await parseConfig();
  if (entries.length === 0) {
    console.log("No URLs in config. Edit scripts/screenshot-urls.config");
    process.exit(0);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  for (const { url, outputName } of entries) {
    const outPath = join(outputDir, outputName);
    try {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.screenshot({ path: outPath, fullPage: false });
      await page.close();
      console.log("OK", url, "->", outPath);
    } catch (err) {
      console.error("FAIL", url, err.message);
    }
  }

  await context.close();
  await browser.close();
  console.log("Done. Screenshots in", outputDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
