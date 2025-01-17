import { yellow, blue } from "kolorist";
import path from "node:path";
import fs from "node:fs";
import { AUTO_MATCH, ROOT_WORKSPACE_DIR } from "../constants";
import { boom } from "../error";
import { userConfig } from "./config";

function removeValueFromAutoMatch(value: string) {
  for (const k in AUTO_MATCH) {
    if (k in AUTO_MATCH) {
      const val = AUTO_MATCH[k];
      if (Array.isArray(val)) {
        if (val.includes(value)) {
          AUTO_MATCH[k] = val.filter((i: string) => i !== value);
        }
      }
    }
  }
}

export function autoMatcher(autoMatchConfig?: {
  [key: string]: string[] | string;
}) {
  if (!userConfig?.autoMatch) {
    return undefined;
  }
  if (!fs.existsSync(path.resolve(ROOT_WORKSPACE_DIR, "package.json"))) {
    boom(`Please run this command in a project folder`);
  }
  const packages = require(path.resolve(ROOT_WORKSPACE_DIR, "package.json"));
  let dependencies: string[] = [];
  if (packages.dependencies) {
    // 只需要名字
    dependencies = Object.keys(packages.dependencies);
  }
  if (packages.devDependencies) {
    dependencies = dependencies.concat(Object.keys(packages.devDependencies));
  }

  for (const key in autoMatchConfig) {
    if (key in autoMatchConfig) {
      const value = autoMatchConfig[key];
      if (Array.isArray(value)) {
        value.forEach((v) => removeValueFromAutoMatch(v));
      } else if (typeof value === "string") {
        removeValueFromAutoMatch(value);
      }
    }
  }

  // merge autoMatchConfig and AUTO_MATCH, if there are duplicate keys, use autoMatchConfig
  const autoMatch = Object.assign({}, AUTO_MATCH, autoMatchConfig);
  const autoMatchKeys = new Set(Object.keys(autoMatch));
  const matchers: string[] = [];
  for (const key of autoMatchKeys) {
    const value = autoMatch[key];
    if (Array.isArray(value)) {
      const match = dependencies.filter((dep) => value.includes(dep));
      if (match.length) {
        matchers.push(key);
      }
    }
    if (typeof value === "string") {
      if (dependencies.includes(value)) {
        matchers.push(key);
      }
    }
  }
  if (matchers.length > 1) {
    boom(`Auto match category conflict: ${yellow(matchers.join(", "))}`);
  }
  if (matchers.length) {
    console.log(
      `${blue("ℹ")} Auto match ${yellow(matchers.join(""))} category`
    );
  }
  return matchers.join("");
}
