import fs from "fs";
import path from "path";

/**
 * Find the nearest package.json file path
 */
export const findPackageJSONPath = (
  dir: string,
  // e.g. packages/core
  packagePath?: string
): string => {
  const nextDir = (() => {
    if (packagePath) {
      return dir.endsWith(packagePath)
        ? dir.replace(new RegExp(`${packagePath}$`), "")
        : dir;
    }

    return dir;
  })();

  const packageJSONPath = path.join(nextDir, packagePath || "", "package.json");
  if (fs.existsSync(packageJSONPath)) {
    return packageJSONPath;
  }
  const parentDir = path.dirname(dir);

  if (parentDir === dir) {
    throw new Error("package.json not found");
  }
  return findPackageJSONPath(parentDir, packagePath);
};

// dir: /Users/innei/git/wlint/packages/core
// packagePath: packages/core
// package json: /Users/innei/git/wlint/packages/core/package.json
