## What the icons are for

Every row in a structure table starts with a small icon in the **Name** column. It tells you at a glance **what kind of element** that row is, before you even read the type.

## The icons

| Icon | Name | Meaning | Example |
|---|---|---|---|
| ![Resource](img/fhir/icon_resource.png) | Resource | The root of the resource: the first row of the table | `Patient` |
| ![Backbone element](img/fhir/icon_element.gif) | Element (backbone) | An element defined inside this resource, with its own children listed below it | `Patient.contact`, `Observation.component` |
| ![Choice of types](img/fhir/icon_choice.gif) | Choice of types | The element can have one of several types; its name ends in `[x]` | `Patient.deceased[x]`, `Observation.value[x]` |
| ![Primitive type](img/fhir/icon_primitive.png) | Primitive type | Holds a single value; type name starts with a lower-case letter | `Patient.birthDate` (date), `Patient.active` (boolean) |
| ![Complex type](img/fhir/icon_datatype.gif) | Complex data type | Has child elements defined by a reusable data type; type name starts with an upper-case letter | `Patient.name` (HumanName), `Observation.code` (CodeableConcept) |
| ![Reference](img/fhir/icon_reference.png) | Reference | Points to another resource | `Observation.subject` → Reference(Patient \| Group \| …) |
| ![Reuse](img/fhir/icon_reuse.png) | Reuse | Has the same content as another element in this resource (the type says "see …") | `Questionnaire.item.item` (see `item`) |
| ![Slice](img/fhir/icon_slice.png) | Slice | Start of a set of slices, in a profile | `Observation.component` sliced into systolic and diastolic |
| ![Simple extension](img/fhir/icon_extension_simple.png) | Simple extension | An extension with one value | birthPlace |
| ![Complex extension](img/fhir/icon_extension_complex.png) | Complex extension | An extension made of nested extensions | nationality |
| ![Simple modifier extension](img/fhir/icon_modifier_extension_simple.png) | Simple modifier extension | A modifier extension with one value | |
| ![Complex modifier extension](img/fhir/icon_modifier_extension_complex.png) | Complex modifier extension | A modifier extension made of nested extensions | |
| ![Profile](img/fhir/icon_profile.png) | Profile | The root of a logical profile | |

## The ones you'll see most

In the core resource pages, five icons cover almost every row. Learn these first:

1. ![Resource](img/fhir/icon_resource.png) **Resource**: top row only.
2. ![Primitive type](img/fhir/icon_primitive.png) **Primitive**: a single value such as a date, code, string or boolean.
3. ![Complex type](img/fhir/icon_datatype.gif) **Complex data type**: a reusable structure such as CodeableConcept, Identifier, HumanName, Quantity.
4. ![Backbone element](img/fhir/icon_element.gif) **Backbone element**: a group of elements defined only in this resource.
5. ![Reference](img/fhir/icon_reference.png) **Reference**: a link to another resource.

Plus ![Choice of types](img/fhir/icon_choice.gif) **choice** for `[x]` elements.

The extension and slice icons appear mainly when you look at **profiles** in implementation guides.

## Complex data type or backbone element?

Both have children, so they're easy to mix up:

| | ![Complex type](img/fhir/icon_datatype.gif) Complex data type | ![Backbone element](img/fhir/icon_element.gif) Backbone element |
|---|---|---|
| Where are the children defined? | On the data type's own page (e.g. HumanName) | Right here, indented under it in this table |
| Reused elsewhere? | Yes, in many resources | No, only in this resource |
| Type column shows | The data type name, e.g. `HumanName` | `BackboneElement` |
