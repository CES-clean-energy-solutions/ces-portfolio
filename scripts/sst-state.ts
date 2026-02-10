#!/usr/bin/env npx tsx
/**
 * Pretty-prints SST state export.
 * Usage: sst state export --stage dev | npx tsx scripts/sst-state.ts
 */

import { stdin } from "process";

interface Resource {
  urn: string;
  type: string;
  id?: string;
  custom?: boolean;
  outputs?: Record<string, unknown>;
  parent?: string;
  created?: string;
  modified?: string;
}

interface SSTState {
  stack: string;
  latest: {
    manifest: { time: string; version: string };
    resources: Resource[];
  };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function shortType(type: string): string {
  // "aws:cloudfront/cachePolicy:CachePolicy" → "cloudfront:CachePolicy"
  // "sst:aws:Nextjs" → "sst:Nextjs"
  // "pulumi:providers:aws" → "pulumi:aws"
  const parts = type.split(":");
  if (parts[0] === "aws") {
    const provider = parts[1]?.split("/")[0] ?? "";
    const resource = parts[2] ?? "";
    return `aws:${provider}:${resource}`;
  }
  if (parts[0] === "sst") {
    return `sst:${parts[parts.length - 1]}`;
  }
  if (parts[0] === "pulumi") {
    return `pulumi:${parts[parts.length - 1]}`;
  }
  return type;
}

function extractName(urn: string): string {
  return urn.split("::").pop() ?? urn;
}

function dim(text: string): string {
  return `\x1b[2m${text}\x1b[0m`;
}

function bold(text: string): string {
  return `\x1b[1m${text}\x1b[0m`;
}

function cyan(text: string): string {
  return `\x1b[36m${text}\x1b[0m`;
}

function yellow(text: string): string {
  return `\x1b[33m${text}\x1b[0m`;
}

function green(text: string): string {
  return `\x1b[32m${text}\x1b[0m`;
}

async function main() {
  const raw = await readStdin();
  const state: SSTState = JSON.parse(raw);

  const { stack, latest } = state;
  const { manifest, resources } = latest;

  // Header
  console.log("");
  console.log(bold(`  Stack: ${cyan(stack)}`));
  console.log(
    dim(
      `  Deployed: ${manifest.time.slice(0, 19).replace("T", " ")}  |  SST: ${manifest.version}`
    )
  );

  // Find the root stack resource for outputs (URL etc)
  const root = resources.find((r) => r.type === "pulumi:pulumi:Stack");
  if (root?.outputs) {
    const { _protect, ...outputs } = root.outputs as Record<string, unknown>;
    const entries = Object.entries(outputs).filter(
      ([k]) => !k.startsWith("_")
    );
    if (entries.length > 0) {
      console.log("");
      console.log(bold("  Outputs:"));
      for (const [key, value] of entries) {
        console.log(`    ${key}: ${green(String(value))}`);
      }
    }
  }

  // Group resources by SST component (parent) vs raw AWS
  const sstComponents = resources.filter(
    (r) => r.type.startsWith("sst:") && !r.type.includes("$")
  );
  const awsResources = resources.filter(
    (r) =>
      r.type.startsWith("aws:") &&
      r.custom === true &&
      !r.type.startsWith("pulumi:")
  );
  const skipTypes = new Set([
    "pulumi:pulumi:Stack",
    "pulumi:providers:aws",
  ]);

  // Table: AWS resources
  console.log("");
  console.log(bold(`  Resources: ${yellow(String(awsResources.length))} AWS`));
  console.log("");

  // Build rows and compute column widths
  const rows = awsResources
    .map((r) => ({
      type: shortType(r.type),
      name: extractName(r.urn),
      id: r.id ?? "-",
    }))
    .sort((a, b) => a.type.localeCompare(b.type));

  const typeWidth = Math.max(...rows.map((r) => r.type.length), 4);
  const nameWidth = Math.max(...rows.map((r) => r.name.length), 4);

  // Header row
  console.log(
    dim(
      `    ${"TYPE".padEnd(typeWidth)}  ${"NAME".padEnd(nameWidth)}  ID`
    )
  );
  console.log(dim(`    ${"─".repeat(typeWidth)}  ${"─".repeat(nameWidth)}  ${"─".repeat(20)}`));

  for (const row of rows) {
    const type = cyan(row.type.padEnd(typeWidth));
    const name = row.name.padEnd(nameWidth);
    const id = dim(row.id.length > 40 ? row.id.slice(0, 37) + "..." : row.id);
    console.log(`    ${type}  ${name}  ${id}`);
  }

  console.log("");
}

main().catch((err) => {
  console.error("Failed to parse SST state:", err.message);
  process.exit(1);
});
