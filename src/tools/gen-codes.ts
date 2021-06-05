/* eslint-disable no-console */
import {join} from "path";
import {
  readFile,
  writeFile,
  ensureDir,
} from "fs-extra";
import {promisify} from "util";
import parse from "csv-parse";

const CODE_LIST_FILE = "res/http-status-codes-1.csv";
const OUTPUT_DIRECTORY = "gen";
const OUTPUT_FILENAME = "codes.ts";
const OUTPUT_FILEPATH = join(OUTPUT_DIRECTORY, OUTPUT_FILENAME);
const promiseParse = promisify(parse);
const UNUSED_LABELS = [
  "Unassigned",
  "(Unused)",
];

interface CodeDefinition {
  name: string;
  code: number;
}

/**
 * Transform a human-readable label to a const name using underscore
 */
const labelToNameUnderscore = (label: string): string => label.replace(
  /[ -]/gu,
  "_",
)
  .toUpperCase();

/**
 * Transform a human-readable label to a const name using camelcase
 */
const labelToNameCamel = (label: string): string => label.replace(
  /[ -]/gu,
  "",
);

/**
 * Convert result to a TypeScript string
 */
const transformResToTypescript = (res: Array<CodeDefinition>): string => {
  const codes = res.map(({name, code}) => `"${name}" = ${code}`).join(",\n");
  return `enum HttpCodes {\n${codes}\n}\nexport default HttpCodes;`;
};

console.log(`Creating output directory "${OUTPUT_DIRECTORY}"`);
ensureDir(OUTPUT_DIRECTORY)
  .then(() => {
    console.log(`Reading codes from ${CODE_LIST_FILE}`);
    return readFile(CODE_LIST_FILE, "utf8");
  })
  .then<Array<Array<string>>>(promiseParse)
  .then(csvRows => csvRows.slice(1).reduce<Array<CodeDefinition>>(
    (result, row) => {
      const [
        codeStr,
        label,
      ] = row;
      if (!UNUSED_LABELS.includes(label)) {
        const camelName = labelToNameCamel(label);
        const underscoreName = labelToNameUnderscore(label);
        const code = parseInt(codeStr, 10);
        result.push(
          {
            name: camelName,
            code,
          },
        );
        if (camelName !== underscoreName) {
          result.push(
            {
              name: underscoreName,
              code,
            },
          );
        }
      }
      return result;
    },
    [],
  ))
  .then(res => {
    const outputContent = transformResToTypescript(res);
    console.log(`Writting output into "${OUTPUT_FILEPATH}"`);
    return writeFile(OUTPUT_FILEPATH, outputContent);
  })
  .catch(error => {
    console.error(error);
  });
