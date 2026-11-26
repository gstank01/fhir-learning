## Bundle types

| `Bundle.type` | Used for | Notes |
|---|---|---|
| `document` | Documents | First entry is a `Composition`; `identifier` and `timestamp` required |
| `message` | Messaging | First entry is a `MessageHeader` |
| `transaction` | Write many resources atomically | All succeed or all fail |
| `transaction-response` | Server reply to a transaction | |
| `batch` | Many independent requests | Each succeeds or fails on its own |
| `batch-response` | Server reply to a batch | |
| `searchset` | Search results | Has `total`, `link` (paging), `entry.search.mode` |
| `history` | History results | `entry.request` / `entry.response` show what happened |
| `collection` | Any set of resources, no special processing | |

## Key parts

- `Bundle.entry.fullUrl`: the absolute URL (or `urn:uuid:...`) of each entry's resource. Other entries reference it.
- `Bundle.entry.resource`: the resource itself.
- `Bundle.entry.request`: `method` and `url`, for `transaction`, `batch` and `history`.
- `Bundle.entry.response`: `status`, `location`, `etag`, for responses.
- `Bundle.entry.search`: `mode` = `match`, `include` or `outcome`, and `score`, for `searchset`.
- `Bundle.link`: `self`, `next`, `previous`, `first`, `last` links for paging.
- `Bundle.total`: only in `searchset` and `history`.

## Transactions

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [{
    "fullUrl": "urn:uuid:61ebe359-bfdc-4613-8bf2-c5e300945f0a",
    "resource": { "resourceType": "Patient", "name": [{ "family": "Chalmers" }] },
    "request": { "method": "POST", "url": "Patient" }
  }, {
    "resource": {
      "resourceType": "Observation", "status": "final",
      "code": { "text": "Weight" },
      "subject": { "reference": "urn:uuid:61ebe359-bfdc-4613-8bf2-c5e300945f0a" }
    },
    "request": { "method": "POST", "url": "Observation" }
  }]
}
```

- New resources use `urn:uuid:` full URLs; the server replaces those references with the real ids.
- The server processes **DELETE, then POST, then PUT/PATCH, then GET/HEAD**, regardless of the order in the Bundle.
- A **batch** must not have dependencies between entries. Use a transaction when entries reference each other.
