const { Project, ts } = require("ts-morph");
const { writeFileSync, mkdirSync } = require("fs");
const { join, relative, dirname } = require("path");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const files = project.getSourceFiles("src/**/*.{ts,tsx}");
const outputDir = "cleaned";

for (const file of files) {
  const printer = ts.createPrinter({ removeComments: true });
  const result = printer.printFile(file.compilerNode);

  const relPath = relative("src", file.getFilePath());
  const outPath = join(outputDir, relPath);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, result, "utf8");
  console.log(`Cleaned: ${outPath}`);
}
