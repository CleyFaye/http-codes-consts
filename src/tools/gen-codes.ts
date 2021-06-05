/* eslint-disable no-console */
import {join} from "path";
import {
  readFile,
  writeFile,
  mkdir,
} from "fs/promises";
import {promisify} from "util";
import parse from "csv-parse";

const CODE_LIST_FILE = "res/http-status-codes-1.csv";
const OUTPUT_DIRECTORY = "gen";
const OUTPUT_FILENAME = "codes.ts";
const OUTPUT_FILEPATH = join(OUTPUT_DIRECTORY, OUTPUT_FILENAME);
const promiseParse = promisify<Buffer, Array<Array<string>>>(parse);
/** Label from source file that must not be put into output */
const UNUSED_LABELS = [
  "Unassigned",
  "(Unused)",
];

interface CodeDefinition {
  name: string;
  code: number;
}

/** Transform a human-readable label to a const name using underscore */
const labelToNameUnderscore = (label: string): string => label.replace(
  /[ -]/gu,
  "_",
)
  .toUpperCase();

/** Transform a human-readable label to a const name using camelcase */
const labelToNameCamel = (label: string): string => label.replace(
  /[ -]/gu,
  "",
);

/** Convert result to a TypeScript string */
const transformResToTypescript = (res: Array<CodeDefinition>): string => {
  const codes = res.map(({name, code}) => `"${name}" = ${code}`).join(",\n");
  return `enum HttpCodes {\n${codes}\n}\nexport default HttpCodes;`;
};

const convertRowsToCodeDefinitions = (
  csvRows: Array<Array<string>>,
) => csvRows.slice(1).reduce<Array<CodeDefinition>>(
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
);

const main = async () => {
  console.log(`Creating output directory "${OUTPUT_DIRECTORY}"`);
  await mkdir(OUTPUT_DIRECTORY, {recursive: true});
  console.log(`Reading codes from ${CODE_LIST_FILE}`);
  const fileContent = await readFile(CODE_LIST_FILE);
  const csvRows = await promiseParse(fileContent);
  const codeDefinitions = convertRowsToCodeDefinitions(csvRows);
  const outputContent = transformResToTypescript(codeDefinitions);
  console.log(`Writting output into "${OUTPUT_FILEPATH}"`);
  await writeFile(OUTPUT_FILEPATH, outputContent);
  console.log("Done");
};

main().catch(console.error);
