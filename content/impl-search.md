## Basic syntax

```
GET [base]/[ResourceType]?param=value&param2=value2
```

## AND / OR

- **AND:** repeat the parameter, or use different parameters: `date=ge2024-01-01&date=lt2025-01-01`.
- **OR:** comma-separate values: `code=http://loinc.org|8867-4,http://loinc.org|9279-1`.

## By type

**String** (default: case-insensitive, *starts with*):

- `name=smi` matches "Smith" and "Smitherson".
- `name:exact=Smith` exact, case-sensitive match.
- `name:contains=mit` match anywhere.

**Token** (codes and identifiers):

- `gender=female`
- `identifier=http://hospital.org/mrn|12345` (system **and** value)
- `code=|12345` code with **no** system; `code=http://loinc.org|` any code in that system
- `code:not=final`, `code:text=headache`, `code:below=...` (subsumption)

**Reference:**

- `subject=Patient/123`, or `patient=123`
- Chaining: `Observation?subject:Patient.name=smith`
- Reverse chaining: `Patient?_has:Observation:patient:code=1234-5` (patients who have such an Observation)

**Date** uses prefixes:

| Prefix | Meaning |
|---|---|
| `eq` (default) | equal (the value's whole range is inside the parameter's range) |
| `ne` | not equal |
| `gt` / `lt` | greater / less than |
| `ge` / `le` | greater or equal / less or equal |
| `sa` / `eb` | starts after / ends before |
| `ap` | approximately |

`birthdate=1980` matches any date in 1980. `date=ge2024-01-01&date=lt2024-02-01` matches January 2024.

**Quantity:** `[prefix]number|system|code`

```
Observation?value-quantity=gt5.4|http://unitsofmeasure.org|mg
Observation?value-quantity=5.4||mg      (any system, unit mg)
```

**Composite:** values joined with `$`: `code-value-quantity=http://loinc.org|8480-6$gt140`.

## Modifiers and result parameters

- `:missing=true` / `:missing=false`: element absent or present.
- `_include=Observation:patient` adds the referenced Patients to the results; `_revinclude=Provenance:target` adds resources that point *to* the results.
- `_sort=-date` (minus = descending), `_count=50` page size, `_summary=count` count only, `_elements=id,name`.
- Results come back in a `searchset` Bundle; follow `link` with relation `next` to get the next page.
