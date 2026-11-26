## The paradigms

| Paradigm | How it works | Choose it when |
|---|---|---|
| **RESTful API** | Client reads and writes individual resources on a server over HTTP | On-demand access to current data, apps, most regulated APIs |
| **Documents** | A `Bundle` of type `document` with a `Composition` first; a signed, persistent, self-contained record | Discharge summaries, referrals, patient summaries that must stay unchanged and be attested |
| **Messaging** | A `Bundle` of type `message` with a `MessageHeader` first, sent to a receiver that acts on it | Event-driven exchange between systems, like HL7 v2 (admissions, lab orders) |
| **Services / Operations** | Calling a named operation (`$validate`, `$everything`) that does processing | Logic beyond plain CRUD |
| **Subscriptions** | Server notifies a client when data matching criteria changes | Avoiding polling: "tell me when a new lab result arrives" |
| **Bulk Data** (`$export`) | Asynchronous export of many resources as NDJSON files | Analytics, population health, payer data, migrating data |

The base spec also mentions **persistence/storage**, i.e. using FHIR resources inside a database.

## How to pick

- **One record, now, interactive?** REST.
- **Must be preserved as an attested, signed whole?** Document.
- **Triggered by an event, sent point-to-point, receiver acts?** Message.
- **Huge volumes, not real time?** Bulk Data.
- **Need to be told when something changes?** Subscription. In R4 this is criteria-based `Subscription` with channel types `rest-hook`, `websocket`, `email`, `sms` or `message`. R5 moved to topic-based subscriptions, back-ported to R4 by the Subscriptions R5 Backport IG.

## Bulk Data in one minute

```
GET [base]/Patient/$export
Accept: application/fhir+json
Prefer: respond-async
```

The server answers `202 Accepted` with a `Content-Location` URL. The client polls that URL until it gets `200 OK` and a manifest listing NDJSON files to download. Authorisation is usually SMART Backend Services.
