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

Here is the top of the real Patient table:

| Name | Flags | Card. | Type | Description & Constraints |
|---|---|---|---|---|
| ![Resource](img/fhir/icon_resource.png) **Patient** | N | | DomainResource | Information about an individual or animal receiving health care services |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) identifier | Σ | 0..* | Identifier | An identifier for this patient |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) active | ?! Σ | 0..1 | boolean | Whether this patient's record is in active use |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) name | Σ | 0..* | HumanName | A name associated with the patient |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) gender | Σ | 0..1 | code | male \| female \| other \| unknown<br>AdministrativeGender (**Required**) |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) birthDate | Σ | 0..1 | date | The date of birth for the individual |
| &emsp;![Choice](img/fhir/icon_choice.gif) deceased[x] | ?! Σ | 0..1 | | Indicates if the individual is deceased or not |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) deceasedBoolean | | | boolean | |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) deceasedDateTime | | | dateTime | |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) maritalStatus | | 0..1 | CodeableConcept | Marital (civil) status of a patient<br>MaritalStatus (**Extensible**) |
| &emsp;![Backbone element](img/fhir/icon_element.gif) contact | I | 0..* | BackboneElement | A contact party (e.g. guardian, partner, friend) for the patient<br>+ Rule: SHALL at least contain a contact's details or a reference to an organization |
| &emsp;![Reference](img/fhir/icon_reference.png) generalPractitioner | | 0..* | Reference(Organization \| Practitioner \| PractitionerRole) | Patient's nominated primary care provider |

Read one row like a sentence. For example, `gender`:

> "`gender` is a **primitive** element, part of the **summary** (Σ), **optional** (0..1), of type **code**, and must be one of `male`, `female`, `other`, `unknown`, because it has a **required** binding to AdministrativeGender."

## Practice

Open [Observation](https://hl7.org/fhir/R4/observation.html) and answer:

1. Which two elements are required (minimum cardinality 1)?
2. Which element is a choice type that holds the result?
3. What is the binding strength of `Observation.status`?

Answers: `status` and `code`; `value[x]`; required (ObservationStatus).
