const loadGruntTasks = require("load-grunt-tasks");
const {readFileSync} = require("fs");

const licenseJS = [
  "/**",
  " * @license",
  " * @preserve",
  ...readFileSync("LICENSE", "utf8").split("\n")
    .map(c => ` * ${c}`.trimEnd()),
  " */",
].join("\n");

// eslint-disable-next-line max-lines-per-function
module.exports = grunt => {
  loadGruntTasks(grunt);

  grunt.initConfig(
    {
      "clean": {
        build: [
          "gen",
          "lib",
        ],
        cache: [
          "tsconfig-gen.tsbuildinfo",
          "tsconfig.tsbuildinfo",
          ".tscache",
          "./**/.cache",
        ],
      },
      "ts": {
        buildTools: {
          tsconfig: {
            tsconfig: "./tsconfig.json",
            passThrough: true,
          },
        },
        buildLibrary: {
          tsconfig: {
            tsconfig: "./tsconfig-gen.json",
            passThrough: true,
          },
        },
      },
      "usebanner": {
        build: {
          options: {banner: licenseJS},
          files: [
            {
              expand: true,
              cwd: "lib",
              src: ["**/*.js"],
            },
          ],
        },
      },
      "run": {
        genCodes: {
          cmd: "npx",
          args: [
            "node",
            "-r",
            "esm",
            "lib/tools/gen-codes",
          ],
        },
      },
    },
  );

  grunt.registerTask(
    "build",
    "Build the library",
    [
      "ts:buildTools",
      "run:genCodes",
      "ts:buildLibrary",
      "usebanner:build",
    ],
  );

  grunt.registerTask(
    "default",
    ["build"],
  );
};
