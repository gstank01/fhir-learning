## What an operation is

An operation is a named function called with a `$` prefix. It is defined by an `OperationDefinition` and takes a `Parameters` resource in and (usually) returns one out.

Operations can be called at three levels:

| Level | URL | Example |
|---|---|---|
| System | `[base]/$op` | `[base]/$export` |
| Type | `[base]/[Type]/$op` | `[base]/ValueSet/$expand?url=...` |
| Instance | `[base]/[Type]/[id]/$op` | `[base]/Patient/123/$everything` |

## Where to find them

- [Operations list](https://hl7.org/fhir/R4/operationslist.html) in the spec, plus an **Operations** tab on each resource page.
- A server's `CapabilityStatement` lists the operations it supports (`rest.operation` and `rest.resource.operation`).
- IGs define more (e.g. Bulk Data's `$export`).

## Common R4 operations

| Operation | On | Purpose |
|---|---|---|
| `$everything` | Patient, Encounter | All data in the patient's compartment |
| `$validate` | any resource | Check a resource against the spec or a profile |
| `$meta`, `$meta-add`, `$meta-delete` | any | Read or change tags, security labels, profiles |
| `$expand` | ValueSet | List the codes in a value set |
| `$validate-code` | ValueSet, CodeSystem | Is this code in the value set / code system? |
| `$lookup` | CodeSystem | Display and properties of a code |
| `$subsumes` | CodeSystem | Is code A a parent of code B? |
| `$translate` | ConceptMap | Map a code to another code system |
| `$document` | Composition | Build a document Bundle |
| `$process-message` | system | Receive a FHIR message |
| `$match` | Patient | Find likely matching patient records (MPI) |
| `$lastn` | Observation | Most recent N observations per code |
| `$stats` | Observation | Statistics on observations |
| `$export` | system, Patient, Group | Bulk Data export |

## Checking for gaps

Open the OperationDefinition and compare its **parameters** (name, `in`/`out`, type, cardinality) with what your use case provides and needs. If a required input is missing, or the output doesn't carry what you need, the operation doesn't fit as-is.
