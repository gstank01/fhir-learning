## First, do you need one?

Before adding an extension, check:

1. Is there already an element for it? Read the resource's elements **and their definitions**, including backbone elements and data types (e.g. `HumanName.period`, `Address.use`).
2. Does a **different resource** cover it (e.g. use `Observation` for a social history fact instead of extending `Patient`)?
3. Could you use `Observation`, `Basic` or a code in an existing `CodeableConcept`?

FHIR's **80% rule**: core resources include what most implementations need; the rest is handled with extensions.

## Where to find existing extensions

- [R4 extension registry](https://hl7.org/fhir/R4/extensibility-registry.html) in the core spec, and the newer **FHIR Extensions Pack** at [hl7.org/fhir/extensions](https://hl7.org/fhir/extensions/).
- The **Extensions** list on each resource page ("Extensions defined for this resource").
- The IG you are using (e.g. US Core race, ethnicity and birth sex).
- Registries: [Simplifier.net](https://simplifier.net), [packages.fhir.org](https://packages.fhir.org).

Reuse an existing extension rather than defining your own; that is what makes data interoperable.

## Checking an extension fits

Open its `StructureDefinition` and check:

- **Context:** where it may be used (e.g. on `Patient`, or on `Address`).
- **Value type:** `value[x]` type, e.g. `valueCodeableConcept`, `valueDateTime`, `valueBoolean`. It must match your data.
- **Cardinality** and whether it is a **complex** extension (with nested extensions instead of a value).
- **Binding** of a coded value.
- **Is-Modifier:** a modifier extension must go in `modifierExtension`.

## Common core extensions

| Extension | Use |
|---|---|
| `patient-birthPlace` | Patient's place of birth (Address) |
| `patient-mothersMaidenName` | Mother's maiden name (string) |
| `patient-nationality` | Nationality (complex) |
| `data-absent-reason` | Why a value is missing (can go on any element) |
| `humanname-own-prefix` | Own-name prefix on HumanName (e.g. "van") |
| `allergyintolerance-certainty` | How certain the reaction's substance is |
