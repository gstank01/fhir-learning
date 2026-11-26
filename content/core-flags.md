## What the flags are

The **Flags** column holds short symbols that tell you how to **handle** an element. They are easy exam points because each one has a precise meaning.

| Flag | Name | Meaning |
|---|---|---|
| **?!** | Is-Modifier | The element can **change the meaning** of the resource. A system must understand it, and must not ignore it. |
| **S** | Must Support | Systems must "support" the element. What "support" means is defined by the **profile or IG**, not the core spec. Only appears in profiles. |
| **Σ** | Summary | The element is part of the **summary**, returned when a client asks for `_summary=true`. |
| **I** | Constraints | The element **defines or is affected by** constraints (invariants). Check the Constraints section. |
| **NE** | No extensions | The element **cannot have extensions**. Only some infrastructure elements. |
| **N** | Normative | The element's standards status is **Normative**: stable, changes must be backward compatible. |
| **TU** | Trial Use | The element's standards status is **Trial Use**: may still change. |
| **D** | Draft | The element's standards status is **Draft**. |

An element can have several flags, e.g. `Patient.active` is **?! Σ**.

## ?! Is-Modifier: the most important flag

A modifier element changes how the rest of the resource must be read. If your system ignores it, it may treat data as true when it isn't.

| Element | Why it's a modifier |
|---|---|
| `Patient.active` | `false` means the record is no longer in use |
| `Observation.status` | `entered-in-error` means the result is wrong and must not be used |
| `AllergyIntolerance.verificationStatus` | `refuted` means the patient does **not** have the allergy |
| `Condition.verificationStatus` | `refuted` or `entered-in-error` reverses the meaning |
| `MedicationRequest.doNotPerform` | `true` means "do **not** give this medication" |
| `Patient.deceased[x]` | Changes how the patient record should be treated |

Rules to remember:

- Systems **must not ignore** modifier elements they receive.
- Modifier extensions go in **`modifierExtension`**, never in `extension`. A system that doesn't understand a modifier extension must not process the resource as if it weren't there.
- `isModifier` is fixed by the base resource; profiles cannot add or remove it.

## Σ Summary

The summary set is a cut-down view of a resource with its most important elements. A client asks for it with `_summary=true`:

```
GET [base]/Patient?name=smith&_summary=true
```

The server returns only the elements marked Σ. It's useful for search result lists, where you don't need every detail.

## S Must Support

- Appears only in **profiles** (e.g. US Core), never in the base resources.
- The **IG defines** what supporting means. Typically: a sender must send the element if it has the data; a receiver must be able to process it (store it, display it, or not reject it).
- Must Support is **not** the same as required. A Must Support element can still have a minimum cardinality of 0.

## I Constraints

An **I** means there is an invariant: a rule written in FHIRPath that the instance must meet. The rule shows in the Description column (e.g. "+ Rule: SHALL at least contain a contact's details or a reference to an organization") and in the Constraints section, with a key such as `pat-1`. Validation errors quote that key.

## Practice

1. A system receives an `AllergyIntolerance` and only reads `code` and `patient`. Which flag tells you that's unsafe?
2. Which flag would you check to see what `_summary=true` returns?
3. An element is **S** with cardinality `0..1`. Must every instance include it?

Answers: **?!** (it ignores `verificationStatus`, a modifier); **Σ**; no, Must Support isn't the same as required.
