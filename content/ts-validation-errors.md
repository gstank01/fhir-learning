## Reading a validation result

Validation results come back as an `OperationOutcome`. Each `issue` has:

| Element | Meaning |
|---|---|
| `severity` | `fatal`, `error`, `warning`, `information` |
| `code` | Type of problem: `required`, `value`, `invariant`, `structure`, `code-invalid`, `not-found`, `business-rule`, … |
| `details` / `diagnostics` | Explanation |
| `expression` | **FHIRPath** location of the problem, e.g. `Patient.name[0].given[0]` |
| `location` | Older XPath-style location (deprecated in favour of `expression`) |

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "required",
    "diagnostics": "Observation.status: minimum required = 1, but only found 0",
    "expression": ["Observation.status"]
  }]
}
```

## Severity decides what to fix

- **fatal / error:** the resource is invalid. You must fix it.
- **warning:** valid, but probably a problem (e.g. a display that doesn't match, a code not in a preferred value set). Fix it if you can.
- **information:** no action needed.

## Common errors and fixes

| Error | Fix |
|---|---|
| Minimum cardinality not met (`required`) | Add the missing element (e.g. `Observation.status`, `Observation.code`) |
| Unknown element / unrecognised property | Check spelling and case (`birthdate` → `birthDate`), and that the element belongs in that place |
| Wrong type, e.g. string where array expected | Wrap repeating elements in an array; remove quotes from booleans/numbers |
| Invalid code for a required binding | Use a code from the bound value set (e.g. `gender` must be `male`, `female`, `other`, `unknown`) |
| Invalid date format | Use `YYYY-MM-DD`; add a timezone to times |
| Invariant failed (e.g. `ext-1`, `dom-6`) | Read the constraint's FHIRPath; e.g. `ext-1` means an extension has both a value and nested extensions |
| Profile constraint not met | Check the profile's Must Support, cardinality, fixed values and slices |
| `dom-6` warning: no narrative | Add `text` (best practice, warning only) |
