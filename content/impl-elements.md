## JSON rules

- Every resource has `"resourceType"`.
- **Repeating elements (max `*`) are always arrays**, even with one value: `"name": [{ "family": "Smith" }]`, `"given": ["John"]`.
- **Quotes:** `boolean`, `integer`, `decimal`, `positiveInt`, `unsignedInt` are written **without quotes** (`"active": true`, `"multipleBirthInteger": 2`). Everything else, including dates, codes and ids, is a string in quotes.
- Leave out empty elements. No `null`, `""`, `[]` or `{}`.
- Element names are case sensitive (`birthDate`, not `birthdate`).

```json
{
  "resourceType": "Patient",
  "id": "example",
  "active": true,
  "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }],
  "gender": "male",
  "birthDate": "1974-12-25",
  "multipleBirthInteger": 2
}
```

## XML rules

- Root element is the resource name in the FHIR namespace: `<Patient xmlns="http://hl7.org/fhir">`.
- **Primitive values go in a `value` attribute**, never as element text: `<birthDate value="1974-12-25"/>`, not `<birthDate>1974-12-25</birthDate>`.
- **Order matters**: elements appear in the order the spec defines, including elements inside data types (e.g. `HumanName`: `use`, `text`, `family`, `given`, `prefix`, `suffix`, `period`).
- Repeating elements are just repeated tags: `<given value="Peter"/><given value="James"/>`.
- Narrative is XHTML in `<text><status value="generated"/><div xmlns="http://www.w3.org/1999/xhtml">...</div></text>`.

## Choice types `[x]`

An element like `Observation.value[x]` can have one of several types. Replace `[x]` with the type name, capitalised:

| Type | JSON | XML |
|---|---|---|
| Quantity | `"valueQuantity": {...}` | `<valueQuantity>...</valueQuantity>` |
| string | `"valueString": "positive"` | `<valueString value="positive"/>` |
| CodeableConcept | `"valueCodeableConcept": {...}` | |
| dateTime | `"effectiveDateTime": "2024-03-01T10:00:00Z"` | |
| Period | `"effectivePeriod": {...}` | |

Only one choice can be present at a time, and `[x]` elements can't repeat.

## Backbone elements

A backbone element is a group of elements defined inside a resource, e.g. `Patient.contact`, `Observation.component`, `Encounter.participant`. Write them as nested objects (in an array if they repeat):

```json
"component": [{
  "code": { "coding": [{ "system": "http://loinc.org", "code": "8480-6" }] },
  "valueQuantity": { "value": 120, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]" }
}]
```

## Data types to know

- **Primitive** types start lowercase: `boolean`, `integer`, `decimal`, `string`, `uri`, `url`, `canonical`, `code`, `id`, `date`, `dateTime`, `instant`, `time`, `markdown`, `base64Binary`, `positiveInt`, `unsignedInt`.
- **Complex** types start uppercase: `Identifier`, `HumanName`, `Address`, `ContactPoint`, `CodeableConcept`, `Coding`, `Quantity`, `Period`, `Range`, `Ratio`, `Reference`, `Attachment`, `Annotation`, `Timing`.
- `date`: `2024`, `2024-03`, `2024-03-01`. `dateTime`: those, or a full date and time **with timezone** (`2024-03-01T10:15:00+01:00`). `instant`: always full, with seconds and timezone.
- `id`: 1–64 characters, letters, digits, `-` and `.`.
