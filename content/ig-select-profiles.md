## Key ideas

- A **resource** is the base definition in the core spec (e.g. `Observation`). A **profile** is a `StructureDefinition` that *constrains* a resource for a use case (e.g. US Core Blood Pressure), and is published inside an **Implementation Guide (IG)**.
- Profiles can make elements required, remove elements (max `0`), fix values, bind to value sets, add **Must Support** flags and define **extensions**. They can't add new elements or loosen the base rules.
- A resource instance claims conformance to a profile with `meta.profile`.

## Where to find the list

- Core spec: [Resource list](https://hl7.org/fhir/R4/resourcelist.html), grouped into Foundation, Base, Clinical, Financial and Specialized.
- In an IG: the **Artifacts** (or "Profiles") page lists every profile, extension, value set and example.

## Reading a resource or profile page

Each core resource page has sections you use to match it to a use case:

| Section | What it tells you |
|---|---|
| **Scope and Usage** | What the resource is for |
| **Boundaries and Relationships** | What it is *not* for, and which resource to use instead |
| **Background and Context** | Extra notes on how it is used |
| **Resource Content** | The element table: cardinality, flags, types, bindings |

Example: `Observation`'s boundaries say allergies belong in `AllergyIntolerance` and diagnoses in `Condition`.

## Inferring related profiles

A use case is rarely one resource. A lab result needs a `DiagnosticReport`, which references `Observation`s, which reference a `Patient` and maybe a `Specimen` and a `ServiceRequest`. Follow the `Reference(...)` targets in the element table, and use the IG's profile for each target where it has one.

## Exam tips

- If the question names an IG (US Core, IPS, etc.), choose that IG's profile over the bare resource.
- Read "Boundaries and Relationships" when two resources look similar.
