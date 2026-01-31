import { ValidationResult, REQUIRED_COLUMNS, ValidationRule } from '../types/validation';

type State = { headers: string[] };

export const requiredColumnsRule: ValidationRule<State> = {
  name: 'required_columns',
  init: (headers) => ({ headers }),
  processRow: () => {}, // no row iteration needed
  finalize: (state): ValidationResult => {
    const missing: string[] = [];
    for (const col of REQUIRED_COLUMNS) {
      if (!state.headers.includes(col)) missing.push(col);
    }
    return {
      rule: 'required_columns',
      passed: missing.length === 0,
      details: {
        required: [...REQUIRED_COLUMNS],
        missing: missing.length > 0 ? missing : undefined,
        found: state.headers,
      },
    };
  },
};
