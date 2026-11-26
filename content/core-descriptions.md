## The Description & Constraints column

The last column of the structure table packs in three kinds of information:

1. A **short description** of the element.
2. Any **rules** (constraints) that apply to it.
3. For coded elements, the **binding**: the value set and its strength.

## Short description vs full definition

The text in the table is only the **short** description (`ElementDefinition.short`). For the full story, click the element name or open the **Detailed Descriptions** tab, which shows for every element:

| Item | Why it matters |
|---|---|
| **Definition** | The precise meaning of the element |
| **Comments** | Usage notes and common mistakes |
| **Requirements** | Why the element exists |
| **Meaning if missing** | How to interpret the element when it's absent |
| Control, Type, Is Modifier, Summary | The same facts as the table columns |
| Binding | The value set and strength |
| Invariants | Rules that apply |

Exam tip: when two elements look like they could both fit a scenario, the **Definition** and **Comments** decide it.

## Codes listed inline

For `code` elements with a small value set, the table shows the allowed codes directly:

| Element | Description column |
|---|---|
| `Patient.gender` | male \| female \| other \| unknown<br>AdministrativeGender (Required) |
| `Observation.status` | registered \| preliminary \| final \| amended +<br>ObservationStatus (Required) |

A trailing **+** means there are more codes than shown. Follow the value set link for the full list.

## Bindings in the description

For coded elements the description ends with the **value set name** and the **binding strength** in brackets:

- `AdministrativeGender (Required)`
- `MaritalStatus (Extensible)`
- `Common Languages (Preferred but limited to AllLanguages)`
- `SNOMED CT Clinical Findings (Example)`

The full list for a resource is in the **Terminology Bindings** section below the table. Bindings are covered in detail on the next pages.

## Constraints (invariants)

When the Flags column shows **I**, the description includes a rule, for example on `Patient.contact`:

> + Rule: SHALL at least contain a contact's details or a reference to an organization

The **Constraints** section lists every rule with:

| Column | Example |
|---|---|
| Id | `pat-1` |
| Level | Rule (an error if broken) or Warning |
| Location | `Patient.contact` |
| Description | SHALL at least contain a contact's details or a reference to an organization |
| Expression (FHIRPath) | `name.exists() or telecom.exists() or address.exists() or organization.exists()` |

There are also rules that apply to every resource, such as:

| Id | Rule |
|---|---|
| `ele-1` | All FHIR elements must have a @value or children |
| `ext-1` | Must have either extensions or value[x], not both |
| `dom-2` | If the resource is contained, it SHALL NOT contain nested resources |
| `dom-6` | A resource should have narrative for robust management (warning) |

When the validator reports `pat-1` or `ext-1`, look up the id in the Constraints section to see what you broke.
