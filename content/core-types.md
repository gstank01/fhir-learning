## What the Type column tells you

The **Type** column says what kind of data an element holds. It also tells you how to write the element in JSON and XML, so it matters for almost every implementation question.

## Primitive types

Primitive type names start with a **lower-case** letter. They hold one value.

| Type | Example value | Notes |
|---|---|---|
| `boolean` | `true` | No quotes in JSON |
| `integer`, `decimal` | `42`, `72.5` | No quotes in JSON |
| `positiveInt`, `unsignedInt` | `1`, `0` | positiveInt ≥ 1, unsignedInt ≥ 0 |
| `string` | `"Peter"` | Plain text |
| `markdown` | `"**bold** text"` | Text that may contain Markdown |
| `code` | `"female"` | A code from a value set; the code system is implied |
| `id` | `"abc-123"` | 1–64 characters: letters, digits, `-` and `.` |
| `uri`, `url` | `"http://loinc.org"` | Identifiers and locations |
| `canonical` | `"http://hl7.org/fhir/StructureDefinition/bp\|4.0.1"` | Reference to a conformance resource by URL |
| `date` | `"1974-12-25"`, `"1974-12"`, `"1974"` | No time |
| `dateTime` | `"2024-03-01T10:15:00+01:00"` | If a time is given, a timezone is required |
| `instant` | `"2024-03-01T10:15:00.000Z"` | Always full precision, with timezone |
| `time` | `"14:30:00"` | Time of day |
| `base64Binary` | `"aGVsbG8="` | Encoded binary data |

## Complex data types

Complex type names start with an **upper-case** letter. They have child elements, defined on the [data types page](https://hl7.org/fhir/R4/datatypes.html).

| Type | Children | Used for |
|---|---|---|
| `Identifier` | `system`, `value`, `use`, `type` | Business identifiers such as an MRN |
| `HumanName` | `family`, `given`, `prefix`, `use` | People's names |
| `Address` | `line`, `city`, `postalCode`, `country` | Addresses |
| `ContactPoint` | `system` (phone, email…), `value`, `use` | Phone numbers, emails |
| `Coding` | `system`, `code`, `display` | One code from one code system |
| `CodeableConcept` | `coding[]`, `text` | A concept, with one or more codes and/or text |
| `Quantity` | `value`, `unit`, `system`, `code` | Measured amounts with units |
| `Period` | `start`, `end` | Time ranges |
| `Range` | `low`, `high` | Ranges of quantities |
| `Attachment` | `contentType`, `data`, `url` | Files and documents |
| `Reference` | `reference`, `type`, `identifier`, `display` | Links to other resources |

## Reference types

A reference shows its allowed targets in brackets:

```
Reference(Patient | Group | Device | Location)
```

That means `Observation.subject` may point to any of those four resource types, and nothing else. When choosing a resource for a use case, the allowed targets tell you which resources you'll need alongside it.

In profiles you may also see:

| Marker | Meaning |
|---|---|
| `b` | The referenced resource must be in the same Bundle |
| `c` | It must be a contained resource |
| `r` | It must not be contained |
| `{url}` | The target must conform to that profile |

## Choice types `[x]`

When the type column lists several types for an element whose name ends in `[x]`, you pick **one**, and the element name changes to include the type, with a capital letter:

| Table shows | Type chosen | JSON property |
|---|---|---|
| `value[x]`: Quantity \| CodeableConcept \| string \| … | Quantity | `"valueQuantity"` |
| | string | `"valueString"` |
| `deceased[x]`: boolean \| dateTime | dateTime | `"deceasedDateTime"` |
| `effective[x]`: dateTime \| Period \| … | Period | `"effectivePeriod"` |

Choice elements **can't repeat** (max is always 1), and only one of the choices can be present.

## BackboneElement

If the type is `BackboneElement`, the element's children are defined right there in the table, indented below it. Write it as a nested object.

## Quick test

What is the JSON property name for `Observation.value[x]` holding a `CodeableConcept`? Answer: `valueCodeableConcept`.
