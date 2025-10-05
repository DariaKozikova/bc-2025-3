const { program } = require('commander');
const fs = require('fs');
const path = require('path');

program
  .option('-i, --input <file>', 'Path to input JSON file')
  .option('-o, --output <file>', 'Path to output file')
  .option('-d, --display', 'Display result in console')
  .option('-h, --humidity', 'Show humidity (Humidity3pm)')
  .option('-r, --rainfall <number>', 'Show only records with rainfall greater than given value', parseFloat);

program.parse(process.argv);
const options = program.opts();

if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1);
}

if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

let data;
try {
  const raw = fs.readFileSync(options.input, 'utf-8');
  if (!raw.trim()) {
    console.error("Input file is empty");
    process.exit(1);
  }
  data = JSON.parse(raw);
} catch (err) {
  console.error("Error reading or parsing input file");
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("Input JSON should be an array of records");
  process.exit(1);
}

const outputLines = [];

data.forEach((record) => {
  if (options.rainfall !== undefined && (record.Rainfall === undefined || record.Rainfall <= options.rainfall)) {
    return;
  }

  const parts = [];
  parts.push(record.Rainfall ?? 0);
  parts.push(record.Pressure3pm ?? 0);

  if (options.humidity) {
    parts.push(record.Humidity3pm ?? 0);
  }

  outputLines.push(parts.join(' '));
});

const output = outputLines.join('\n');

if (options.display) {
  console.log(output);
}

if (options.output) {
  try {
    fs.writeFileSync(path.resolve(options.output), output, 'utf-8');
  } catch {
    console.error("Error writing to output file");
  }
}
