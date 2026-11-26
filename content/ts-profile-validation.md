## Ways to validate

| Method | How |
|---|---|
| **`$validate` operation** | `POST [base]/Patient/$validate` with the resource (or a `Parameters` with `resource` and `profile`). Returns an `OperationOutcome`. |
| **Official HL7 Validator** (Java) | `java -jar validator_cli.jar patient.json -version 4.0.1 -ig hl7.fhir.us.core -profile http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient` |
| **validator.fhir.org** | Web front end for the official validator |
| **Server-side validation on write** | Some servers validate on create/update and return `422` with an `OperationOutcome` |
| **IDE / tools** | Simplifier, Firely Terminal, HAPI FHIR validator, Inferno test suites |

## Which profile is checked?

- Always against the **base resource** definition.
- Against any profile listed in the instance's `meta.profile`.
- Against a profile you pass explicitly (`profile` parameter, `-profile` flag), which must be loaded via its IG package.

## What a profile can enforce

- Cardinality (e.g. `Patient.identifier` 1..*)
- Must Support elements (the validator usually reports them as information, since the meaning depends on the IG)
- Fixed and pattern values (e.g. `Observation.category` must contain `vital-signs`)
- Value set bindings
- Slices (e.g. one `component` for systolic and one for diastolic)
- Invariants written in FHIRPath
- Required extensions

## Interpreting output

1. Read the **severity** first: errors must be fixed; warnings and information may be acceptable.
2. Use the **expression** to find the exact element.
3. Read the message to see which rule failed: cardinality, binding, slice, invariant.
4. Fix the instance, not the profile, unless the profile is the wrong one for your use case.

A "profile not found" or "unknown profile" message usually means the IG package wasn't loaded, or the `meta.profile` URL is wrong.
