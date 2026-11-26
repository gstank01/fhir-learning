## `code`: simple coded values

The system is implied by the element's required binding, so you only send the code:

```json
"gender": "female",
"status": "final"
```

```xml
<gender value="female"/>
```

## `Coding`

```json
{
  "system": "http://loinc.org",
  "code": "29463-7",
  "display": "Body weight"
}
```

- `system`: the URI of the code system. Required for the code to have a meaning.
- `code`: the code, exactly as the code system defines it.
- `display`: the code system's display text for this code. Don't make up your own.
- `version`: version of the code system (optional).
- `userSelected`: `true` if a user picked this code directly.

## `CodeableConcept`

```json
"code": {
  "coding": [
    { "system": "http://snomed.info/sct", "code": "38341003", "display": "Hypertensive disorder, systemic arterial (disorder)" },
    { "system": "http://hl7.org/fhir/sid/icd-10", "code": "I10", "display": "Essential (primary) hypertension" }
  ],
  "text": "High blood pressure"
}
```

- **More than one code:** add more `Coding`s in the `coding` array. Each should represent the **same concept** in a different code system (e.g. SNOMED and ICD-10), or a translation. Use `userSelected` to mark the one the user picked.
- `text`: what the user saw or typed. Use it for the original wording, and on its own if no code fits (and the binding allows it).
- `coding` is an array, even with one entry.

## Quantity units

```json
"valueQuantity": {
  "value": 72.5,
  "unit": "kg",
  "system": "http://unitsofmeasure.org",
  "code": "kg"
}
```

`unit` is for display; `system` + `code` (UCUM) is the computable unit. Example UCUM codes: `kg`, `mg`, `mm[Hg]`, `/min`, `Cel`, `%`.

## Common mistakes

- Using a `Coding` structure where the element is a plain `code`, or the reverse.
- Leaving out `system`.
- A `display` that doesn't match the code.
- Putting different concepts in one CodeableConcept.
