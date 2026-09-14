import { defineConfig, type UserConfig } from "universal-ai-config";

process.loadEnvFile();

const UAC_TARGETS = "UAC_TARGETS";
const targets = process.env[UAC_TARGETS];

if (!targets?.trim()) {
  console.error(
    `\x1b[31mError:\x1b[0m The \x1b[33m${UAC_TARGETS}\x1b[0m environment variable must be set to one or more targets separated by commas (e.g. \x1b[36mUAC_TARGETS=claude,copilot,cursor\x1b[0m).`,
  );

  process.exit(1);
}

export default defineConfig({
  templatesDir: ".opinion",

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  targets: targets
    .split(",")
    .map((target) => target.trim())
    .filter(Boolean) as UserConfig["targets"],

  variables: {
    projectName: "brain",
  },
});
