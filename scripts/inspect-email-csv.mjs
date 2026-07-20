import { readFileSync } from 'fs';

const filePath = process.argv[2] ?? 'D:/last 3 months.CSV';
const text = readFileSync(filePath, 'utf8');

function parseCsv(input) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.replace(/\r$/, ''));
    rows.push(row);
  }

  return rows;
}

const rows = parseCsv(text);
const headers = (rows.shift() ?? []).map((header) => header.replace(/^\uFEFF/, '').trim());
const records = rows
  .filter((row) => row.some(Boolean))
  .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));

const projectLike = records
  .map((record, index) => ({
    index: index + 1,
    subject: record.Subject,
    from: record['From: (Address)'],
    to: record['To: (Address)'],
    cc: record['CC: (Address)'],
    category: record.Categories,
    bodyLength: record.Body?.length ?? 0,
  }))
  .filter((item) => /psg|signage|quote|artwork|office|relocation|brand/i.test(item.subject));

console.log(JSON.stringify({ rows: records.length, headers, samples: records.slice(0, 12).map((record) => record.Subject), projectLike }, null, 2));
