## Reading the element table

Each row of a resource's **Structure** table shows:

| Column | Meaning |
|---|---|
| Name | Element path, e.g. `Patient.name.family` |
| Flags | Special flags (below) |
| Card. | Cardinality: `0..1`, `1..1`, `0..*`, `1..*` |
| Type | Data type, or `Reference(Patient \| Group)`, or several for `[x]` |
| Description & Constraints | Definition, binding, invariants |

## Flags

| Flag | Meaning |
|---|---|
| **?!** | **Is-Modifier.** Changes the meaning of the resource; you can't safely ignore it (e.g. `Patient.active`, `Observation.status`) |
| **Σ** | Part of the **summary** (returned with `_summary=true`) |
| **S** | **Must Support** (in profiles; meaning defined by the IG) |
| **I** | Has **invariants** (constraints) |
| **N / TU** | Normative / Trial Use status |

## Cardinality

- `min = 1` means required. `max = *` means repeating (an array in JSON).
- Profiles can only **tighten** cardinality: `0..*` → `1..1` is fine, `1..1` → `0..1` isn't.

## Coded elements

Check the element's type and binding:

- `code`: a single code from a fixed list, usually a **required** binding (e.g. `Patient.gender`).
- `Coding`: system + code.
- `CodeableConcept`: one or more `Coding`s plus `text`.
- The **binding strength** (`required`, `extensible`, `preferred`, `example`) says how strictly you must use the value set. See *Determine terminology for a use case*.

## References

`Reference` has `reference`, `type`, `identifier` and `display`:

| Kind | Example |
|---|---|
| Relative | `"reference": "Patient/123"` (resolved against the server base) |
| Absolute | `"reference": "https://example.org/fhir/Patient/123"` |
| Version-specific | `"reference": "Patient/123/_history/2"` |
| Contained | `"reference": "#med1"` points to a resource in `contained` |
| Bundle-local | `"reference": "urn:uuid:..."` matches an entry's `fullUrl` |
| Logical | `"identifier": { "system": "...", "value": "..." }` when there's no FHIR URL |

**Contained resources** have no independent identity: they can't be read, searched or updated on their own, and can't contain other resources. Only use them when the data can't exist without the container (e.g. a medication defined only within one prescription).

A **`canonical`** reference points to a conformance resource by URL (e.g. a profile or value set), optionally with `|version`.

## Choosing the right element

Read the definition and comments, not just the name. For example:

- `Observation.effective[x]` is the clinically relevant time; `Observation.issued` is when the result was released.
- `Patient.identifier` is a business identifier (MRN); `Patient.id` is the server's logical id.
- `Encounter.period` is when it happened; `Encounter.length` is a duration.
