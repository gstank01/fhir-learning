## GET or POST?

| Use GET (URL parameters) when | Use POST (Parameters body) when |
|---|---|
| The operation **doesn't change data** (`affectsState = false`) | The operation changes data |
| All input parameters are **primitive** types (string, code, uri, date…) | An input is a complex type or a resource |

```
GET [base]/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender
GET [base]/CodeSystem/$lookup?system=http://loinc.org&code=1963-8
GET [base]/Patient/123/$everything?start=2024-01-01
```

## The Parameters resource

POST calls send a `Parameters` resource. Each `parameter` has a `name` and **either** a `value[x]`, a `resource`, or nested `part`s:

```json
POST [base]/Patient/$validate
{
  "resourceType": "Parameters",
  "parameter": [
    { "name": "resource", "resource": { "resourceType": "Patient", "gender": "female" } },
    { "name": "profile", "valueUri": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient" }
  ]
}
```

- The value property follows the parameter's type: a `uri` parameter is `valueUri`, a `code` is `valueCode`, a `Coding` is `valueCoding`.
- A resource input goes in `resource`, not a `value`.

## Outputs

- If an operation has **one output parameter called `return` that is a resource**, the server returns that resource directly (e.g. `$everything` returns a `Bundle`, `$validate` returns an `OperationOutcome`).
- Otherwise the server returns a `Parameters` resource, e.g. `$lookup` returns `name`, `display`, `designation`, `property` parameters.

## Reading an OperationDefinition

| Element | Meaning |
|---|---|
| `code` | Name, called with `$` |
| `system`, `type`, `instance` | Which levels it can be called at |
| `resource` | Which resource types |
| `affectsState` | `true` means POST only |
| `parameter.name`, `use` (`in`/`out`), `min`, `max`, `type` | The inputs and outputs |
