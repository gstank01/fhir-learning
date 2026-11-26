## What it is

A `CapabilityStatement` describes what a FHIR server (or client) does. Get it from:

```
GET [base]/metadata
```

## Main sections

| Element | Meaning |
|---|---|
| `status`, `date`, `publisher` | Metadata about the statement |
| `kind` | `instance` (this actual server), `capability` (a software product), `requirements` (what a system should do, e.g. in an IG) |
| `software`, `implementation` | Product name/version, and the specific installation's URL |
| `fhirVersion` | e.g. `4.0.1` |
| `format` | Supported formats, e.g. `json`, `xml` |
| `implementationGuide` / `instantiates` | IGs and other statements it conforms to |
| `rest` | The REST API, one entry per `mode` |
| `messaging` | Messaging endpoints and supported events |
| `document` | Supported document profiles |

## Inside `rest`

- `rest.mode`: `server` or `client`.
- `rest.security`: e.g. SMART on FHIR (with the OAuth URLs in an extension), CORS support.
- `rest.resource[]`: one per supported resource type, with:
  - `type`: e.g. `Patient`
  - `profile` / `supportedProfile`
  - `interaction[].code`: `read`, `vread`, `update`, `patch`, `delete`, `history-instance`, `history-type`, `create`, `search-type`
  - `versioning`, `readHistory`, `updateCreate`, `conditionalCreate`, `conditionalUpdate`, `conditionalDelete`
  - `searchInclude`, `searchRevInclude`
  - `searchParam[]`: name, definition and type of each supported search parameter
  - `operation[]`: supported operations
- `rest.interaction[]`: system-level interactions: `transaction`, `batch`, `search-system`, `history-system`.
- `rest.operation[]`: system-level operations.

## Reading it for an exam question

"Can I create Observations on this server?" Find `rest` with `mode = server`, then `resource` with `type = Observation`, then look for `interaction.code = create`. If it isn't listed, the server doesn't support it, and a POST will probably fail (often `405 Method Not Allowed` or `404`).
