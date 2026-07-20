import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const csvPath = process.argv[2] ?? 'D:/last 3 months.CSV';
const previewPath = resolve(__dir, '..', 'artifacts', 'email-project-import-preview.json');

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

function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanSubject(subject) {
  return String(subject ?? '').replace(/^(re|fw|fwd):\s*/i, '').trim();
}

function topMessage(body) {
  return String(body ?? '').split(/\n\s*From:\s+/i)[0].trim();
}

function looksProjectRelated(record) {
  const subject = normalize(record.Subject);
  const top = normalize(topMessage(record.Body));
  const combined = `${subject} ${top}`;

  if (/request guide|tracking list|microsoft teams meeting|disclaimer/.test(combined)) {
    return false;
  }

  return /psg|signage|artwork|quote|quotation|kwotasie|branding|brand refresh|office|rebrand|sandblast|frosting|vinyl|lightbox|installation|removal/.test(combined);
}

function possibleSiteFromSubject(subject) {
  const cleaned = cleanSubject(subject)
    .replace(/\b(signage|quote|quotation|artwork|approval|request|urgent|new|office|branding|brand refresh|rebrand|brief|dimensions|reminder|existing|board|repair|installation|deadline|provider contact details request|municipal approval application|estimate)\b/gi, ' ')
    .replace(/\b(psg|wealth|insure|w i|and)\b/gi, ' ')
    .replace(/[|:_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || cleanSubject(subject);
}

const rows = parseCsv(readFileSync(csvPath, 'utf8'));
const headers = (rows.shift() ?? []).map((header) => header.replace(/^\uFEFF/, '').trim());
const records = rows
  .filter((row) => row.some(Boolean))
  .map((row, index) => ({ rowNumber: index + 1, ...Object.fromEntries(headers.map((header, column) => [header, row[column] ?? ''])) }));

const importedProjects = JSON.parse(readFileSync(previewPath, 'utf8'));
const importedRows = new Set(importedProjects.flatMap((project) => project.import_meta?.rowRefs ?? []));

const projectRelatedRows = records.filter(looksProjectRelated);
const unmatched = projectRelatedRows.filter((record) => !importedRows.has(record.rowNumber));

const unmatchedBySubject = new Map();
for (const record of unmatched) {
  const subject = cleanSubject(record.Subject);
  const group = unmatchedBySubject.get(subject) ?? {
    subject,
    possibleSite: possibleSiteFromSubject(subject),
    rows: [],
    from: new Set(),
    categories: new Set(),
    sample: topMessage(record.Body).replace(/\s+/g, ' ').slice(0, 280),
  };
  group.rows.push(record.rowNumber);
  if (record['From: (Address)']) group.from.add(record['From: (Address)']);
  if (record.Categories) group.categories.add(record.Categories);
  unmatchedBySubject.set(subject, group);
}

const result = {
  csvRows: records.length,
  importedProjects: importedProjects.length,
  importedSourceRows: importedRows.size,
  projectRelatedRows: projectRelatedRows.length,
  unmatchedProjectRelatedRows: unmatched.length,
  unmatchedSubjects: [...unmatchedBySubject.values()].map((group) => ({
    subject: group.subject,
    possibleSite: group.possibleSite,
    rows: group.rows,
    from: [...group.from],
    categories: [...group.categories],
    sample: group.sample,
  })),
};

console.log(JSON.stringify(result, null, 2));