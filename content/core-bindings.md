## What a binding is

A **binding** connects a coded element to a **value set**: the list of codes allowed (or suggested) for that element. Every binding has two parts:

1. **Which value set**, e.g. AdministrativeGender, ObservationStatus, MaritalStatus.
2. **How strictly** you must use it: the **binding strength**.

```
Patient.gender  ──bound to──▶  ValueSet: AdministrativeGender  (strength: required)
                                  │ includes codes from
                                  ▼
                               CodeSystem: http://hl7.org/fhir/administrative-gender
                                  male | female | other | unknown
```

Bindings appear only on coded elements: types `code`, `Coding`, `CodeableConcept`, and sometimes `Quantity` (for units), `string` or `uri`.

## Where to find bindings

1. In the structure table, at the end of the **Description & Constraints** cell: `AdministrativeGender (Required)`.
2. In the **Terminology Bindings** section under the table. Real example from Patient:

| Path | Definition | Type | Reference |
|---|---|---|---|
| Patient.gender, Patient.contact.gender | The gender of a person used for administrative purposes | **Required** | AdministrativeGender |
| Patient.maritalStatus | The domestic partnership status of a person | **Extensible** | Marital Status Codes |
| Patient.contact.relationship | The nature of the relationship between a patient and a contact person | **Extensible** | PatientContactRelationship |
| Patient.communication.language | A human language | **Preferred**, but limited to AllLanguages | CommonLanguages |
| Patient.link.type | The type of link between this patient resource and another | **Required** | LinkType |

## The four binding strengths

From strictest to loosest. Learn the exact rules: this is one of the most tested topics.

| Strength | Rule (from the spec) | In practice |
|---|---|---|
| **required** | The concept **SHALL** be from the specified value set. | Only codes in the value set. Nothing else is valid. |
| **extensible** | The concept **SHALL** be from the value set **if any code in it applies**. If none applies (based on human review), other codes (or, data type allowing, text) may be used instead. | Use the value set when you can. Only go outside it when nothing in it fits. |
| **preferred** | Instances are **encouraged** to use the codes, but don't have to. | Recommended for interoperability. Other codes are still valid. |
| **example** | Instances are **not expected** to use the value set. It only shows the kind of codes intended. | Any suitable codes. |

Only **required** and **extensible** create hard conformance rules. **Preferred** and **example** never make an instance invalid.

## Required, in detail

With a `code` element (e.g. `gender`, `status`):

- The value must be one of the codes in the value set, matched **case-sensitively**.
- `"gender": "Female"` is **invalid**: it must be `"female"`.

With a `CodeableConcept`:

- At least one `Coding` must be present.
- One of the codings must come from the value set.
- `text` is recommended as well, but `text` alone is **not** enough.

If the element repeats, the binding applies to every repetition.

## Extensible, in detail

> **Example:** `Patient.maritalStatus` has an extensible binding to Marital Status Codes.
>
> - A patient is married → you **must** use the code `M` from the value set, even if your system has its own local code for "married".
> - Your system has a status the value set doesn't cover at all → you may use your local code, or just `text`.

The question to ask is: "Is there a code in the value set that means this?" If yes, you must use it.

## "Preferred, but limited to…"

Some bindings have an extra **maximum value set**. For `Patient.communication.language`, you're encouraged to use CommonLanguages, but whatever you send must still be within AllLanguages. You can go beyond the preferred list, but not beyond the maximum.

## Bindings in profiles

Profiles (e.g. in US Core) can:

- **Make a binding stricter**, e.g. change example or preferred to extensible or required.
- **Bind to a narrower value set**, a subset of the original.
- Never make a **required** binding looser.

## Practice

1. `Observation.status` is bound to ObservationStatus with strength required. Is `"status": "done"` valid?
2. `Condition.code` has an example binding to SNOMED CT clinical findings. Can you use an ICD-10 code?
3. A value set is bound with extensible strength, and the value set contains a code for your concept, but your system uses a local code. What must you send?

Answers: No, it must be a code from the value set (e.g. `final`); yes, the binding is only an example; the code from the value set (you may add your local code as an extra coding).
