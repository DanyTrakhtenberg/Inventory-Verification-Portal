import { ParsedFile, ValidationResult, ValidationRule } from '../types/validation';
import { requiredColumnsRule } from '../validators/requiredColumns';
import { policeHoldRule } from '../validators/policeHold';
import { missingItemsRule } from '../validators/missingItems';
import { costVsPriceRule } from '../validators/costVsPrice';

/** Register rules here - each runs in a single pass over rows */
const VALIDATION_RULES: ValidationRule[] = [
  requiredColumnsRule as ValidationRule,
  policeHoldRule as ValidationRule,
  missingItemsRule as ValidationRule,
  costVsPriceRule as ValidationRule,
];

/**
 * Runs all validation rules with a single pass over the rows.
 * To add a new rule: implement ValidationRule, add to VALIDATION_RULES.
 */
export function runValidations(parsed: ParsedFile): ValidationResult[] {
  const { headers, rows } = parsed;

  const states = VALIDATION_RULES.map((rule) => rule.init(headers));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let r = 0; r < VALIDATION_RULES.length; r++) {
      VALIDATION_RULES[r].processRow(states[r], row, i, headers);
    }
  }

  return VALIDATION_RULES.map((rule, i) => rule.finalize(states[i]));
}
