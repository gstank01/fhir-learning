## The one-sentence difference

- A **CodeSystem** **defines** codes and what they mean. *"These codes exist."*
- A **ValueSet** **selects** codes, from one or more code systems, for a particular use. *"These are the codes you may use here."*

Elements are bound to **value sets**, never directly to code systems.

```
 CodeSystem: LOINC  ─┐
 (100,000+ codes)    │   ValueSet: Vital Signs           Binding         Element
                     ├──▶ (selects some LOINC codes) ◀──────────── Observation.code
 CodeSystem: SNOMED ─┘                                (strength: extensible, in a profile)
```

## CodeSystem

A code system is a set of codes with definitions, managed by an organisation.

| Example | Canonical URL (`system`) | Who maintains it |
|---|---|---|
| LOINC | `http://loinc.org` | Regenstrief Institute |
| SNOMED CT | `http://snomed.info/sct` | SNOMED International |
| RxNorm | `http://www.nlm.nih.gov/research/umls/rxnorm` | US National Library of Medicine |
| UCUM (units) | `http://unitsofmeasure.org` | Regenstrief Institute |
| ICD-10 | `http://hl7.org/fhir/sid/icd-10` | WHO |
| AdministrativeGender | `http://hl7.org/fhir/administrative-gender` | HL7 (FHIR-defined) |
| HL7 terminology | `http://terminology.hl7.org/CodeSystem/...` | HL7 (shared code systems, e.g. v3 and v2 tables) |

Key elements of the `CodeSystem` resource:

| Element | Meaning |
|---|---|
| `url` | The canonical URL. This is the value you put in `Coding.system`. |
| `version` | Version of the code system |
| `content` | How much of the code system is in this resource: `not-present`, `example`, `fragment`, `complete`, `supplement` |
| `caseSensitive` | Whether codes are case-sensitive |
| `hierarchyMeaning` | What parent/child relationships mean, e.g. is-a |
| `concept` | The codes: `code`, `display`, `definition`, and child concepts |

Large external code systems such as SNOMED CT and LOINC are usually **not** included in full: their CodeSystem resources say `content: not-present` and the codes live on a terminology server.

## ValueSet

A value set picks the codes allowed for a purpose. It has two parts:

| Part | What it is |
|---|---|
| **compose** | The *rules* (definition): which code systems to include and exclude, specific codes, or filters such as "all SNOMED codes that are a kind of disorder" |
| **expansion** | The *result*: the actual list of codes the rules produce at a point in time |

```json
{
  "resourceType": "ValueSet",
  "url": "http://example.org/fhir/ValueSet/blood-pressure-codes",
  "status": "active",
  "compose": {
    "include": [{
      "system": "http://loinc.org",
      "concept": [
        { "code": "8480-6", "display": "Systolic blood pressure" },
        { "code": "8462-4", "display": "Diastolic blood pressure" }
      ]
    }]
  }
}
```

A value set can include a **whole** code system (all codes), **listed** codes, codes matching a **filter** (e.g. `concept is-a 404684003`), or other **value sets**.

## How codes appear in data

The `system` of a `Coding` is always the **code system** URL, never the value set URL.

```json
"code": {
  "coding": [{
    "system": "http://loinc.org",
    "code": "8480-6",
    "display": "Systolic blood pressure"
  }],
  "text": "Systolic BP"
}
```

For a plain `code` element like `Patient.gender`, there's no `system`: the code system is implied by the element's required binding.

## Terminology operations

| Operation | On | Question it answers |
|---|---|---|
| `$expand` | ValueSet | Which codes are in this value set? |
| `$validate-code` | ValueSet or CodeSystem | Is this code in the value set / code system? |
| `$lookup` | CodeSystem | What is the display and other details for this code? |
| `$subsumes` | CodeSystem | Is code A a parent of code B? |
| `$translate` | ConceptMap | What is the equivalent code in another code system? |

```
GET [base]/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender
GET [base]/CodeSystem/$lookup?system=http://loinc.org&code=8480-6
```

## Related terminology resources

- **ConceptMap**: maps codes from one code system or value set to another (e.g. local codes to SNOMED).
- **NamingSystem**: registers identifiers for code systems and identifier systems (e.g. OIDs and URLs).
- **TerminologyCapabilities**: describes what a terminology server supports.

## Common mistakes

| Mistake | Fix |
|---|---|
| Putting the ValueSet URL in `Coding.system` | Use the code system URL |
| Making up a `display` | Use the code system's own display text |
| Using a `Coding` structure for `Patient.gender` | `gender` is a plain `code`: `"gender": "female"` |
| Thinking a code system and a value set are the same thing | Code system = defines; value set = selects |

## Practice

1. `Observation.code` contains `"system": "http://hl7.org/fhir/ValueSet/observation-codes"`. What's wrong?
2. Which operation lists the codes in a value set?
3. A CodeSystem resource for SNOMED CT has `content: not-present`. Where are the codes?

Answers: the system must be a code system URL (e.g. `http://loinc.org`), not a value set URL; `$expand`; on a terminology server: the resource only describes the code system.
