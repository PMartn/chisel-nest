import type { FormState } from "./formState";

const PROJECT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const MODULE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

export const projectNameError = (name: string): string | null => {
  if (!name.trim()) return "Project name is required.";
  if (!PROJECT_NAME_PATTERN.test(name)) {
    return "Use letters, numbers, dashes or underscores — no spaces.";
  }
  return null;
};

export const moduleNameError = (name: string): string | null => {
  if (!name.trim()) return "Module name is required.";
  if (!MODULE_NAME_PATTERN.test(name)) {
    return "Letters and numbers only, starting with a letter (e.g. Product).";
  }
  return null;
};

export const isFormValid = (config: FormState): boolean =>
  projectNameError(config.projectName) === null &&
  config.modules.every((m) => moduleNameError(m.name) === null);
