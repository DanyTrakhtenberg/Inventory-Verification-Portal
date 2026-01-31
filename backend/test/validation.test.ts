import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseFile } from '../src/services/fileParser.service';
import { runValidations } from '../src/services/validation.service';
import { REQUIRED_COLUMNS } from '../src/types/validation';

const TEST_DATA_DIR = path.resolve(__dirname, '../../test-data');

function loadAndParse(filename: string) {
  const filePath = path.join(TEST_DATA_DIR, filename);
  const buffer = fs.readFileSync(filePath);
  const mimeType = filename.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return parseFile(buffer, mimeType);
}

function getValidationResult(validations: { rule: string; passed: boolean; details: Record<string, unknown> }[], rule: string) {
  return validations.find((v) => v.rule === rule);
}

describe('CSV parsing and validation', () => {
  describe('valid-inventory.csv', () => {
    it('parses all required columns', () => {
      const parsed = loadAndParse('valid-inventory.csv');
      expect(parsed.headers).toContain('status');
      expect(parsed.headers).toContain('cost');
      expect(parsed.headers).toContain('price');
      expect(parsed.rows.length).toBeGreaterThanOrEqual(5);
    });

    it('passes all validation rules', () => {
      const parsed = loadAndParse('valid-inventory.csv');
      const validations = runValidations(parsed);
      const allPassed = validations.every((v) => v.passed);
      expect(allPassed).toBe(true);
    });
  });

  describe('with-header-rows.csv', () => {
    it('finds header row by required columns and parses data', () => {
      const parsed = loadAndParse('with-header-rows.csv');
      expect(parsed.headers).toEqual(
        expect.arrayContaining(REQUIRED_COLUMNS as unknown as string[])
      );
      expect(parsed.rows.length).toBeGreaterThanOrEqual(5);
    });

    it('extracts data correctly despite leading empty rows', () => {
      const parsed = loadAndParse('with-header-rows.csv');
      const firstRow = parsed.rows[0];
      expect(firstRow).toBeDefined();
      expect(firstRow.status).toBeDefined();
      expect(firstRow.cost).toBeDefined();
      expect(firstRow.price).toBeDefined();
    });
  });

  describe('missing-columns.csv', () => {
    it('detects missing required columns', () => {
      const parsed = loadAndParse('missing-columns.csv');
      const validations = runValidations(parsed);
      const requiredCols = getValidationResult(validations, 'required_columns');
      expect(requiredCols?.passed).toBe(false);
      expect(requiredCols?.details.missing).toEqual(
        expect.arrayContaining(['status', 'cost', 'price'])
      );
    });

    it('overall validation fails', () => {
      const parsed = loadAndParse('missing-columns.csv');
      const validations = runValidations(parsed);
      const allPassed = validations.every((v) => v.passed);
      expect(allPassed).toBe(false);
    });
  });

  describe('missing-items.csv', () => {
    it('detects missing items', () => {
      const parsed = loadAndParse('missing-items.csv');
      const validations = runValidations(parsed);
      const missingItems = getValidationResult(validations, 'missing_items');
      expect(missingItems?.passed).toBe(false);
      expect((missingItems?.details.count as number)).toBeGreaterThanOrEqual(3);
    });
  });

  describe('cost-vs-price-violation.csv', () => {
    it('detects items where cost is less than shelf price (cost < price)', () => {
      const parsed = loadAndParse('cost-vs-price-violation.csv');
      const validations = runValidations(parsed);
      const costVsPrice = getValidationResult(validations, 'cost_vs_price');
      expect(costVsPrice?.passed).toBe(false);
      expect((costVsPrice?.details.count as number)).toBeGreaterThanOrEqual(2);
    });
  });

  describe('all-violations.csv', () => {
    it('detects multiple violation types', () => {
      const parsed = loadAndParse('all-violations.csv');
      const validations = runValidations(parsed);
      const missingItems = getValidationResult(validations, 'missing_items');
      const costVsPrice = getValidationResult(validations, 'cost_vs_price');
      expect(missingItems?.passed).toBe(false);
      expect(costVsPrice?.passed).toBe(false);
    });
  });

  describe('empty-file.csv', () => {
    it('handles empty file without crashing', () => {
      const parsed = loadAndParse('empty-file.csv');
      expect(parsed.headers).toEqual([]);
      expect(parsed.rows).toEqual([]);
    });

    it('fails required_columns check', () => {
      const parsed = loadAndParse('empty-file.csv');
      const validations = runValidations(parsed);
      const requiredCols = getValidationResult(validations, 'required_columns');
      expect(requiredCols?.passed).toBe(false);
    });
  });

  describe('edge-cases.csv', () => {
    it('parses file with empty cells and zero values', () => {
      const parsed = loadAndParse('edge-cases.csv');
      expect(parsed.headers).toContain('status');
      expect(parsed.headers).toContain('cost');
      expect(parsed.headers).toContain('price');
      expect(parsed.rows.length).toBeGreaterThan(0);
    });
  });

  describe('police-hold-violation.csv', () => {
    it('detects police hold items (Police Hold - 2 in file)', () => {
      const parsed = loadAndParse('police-hold-violation.csv');
      const validations = runValidations(parsed);
      const policeHold = getValidationResult(validations, 'police_hold');
      expect(policeHold?.passed).toBe(false);
      expect(policeHold?.details.count).toBe(2);
    });
  });

  describe('police-inventory-hold.csv', () => {
    it('detects POLICE INVENTORY HOLD status (P2M format)', () => {
      const parsed = loadAndParse('police-inventory-hold.csv');
      const validations = runValidations(parsed);
      const policeHold = getValidationResult(validations, 'police_hold');
      expect(policeHold?.passed).toBe(false);
      expect(policeHold?.details.count).toBe(2);
    });
  });

  describe('missing-inv.csv', () => {
    it('detects MISSING INV status (P2M format)', () => {
      const parsed = loadAndParse('missing-inv.csv');
      const validations = runValidations(parsed);
      const missingItems = getValidationResult(validations, 'missing_items');
      expect(missingItems?.passed).toBe(false);
      expect((missingItems?.details.count as number)).toBe(3);
    });
  });
});

describe('XLSX parsing with header rows (P2M format)', () => {
  it('finds header row when title rows precede data', () => {
    const XLSX = require('xlsx');
    const wsData = [
      ['', '', 'Report Title'],
      ['', '', 'Client Name'],
      ['', '', 'Date Range'],
      [],
      ['Store Name', 'Number', 'Status', 'Category', 'Cost', 'Price'],
      ['Store A', 'I-1', 'INVENTORY', 'Jewelry', 100, 150],
      ['Store A', 'I-2', 'MISSING INV', 'Electronics', 50, 75],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const parsed = parseFile(buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    expect(parsed.headers).toContain('status');
    expect(parsed.headers).toContain('cost');
    expect(parsed.headers).toContain('price');
    expect(parsed.rows.length).toBe(2);
  });

  it('detects MISSING INV and POLICE INVENTORY HOLD in XLSX with header row', () => {
    const XLSX = require('xlsx');
    const wsData = [
      ['P2M Inventory Report'],
      ['Client: Test'],
      [],
      ['Store Name', 'Number', 'Status', 'Category', 'Cost', 'Price'],
      ['Store A', 'I-1', 'INVENTORY', 'Jewelry', 100, 150],
      ['Store A', 'I-2', 'MISSING INV', 'Electronics', 50, 75],
      ['Store A', 'I-3', 'POLICE INVENTORY HOLD', 'Tools', 25, 40],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const parsed = parseFile(buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const validations = runValidations(parsed);

    const missingItems = getValidationResult(validations, 'missing_items');
    const policeHold = getValidationResult(validations, 'police_hold');

    expect(missingItems?.passed).toBe(false);
    expect((missingItems?.details.count as number)).toBe(1);
    expect(policeHold?.passed).toBe(false);
    expect(policeHold?.details.count).toBe(1);
  });
});
