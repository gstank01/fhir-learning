## Why this matters

Most exam questions boil down to "look at this resource definition and decide…". Which element holds the data? Is it required? Which codes are allowed? Can I ignore it? All of those answers come from the same place: the resource's page in the spec. This section teaches you to read that page quickly.

## The resource name

Every resource has a name in **UpperCamelCase**: `Patient`, `Observation`, `MedicationRequest`, `AllergyIntolerance`.

- The name is **case-sensitive** and is used exactly as written:
  - in JSON as `"resourceType": "Patient"`
  - in XML as the root element `<Patient xmlns="http://hl7.org/fhir">`
  - in URLs as `[base]/Patient/123`
- The spec page for a resource is its name in lower case: `patient.html`, `medicationrequest.html`.

## The header of a resource page

Just under the title you see a line such as:

> Patient Administration Work Group · Maturity Level: N · Normative (from v4.0.0) · Security Category: Patient · Compartments: Patient, Practitioner, RelatedPerson

| Item | Meaning |
|---|---|
| Work Group | The HL7 group responsible for the resource |
| Maturity Level | `0`–`5` for trial-use content, `N` for normative (stable) |
| Standards status | Normative, Trial Use or Draft |
| Security Category | How sensitive the data usually is (Anonymous, Business, Individual, Patient, Not Classified) |
| Compartments | The compartments the resource belongs to, e.g. it can be found with `GET [base]/Patient/123/Observation` |

## The tabs

| Tab | What's on it |
|---|---|
| **Content** | Scope and usage, boundaries, the structure table, terminology bindings, constraints, notes and search parameters. **This is the tab you use most.** |
| Examples | Example instances in JSON, XML and Turtle |
| **Detailed Descriptions** | The full definition, comments, requirements and meaning-when-missing for every element |
| Mappings | How elements map to HL7 v2, CDA, RIM and other standards |
| Profiles & Extensions | Profiles and extensions defined in the core spec for this resource |
| Operations | Operations defined on this resource, e.g. `$everything` on Patient |

## The Content tab, top to bottom

1. **Scope and Usage**: what the resource is for.
2. **Boundaries and Relationships**: what it is *not* for, and which resource to use instead.
3. **Background and Context**: extra explanation.
4. **Resource Content**: the **structure table** (and UML, XML, JSON and Turtle views of the same thing).
5. **Terminology Bindings**: every coded element with its value set and binding strength.
6. **Constraints**: the rules (invariants) the resource must follow.
7. **Notes**: implementation guidance.
8. **Search Parameters**: the parameters you can search this resource with.

## The structure table

The structure table is the heart of every resource page. It has five columns, each covered in its own page in this section:

| Column | Tells you | Page |
|---|---|---|
| **Name** | The element name, with an icon showing what kind of element it is | Resource elements, Icons |
| **Flags** | Special handling: modifier, summary, must support, constraints, status | Flags |
| **Card.** | Cardinality: how many times the element may or must appear | Resource elements |
| **Type** | The data type, or the allowed reference targets | Types |
| **Description & Constraints** | A short description, rules, and for coded elements the binding | Description, Bindings |

Here is the complete structure table for **Patient** in R4. Every element name, flag, type and binding links to its definition in the spec.

<div class="structure-table">

| [Name](https://hl7.org/fhir/R4/formats.html#table) | [Flags](https://hl7.org/fhir/R4/formats.html#table) | [Card.](https://hl7.org/fhir/R4/formats.html#table) | [Type](https://hl7.org/fhir/R4/formats.html#table) | [Description & Constraints](https://hl7.org/fhir/R4/formats.html#table) |
|---|---|---|---|---|
| ![Resource](img/fhir/icon_resource.png) **[Patient](https://hl7.org/fhir/R4/patient-definitions.html#Patient)** | [N](https://hl7.org/fhir/R4/versions.html#std-process "Normative") |  | [DomainResource](https://hl7.org/fhir/R4/domainresource.html) | Information about an individual or animal receiving health care services<br>*Elements defined in Ancestors: [id](https://hl7.org/fhir/R4/resource.html#Resource), [meta](https://hl7.org/fhir/R4/resource.html#Resource), [implicitRules](https://hl7.org/fhir/R4/resource.html#Resource), [language](https://hl7.org/fhir/R4/resource.html#Resource), [text](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [contained](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [extension](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [modifierExtension](https://hl7.org/fhir/R4/domainresource.html#DomainResource)* |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [identifier](https://hl7.org/fhir/R4/patient-definitions.html#Patient.identifier) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..* | [Identifier](https://hl7.org/fhir/R4/datatypes.html#Identifier) | An identifier for this patient |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [active](https://hl7.org/fhir/R4/patient-definitions.html#Patient.active) | [?!](https://hl7.org/fhir/R4/conformance-rules.html#isModifier "Is-Modifier") [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..1 | [boolean](https://hl7.org/fhir/R4/datatypes.html#boolean) | Whether this patient's record is in active use |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [name](https://hl7.org/fhir/R4/patient-definitions.html#Patient.name) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..* | [HumanName](https://hl7.org/fhir/R4/datatypes.html#HumanName) | A name associated with the patient |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [telecom](https://hl7.org/fhir/R4/patient-definitions.html#Patient.telecom) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..* | [ContactPoint](https://hl7.org/fhir/R4/datatypes.html#ContactPoint) | A contact detail for the individual |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [gender](https://hl7.org/fhir/R4/patient-definitions.html#Patient.gender) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | male \| female \| other \| unknown<br>[AdministrativeGender](https://hl7.org/fhir/R4/valueset-administrative-gender.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [birthDate](https://hl7.org/fhir/R4/patient-definitions.html#Patient.birthDate) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..1 | [date](https://hl7.org/fhir/R4/datatypes.html#date) | The date of birth for the individual |
| &emsp;![Choice of types](img/fhir/icon_choice.gif) deceased[x] | [?!](https://hl7.org/fhir/R4/conformance-rules.html#isModifier "Is-Modifier") [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..1 |  | Indicates if the individual is deceased or not |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) deceasedBoolean |  |  | [boolean](https://hl7.org/fhir/R4/datatypes.html#boolean) |  |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) deceasedDateTime |  |  | [dateTime](https://hl7.org/fhir/R4/datatypes.html#dateTime) |  |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [address](https://hl7.org/fhir/R4/patient-definitions.html#Patient.address) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..* | [Address](https://hl7.org/fhir/R4/datatypes.html#Address) | An address for the individual |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [maritalStatus](https://hl7.org/fhir/R4/patient-definitions.html#Patient.maritalStatus) |  | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Marital (civil) status of a patient<br>[MaritalStatus](https://hl7.org/fhir/R4/valueset-marital-status.html) ([Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible)) |
| &emsp;![Choice of types](img/fhir/icon_choice.gif) multipleBirth[x] |  | 0..1 |  | Whether patient is part of a multiple birth |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) multipleBirthBoolean |  |  | [boolean](https://hl7.org/fhir/R4/datatypes.html#boolean) |  |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) multipleBirthInteger |  |  | [integer](https://hl7.org/fhir/R4/datatypes.html#integer) |  |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [photo](https://hl7.org/fhir/R4/patient-definitions.html#Patient.photo) |  | 0..* | [Attachment](https://hl7.org/fhir/R4/datatypes.html#Attachment) | Image of the patient |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [contact](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact) | [I](https://hl7.org/fhir/R4/conformance-rules.html#constraints "Has constraints") | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | A contact party (e.g. guardian, partner, friend) for the patient<br>+ Rule: SHALL at least contain a contact's details or a reference to an organization |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [relationship](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact.relationship) |  | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | The kind of relationship<br>[Patient Contact Relationship](https://hl7.org/fhir/R4/valueset-patient-contactrelationship.html) ([Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible)) |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [name](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact.name) |  | 0..1 | [HumanName](https://hl7.org/fhir/R4/datatypes.html#HumanName) | A name associated with the contact person |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [telecom](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact.telecom) |  | 0..* | [ContactPoint](https://hl7.org/fhir/R4/datatypes.html#ContactPoint) | A contact detail for the person |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [address](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact.address) |  | 0..1 | [Address](https://hl7.org/fhir/R4/datatypes.html#Address) | Address for the contact person |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [gender](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact.gender) |  | 0..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | male \| female \| other \| unknown<br>[AdministrativeGender](https://hl7.org/fhir/R4/valueset-administrative-gender.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [organization](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact.organization) | [I](https://hl7.org/fhir/R4/conformance-rules.html#constraints "Has constraints") | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html)([Organization](https://hl7.org/fhir/R4/organization.html)) | Organization that is associated with the contact |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [period](https://hl7.org/fhir/R4/patient-definitions.html#Patient.contact.period) |  | 0..1 | [Period](https://hl7.org/fhir/R4/datatypes.html#Period) | The period during which this contact person or organization is valid to be contacted relating to this patient |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [communication](https://hl7.org/fhir/R4/patient-definitions.html#Patient.communication) |  | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | A language which may be used to communicate with the patient about his or her health |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [language](https://hl7.org/fhir/R4/patient-definitions.html#Patient.communication.language) |  | 1..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | The language which can be used to communicate with the patient about his or her health<br>[Common Languages](https://hl7.org/fhir/R4/valueset-languages.html) ([Preferred](https://hl7.org/fhir/R4/terminologies.html#preferred) but limited to [AllLanguages](https://hl7.org/fhir/R4/valueset-all-languages.html)) |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [preferred](https://hl7.org/fhir/R4/patient-definitions.html#Patient.communication.preferred) |  | 0..1 | [boolean](https://hl7.org/fhir/R4/datatypes.html#boolean) | Language preference indicator |
| &emsp;![Reference](img/fhir/icon_reference.png) [generalPractitioner](https://hl7.org/fhir/R4/patient-definitions.html#Patient.generalPractitioner) |  | 0..* | [Reference](https://hl7.org/fhir/R4/references.html)([Organization](https://hl7.org/fhir/R4/organization.html) \| [Practitioner](https://hl7.org/fhir/R4/practitioner.html) \| [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html)) | Patient's nominated primary care provider |
| &emsp;![Reference](img/fhir/icon_reference.png) [managingOrganization](https://hl7.org/fhir/R4/patient-definitions.html#Patient.managingOrganization) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html)([Organization](https://hl7.org/fhir/R4/organization.html)) | Organization that is the custodian of the patient record |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [link](https://hl7.org/fhir/R4/patient-definitions.html#Patient.link) | [?!](https://hl7.org/fhir/R4/conformance-rules.html#isModifier "Is-Modifier") [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | Link to another patient resource that concerns the same actual person |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [other](https://hl7.org/fhir/R4/patient-definitions.html#Patient.link.other) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 1..1 | [Reference](https://hl7.org/fhir/R4/references.html)([Patient](https://hl7.org/fhir/R4/patient.html) \| [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html)) | The other patient or related person resource that the link refers to |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [type](https://hl7.org/fhir/R4/patient-definitions.html#Patient.link.type) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary "Part of the summary") | 1..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | replaced-by \| replaces \| refer \| seealso<br>[LinkType](https://hl7.org/fhir/R4/valueset-link-type.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |

</div>

Things to notice in this table:

- **Indentation shows nesting.** `contact`, `communication` and `link` are backbone elements; the rows indented under them are their children (`Patient.contact.name`, `Patient.link.type`).
- **Choice elements expand.** `deceased[x]` is followed by its two options, `deceasedBoolean` and `deceasedDateTime`. In an instance you use exactly one of them.
- **Nothing is required at the top level.** Every top-level element is `0..1` or `0..*`, so `{"resourceType": "Patient"}` is a valid Patient. `communication.language`, `link.other` and `link.type` are `1..1`, but only *if* you include the `communication` or `link` element they belong to.
- **Three modifiers.** `active`, `deceased[x]` and `link` carry **?!**, so a system must not ignore them.
- **One constraint.** `contact` and `contact.organization` are flagged **I** because of rule `pat-1`, shown under `contact`.
- **Five bindings**, with three different strengths: `gender`, `contact.gender` and `link.type` are **required**; `maritalStatus` and `contact.relationship` are **extensible**; `communication.language` is **preferred** (with a maximum value set).
- **Reference targets** tell you which other resources Patient points to: Organization, Practitioner, PractitionerRole, Patient and RelatedPerson.

Read one row like a sentence. For example, `gender`:

> "`gender` is a **primitive** element, part of the **summary** (Σ), **optional** (0..1), of type **code**, and must be one of `male`, `female`, `other`, `unknown`, because it has a **required** binding to AdministrativeGender."

Two more, from further down the table:

> "`contact` is a **backbone element** that can **repeat** (0..*), has a **constraint** (I): each contact must have a name, telecom, address or organization. Its children are listed under it."

> "`link` is a repeating **backbone element** that is a **modifier** and in the **summary** (?! Σ). If present, each link **must** have `other` (a reference to a Patient or RelatedPerson) and `type`, a code from the **required** LinkType value set."

And here is a small Patient instance that uses several of those rows:

```json
{
  "resourceType": "Patient",
  "identifier": [{ "system": "http://hospital.example.org/mrn", "value": "12345" }],
  "active": true,
  "name": [{ "family": "Chalmers", "given": ["Peter", "James"] }],
  "gender": "male",
  "birthDate": "1974-12-25",
  "deceasedBoolean": false,
  "maritalStatus": {
    "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus", "code": "M", "display": "Married" }]
  },
  "contact": [{
    "relationship": [{ "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v2-0131", "code": "N", "display": "Next-of-Kin" }] }],
    "name": { "family": "Chalmers", "given": ["Jane"] },
    "telecom": [{ "system": "phone", "value": "+1 555 0100" }]
  }],
  "managingOrganization": { "reference": "Organization/1" }
}
```

Notice how the table predicts the JSON: `0..*` elements (`identifier`, `name`, `contact`, `relationship`, `telecom`) are arrays; `0..1` elements are single values; `deceased[x]` became `deceasedBoolean`; `gender` is a plain code; `maritalStatus` is a CodeableConcept.

## Practice

Open [Observation](https://hl7.org/fhir/R4/observation.html) and answer:

1. Which two elements are required (minimum cardinality 1)?
2. Which element is a choice type that holds the result?
3. What is the binding strength of `Observation.status`?

Answers: `status` and `code`; `value[x]`; required (ObservationStatus).
