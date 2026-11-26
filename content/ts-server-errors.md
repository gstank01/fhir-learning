## HTTP status codes

| Code | Meaning in FHIR | Typical cause |
|---|---|---|
| `200 OK` | Success | read, search, update |
| `201 Created` | Resource created | create (check the `Location` header) |
| `204 No Content` | Success, no body | delete, or `Prefer: return=minimal` |
| `400 Bad Request` | Request can't be parsed, or invalid search parameters | Malformed JSON/XML, `id` in body doesn't match URL |
| `401 Unauthorized` | Not authenticated | Missing or expired access token |
| `403 Forbidden` | Authenticated, but not allowed | Scopes don't cover the action |
| `404 Not Found` | Unknown resource type or id | Wrong URL, wrong id, unsupported resource type |
| `405 Method Not Allowed` | HTTP verb not supported here | e.g. DELETE on a server that doesn't support delete |
| `409 Conflict` | Version conflict | Someone else updated the resource |
| `410 Gone` | Resource was deleted | Reading a deleted resource |
| `412 Precondition Failed` | Condition not met | `If-Match` version is stale, or conditional create/update matched several resources |
| `415 Unsupported Media Type` | Wrong `Content-Type` | Use `application/fhir+json` or `application/fhir+xml` |
| `422 Unprocessable Entity` | Valid syntax, but fails validation or business rules | Breaks a profile or required field |
| `429 Too Many Requests` | Rate limit | Slow down |
| `500 Internal Server Error` | Server failure | Server-side bug |
| `503 Service Unavailable` | Server down or overloaded | Try later |

Error responses should carry an `OperationOutcome` explaining the problem.

## Triage

1. **No response / timeout / 5xx:** connectivity or server problem. Check the base URL, network, server status.
2. **401 / 403:** permissions. Check the token, its expiry, and its scopes.
3. **404 / 405 / 400:** wrong use of the API. Check the URL, resource type spelling, HTTP verb, `Content-Type`, and that the server supports the interaction.
4. **422 / 400 with validation issues:** missing or incorrect data. Read the `OperationOutcome` issues.
5. **409 / 412:** concurrency or conditional logic. Re-read the resource and retry, or make the condition more specific.

## Check the CapabilityStatement

`GET [base]/metadata` tells you whether the server supports the resource type, the interaction (`create`, `update`, `search-type`…), the search parameter, the operation, and the format you are using. Unsupported search parameters are usually **ignored**, not rejected; compare the `self` link in the result Bundle with your request, or send `Prefer: handling=strict` to get an error instead.
