export type ColumnType = 'string' | 'integer' | 'float' | 'datetime';

export const COLUMN_TYPES: ColumnType[] = ['string', 'integer', 'float', 'datetime'];

export function parseCSV(text: string): string[][] {
  if (!text.trim()) return [];
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current);
        current = '';
      } else if (ch === '\n') {
        row.push(current);
        current = '';
        if (row.length > 0) rows.push(row);
        row = [];
      } else if (ch === '\r') {
        // skip, handle \r\n
      } else {
        current += ch;
      }
    }
  }
  row.push(current);
  if (row.some(c => c !== '')) rows.push(row);

  return rows;
}

export function inferType(values: string[]): ColumnType {
  const nonEmpty = values.filter(v => v.trim() !== '');
  if (nonEmpty.length === 0) return 'string';

  // Check integer
  if (nonEmpty.every(v => /^-?\d+$/.test(v.trim()))) return 'integer';

  // Check float
  if (nonEmpty.every(v => /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v.trim()))) return 'float';

  // Check datetime (ISO 8601 and common formats)
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?/,
    /^\d{4}\/\d{2}\/\d{2}/,
  ];
  if (nonEmpty.every(v => datePatterns.some(p => p.test(v.trim())) && !isNaN(Date.parse(v.trim())))) {
    return 'datetime';
  }

  return 'string';
}

export function convertValue(value: string, type: ColumnType): string {
  const trimmed = value.trim();
  if (trimmed === '') return '';

  switch (type) {
    case 'integer': {
      const n = parseInt(trimmed, 10);
      return isNaN(n) ? trimmed : String(n);
    }
    case 'float': {
      const f = parseFloat(trimmed);
      return isNaN(f) ? trimmed : String(f);
    }
    case 'datetime': {
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? trimmed : d.toISOString();
    }
    case 'string':
    default:
      return trimmed;
  }
}

function escapeCSVField(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function toDelimited(
  rows: string[][],
  types: ColumnType[],
  delimiter: string
): string {
  if (rows.length === 0) return '';

  const [header, ...dataRows] = rows;
  const headerLine = header.map(h => escapeCSVField(h, delimiter)).join(delimiter);

  const dataLines = dataRows.map(row =>
    row.map((cell, i) => {
      const converted = convertValue(cell, types[i] ?? 'string');
      return escapeCSVField(converted, delimiter);
    }).join(delimiter)
  );

  return [headerLine, ...dataLines].join('\n');
}
