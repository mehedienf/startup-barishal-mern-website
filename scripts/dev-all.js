#!/usr/bin/env node
// Runs server + client + admin dev servers in parallel.
// Uses npm-run-all2 so npm is invoked through the parent shell's PATH
// (fixes `/bin/sh: run: command not found` on macOS when PATH is sparse).

import { spawn } from "node:child_process";
import process from "node:process";

const child = spawn(
  "npx",
  ["--no-install", "npm-run-all2", "--parallel", "--print-name", "--color", "dev:server", "dev:client", "dev:admin"],
  { stdio: "inherit", env: process.env }
);

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
