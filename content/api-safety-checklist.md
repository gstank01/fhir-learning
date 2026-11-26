## Where it is

The [Safety checklist](https://hl7.org/fhir/R4/safety.html) in the core spec lists things an implementer must get right to avoid harming patients. The exam gives you a bad outcome and asks which checklist item would have prevented it.

## Checklist items to know

- **Production exchange:** the checklist is about real clinical exchange, so test with realistic data and test edge cases.
- **Narrative:** check that the human-readable narrative (`text`) matches the structured data, and that you display it when the data is complex. A clinician may only see the narrative.
- **Modifier elements and extensions:** systems must understand `isModifier` elements (e.g. `status`, `active`, `verificationStatus`) and must check `modifierExtension`. Ignoring `status = entered-in-error` can make a clinician act on wrong data.
- **Unknown extensions and elements:** don't silently drop data you don't recognise if it matters; at least keep it, and reject resources whose modifier extensions you don't understand.
- **Identifiers:** use the correct identifier `system`, so that MRNs from different facilities aren't mixed up. Patient matching errors are a top safety risk.
- **Version-aware updates:** use `If-Match` / ETags so that two clients don't overwrite each other's changes (the "lost update" problem).
- **Deleted resources:** handle `410 Gone`; don't keep acting on cached deleted data.
- **Time zones and precision:** keep timezone and precision on dates and times; don't add or drop precision.
- **Units:** use UCUM units in `Quantity` and convert correctly.
- **Code systems and display:** check that a `Coding`'s `display` matches its `code`; rely on the code, not the display text.
- **References:** resolve references correctly, including relative ones against the right base URL, and contained resources.
- **Search results:** read `Bundle.total` and follow `next` links. A search can return more results than the first page, and the server may ignore unknown parameters, so check the `self` link to see what was actually searched.
- **Clinical safety review:** clinical risk management should be part of the implementation process.

## Practice question pattern

> A clinician acted on a lab result that had been marked as an error. Which checklist item was missed?

The receiving system ignored `Observation.status` (a modifier element) with value `entered-in-error`.
