import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { ParsedFile, InventoryRow, REQUIRED_COLUMNS } from '../types/validation';

function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

function normalizeRow(obj: Record<string, unknown>, headers: string[]): InventoryRow {
  const row: InventoryRow = {};
  headers.forEach((h) => {
    const val = obj[h];
    const key = normalizeKey(h);
    row[key] = typeof val === 'number' ? val : String(val ?? '');
  });
  return row;
}

/** Returns true if this row contains all required column names (identifies it as a header row) */
function rowHasRequiredColumns(row: string[]): boolean {
  const normalizedCells = row
    .filter((cell) => cell && String(cell).trim().length > 0)
    .map((cell) => normalizeKey(cell));
  const cellSet = new Set(normalizedCells);
  return REQUIRED_COLUMNS.every((col) => cellSet.has(col));
}

export function parseCSV(buffer: Buffer): ParsedFile {
  const allRows = parse(buffer, { trim: true, relax_column_count: true });

  if (!allRows.length) {
    return { headers: [], rows: [] };
  }

  // Find the row that contains all required columns (status, cost, price) - that's our header row
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(allRows.length, 50); i++) {
    if (rowHasRequiredColumns(allRows[i])) {
      headerRowIndex = i;
      break;
    }
  }

  // Fallback: use first row if no header row found (e.g. simple CSV with headers on line 1)
  if (headerRowIndex < 0) {
    headerRowIndex = 0;
  }

  const headerRow = allRows[headerRowIndex];
  const dataRows = allRows.slice(headerRowIndex + 1);

  const records = dataRows
    .map((row: string[]) => {
      const obj: Record<string, unknown> = {};
      headerRow.forEach((header: string, index: number) => {
        obj[header || `_empty_${index}`] = row[index] ?? '';
      });
      return obj;
    })
    .filter((record: Record<string, unknown>) =>
      Object.values(record).some((val) => val != null && String(val).trim().length > 0)
    );

  if (!records.length) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = Object.keys(records[0]);
  const headers = rawHeaders.map(normalizeKey);
  const rows: InventoryRow[] = records.map((r: Record<string, unknown>) =>
    normalizeRow(r, rawHeaders)
  );
  return { headers, rows };
}

export function parseXLSX(buffer: Buffer): ParsedFile {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });

  if (!rawData.length) {
    return { headers: [], rows: [] };
  }

  // Find header row (row containing status, cost, price) - P2M reports have title rows above
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rawData.length, 50); i++) {
    const row = (rawData[i] || []) as string[];
    if (rowHasRequiredColumns(row)) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex < 0) {
    headerRowIndex = 0;
  }

  const headerRow = (rawData[headerRowIndex] || []) as string[];
  const dataRows = rawData.slice(headerRowIndex + 1) as string[][];

  const records = dataRows
    .map((row) => {
      const obj: Record<string, unknown> = {};
      headerRow.forEach((header, index) => {
        const key = header && String(header).trim() ? header : `_empty_${index}`;
        obj[key] = row[index] ?? '';
      });
      return obj;
    })
    .filter((record) =>
      Object.values(record).some((val) => val != null && String(val).trim().length > 0)
    );

  if (!records.length) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = Object.keys(records[0]);
  const headers = rawHeaders.map(normalizeKey);
  const rows: InventoryRow[] = records.map((r) => normalizeRow(r, rawHeaders));

  return { headers, rows };
}

export function parseFile(buffer: Buffer, mimeType: string): ParsedFile {
  const isCSV =
    mimeType === 'text/csv' ||
    mimeType === 'application/csv' ||
    (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf); // BOM

  if (isCSV) {
    return parseCSV(buffer);
  }
  return parseXLSX(buffer);
}
