import fs from "node:fs";
import path from "node:path";
import { ROOT_WORKSPACE_DIR } from "../constants";

export function generatePrettierrcFile(json: string) {
  const jsons = JSON.parse(json);
  const extend = jsons.extends;
  delete jsons.extends;
  const keys = Object.keys(jsons);
  const prettierrc = `
module.exports = {
	${
    extend?.map((pkg) => {
      return `...require("${pkg}"),`;
    }) || ""
  }
	${keys.map((key, index) => {
    return `${key}: ${JSON.stringify(jsons[key])}${
      index === keys.length - 1 ? "" : ","
    }`;
  })}
};
`;
  fs.writeFileSync(
    path.join(ROOT_WORKSPACE_DIR, ".prettierrc.js"),
    prettierrc.replace(/^\n/, "")
  );
}

export function generateLinterRcFile(linter: string, json: string) {
  if (linter === "prettier.json") {
    generatePrettierrcFile(json);
    return;
  }
  fs.writeFileSync(
    path.join(ROOT_WORKSPACE_DIR, `.${linter.replace(".json", "")}rc.json`),
    json,
    {
      encoding: "utf-8",
    }
  );
}

export function prettyStringify(value: any) {
  return JSON.stringify(value, null, 2);
}
