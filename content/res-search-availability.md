## Where to look

- The **Search Parameters** section at the bottom of each resource page in the spec lists the parameters, their **type** and the **FHIRPath expression** they index.
- [All search parameters](https://hl7.org/fhir/R4/searchparameter-registry.html) and common ones on [search.html](https://hl7.org/fhir/R4/search.html).
- A **server's CapabilityStatement** (`rest.resource.searchParam`) lists what *that* server actually supports. IGs (e.g. US Core) list which parameters and combinations a server must support.
- Custom parameters are defined with a `SearchParameter` resource.

## Parameters for all resources

`_id`, `_lastUpdated`, `_tag`, `_profile`, `_security`, `_source`, `_text`, `_content`, `_list`, `_has`, `_type`.

Result controls: `_sort`, `_count`, `_include`, `_revinclude`, `_summary`, `_total`, `_elements`, `_contained`.

## Search parameter types

| Type | Example |
|---|---|
| `string` | `name=smi` |
| `token` | `identifier=http://hospital.org/mrn\|12345`, `gender=female` |
| `reference` | `subject=Patient/123` |
| `date` | `birthdate=ge1980-01-01` |
| `number` | `probability=gt0.8` |
| `quantity` | `value-quantity=5.4\|http://unitsofmeasure.org\|mg` |
| `uri` | `url=http://hl7.org/fhir/ValueSet/...` |
| `composite` | `code-value-quantity=http://loinc.org\|8480-6$gt140` |
| `special` | `near` on Location |

## Combining parameters

Parameter names are often different from element names: `Patient.birthDate` is searched with `birthdate`, `Observation.subject` with `subject` or `patient`.

Example: blood pressure observations for one patient since 2024:

```
GET [base]/Observation?patient=123&code=http://loinc.org|85354-9&date=ge2024-01-01
```

## When search isn't enough

Check for an operation, e.g. `Patient/123/$everything` for all of a patient's data, `Observation/$lastn` for the latest results per code, or `Patient/$match` for fuzzy patient matching.
