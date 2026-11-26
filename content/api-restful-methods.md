## Interactions at a glance

| Interaction | HTTP | URL | Success |
|---|---|---|---|
| read | GET | `[base]/Patient/123` | 200 |
| vread | GET | `[base]/Patient/123/_history/2` | 200 |
| update | PUT | `[base]/Patient/123` | 200 (or 201 if created) |
| patch | PATCH | `[base]/Patient/123` | 200 |
| delete | DELETE | `[base]/Patient/123` | 200 / 204 |
| create | POST | `[base]/Patient` | 201 + `Location` header |
| search | GET or POST | `[base]/Patient?name=smith` or `[base]/Patient/_search` | 200, `Bundle` type `searchset` |
| history | GET | `[base]/Patient/123/_history` | 200, `Bundle` type `history` |
| capabilities | GET | `[base]/metadata` | 200, `CapabilityStatement` |
| batch / transaction | POST | `[base]` with a `Bundle` | 200 |
| operation | GET or POST | `[base]/Patient/123/$everything` | depends |

## Rules worth memorising

- **create:** any `id` in the body is ignored; the server assigns one.
- **update:** the body's `id` must match the URL, otherwise `400`. Updating an id that doesn't exist creates it if the server allows client-defined ids.
- **Reading a deleted resource** returns `410 Gone`; a never-existing one returns `404 Not Found`.
- **Version-aware update:** send `If-Match: W/"3"`. If the version is no longer current the server returns `412 Precondition Failed` (some return `409 Conflict`).
- `Prefer: return=minimal | representation | OperationOutcome` controls what the server sends back after a write.

## Conditional interactions

| Interaction | How | 0 matches | 1 match | 2+ matches |
|---|---|---|---|---|
| Conditional create | `POST [base]/Patient` + `If-None-Exist: identifier=sys\|123` | create | do nothing, `200` | `412` |
| Conditional update | `PUT [base]/Patient?identifier=sys\|123` | create | update it | `412` |
| Conditional delete | `DELETE [base]/Patient?identifier=sys\|123` | `200`/`204`, nothing to do | delete it | `412` (or delete all, if supported) |

Use them when you know a **business identifier** but not the server's logical id, e.g. to avoid creating duplicate patients.

## Direct GET (read) versus search

- `GET [base]/Patient/123` returns **the resource itself**, or 404.
- `GET [base]/Patient?_id=123` returns a **Bundle** (`searchset`), possibly empty, with `200 OK`. Search never returns 404 for "no results".
- Use read when you know the logical id. Use search when you know other details (name, identifier, dates) or need several resources, `_include`, or paging.
