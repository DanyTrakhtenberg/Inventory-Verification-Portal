import { ParsedFile, ValidationResult } from '../types/validation';
import { validateRequiredColumns } from '../validators/requiredColumns';
import { validatePoliceHold } from '../validators/policeHold';
import { validateMissingItems } from '../validators/missingItems';
import { validateCostVsPrice } from '../validators/costVsPrice';

export function runValidations(parsed: ParsedFile): ValidationResult[] {
  const { headers, rows } = parsed;
  const results: ValidationResult[] = [
    validateRequiredColumns(rows, headers),
    validatePoliceHold(rows, headers),
    validateMissingItems(rows, headers),
    validateCostVsPrice(rows, headers),
  ];
  return results;
}
