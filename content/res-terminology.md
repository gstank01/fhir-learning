## Choosing the data type

| Type | Structure | Use |
|---|---|---|
| `code` | A plain string code; the system is implied by the binding | Fixed lists in the spec: `Patient.gender`, `Observation.status` |
| `Coding` | `system`, `version`, `code`, `display`, `userSelected` | One code from a known system |
| `CodeableConcept` | `coding[]` + `text` | Clinical concepts, possibly coded in several systems, or text only |
| `Quantity` | `value`, `unit`, `system`, `code` | Measured amounts; units from UCUM |

## Binding strength

| Strength | Rule |
|---|---|
| **required** | You **must** use a code from the value set. Nothing else is allowed. |
| **extensible** | Use a code from the value set if one fits. If none fits, you may use another code or (for CodeableConcept) just `text`. |
| **preferred** | Encouraged, not required. |
| **example** | Just an illustration. Use any codes. |

## Finding the value set

The **Terminology Bindings** section of each resource page lists every coded element with its value set and strength. Click through to see the codes or the code system(s) the value set draws from.

## Code systems to know

| System | URI | Used for |
|---|---|---|
| LOINC | `http://loinc.org` | Lab tests, observations, document types |
| SNOMED CT | `http://snomed.info/sct` | Clinical findings, procedures, body sites |
| RxNorm | `http://www.nlm.nih.gov/research/umls/rxnorm` | US medications |
| UCUM | `http://unitsofmeasure.org` | Units of measure |
| ICD-10 | `http://hl7.org/fhir/sid/icd-10` | Diagnoses (ICD-10-CM: `http://hl7.org/fhir/sid/icd-10-cm`) |
| CVX | `http://hl7.org/fhir/sid/cvx` | US vaccines |

FHIR-defined code systems use `http://hl7.org/fhir/...`; HL7 v3 and terminology.hl7.org systems use `http://terminology.hl7.org/CodeSystem/...`.

## Terminology resources

- `CodeSystem`: defines codes and their meaning.
- `ValueSet`: selects codes from one or more code systems for a particular use.
- `ConceptMap`: maps codes between systems.
