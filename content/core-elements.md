## What an element is

A resource is a tree of **elements**. Each row in the structure table is one element. An element has:

- a **name** (e.g. `birthDate`)
- a **path**, its full position in the tree (e.g. `Patient.contact.name`)
- a **cardinality**
- a **type** (or child elements of its own)
- a **definition**, and sometimes flags, constraints and a binding

## Names and paths

- Element names are **lowerCamelCase** and **case-sensitive**: `birthDate`, not `birthdate` or `BirthDate`.
- The **path** joins names with dots, starting at the resource: `Patient.name.family`, `Observation.component.code`.
- Validation errors, FHIRPath, search parameter definitions and profiles all refer to elements by path, so get used to reading them.

## Cardinality

The **Card.** column says how many times an element may appear: `min..max`.

| Cardinality | Meaning | JSON shape |
|---|---|---|
| `0..1` | Optional, at most one | single value |
| `1..1` | **Required**, exactly one | single value |
| `0..*` | Optional, can repeat | **array** |
| `1..*` | **Required**, at least one, can repeat | **array** |
| `0..0` | Not allowed (only in profiles) | must be absent |

Remember:

- A max of `*` means the element is **always an array in JSON**, even with one value: `"given": ["Peter"]`.
- A min of `1` means the element **must** be present, or the resource is invalid.
- Elements with a min of `0` may be left out. Empty values are never allowed: no `""`, `null`, `[]` or `{}`.
- Profiles can only **tighten** cardinality (`0..*` → `1..1`), never loosen it (`1..1` → `0..1` is not allowed).

## Kinds of element

| Kind | Example | How you spot it |
|---|---|---|
| Primitive | `Patient.birthDate` (date) | Type starts with a lower-case letter; it holds a single value |
| Complex data type | `Patient.name` (HumanName) | Type starts with an upper-case letter; it has its own child elements defined by the data type |
| Backbone element | `Patient.contact` | Type is `BackboneElement`, and its children are listed right below it in the same table |
| Choice element | `Patient.deceased[x]` | Name ends in `[x]`; the type column lists several types |
| Reference | `Patient.generalPractitioner` | Type is `Reference(...)` |

A **backbone element** is a group of elements defined *inside* the resource because it only makes sense there: `Patient.contact`, `Observation.component`, `Encounter.participant`. Write it as a nested object (in an array if it repeats).

## Elements you don't see in the table

Every resource inherits some elements that aren't shown in its own table:

| From | Elements |
|---|---|
| **Resource** (all resources) | `id`, `meta`, `implicitRules`, `language` |
| **DomainResource** (almost all resources) | `text`, `contained`, `extension`, `modifierExtension` |

The first row of each table says "Elements defined in Ancestors: id, meta, …" to remind you. `Bundle`, `Binary` and `Parameters` inherit from Resource directly, so they don't have `text`, `contained` or `extension`.

Every element can also carry an `id` and `extension`s, even though the table doesn't show them.

## Choosing the right element

Don't go by the name alone. Read the short description, and for anything unclear, the **Detailed Descriptions** tab (definition, comments, meaning when missing). Classic traps:

| Looks similar | Difference |
|---|---|
| `Patient.id` vs `Patient.identifier` | Logical id assigned by the server vs business identifier such as an MRN |
| `Observation.effective[x]` vs `Observation.issued` | When the observation applies clinically vs when the result was released |
| `Patient.contact` vs `RelatedPerson` | Contact details only vs a person who takes part in care in their own right |
| `Encounter.period` vs `Encounter.length` | Start and end times vs a duration |
