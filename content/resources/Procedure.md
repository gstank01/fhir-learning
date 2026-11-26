## Scope and Usage

Procedure is one of the **event** resources in the [FHIR workflow](https://hl7.org/fhir/R4/workflow.html) specification.

This resource is used to record the details of current and historical procedures performed on or for a patient. A procedure is an activity that is performed on, with, or for a patient as part of the provision of care. Examples include surgical procedures, diagnostic procedures, endoscopic procedures, biopsies, counseling, physiotherapy, personal support services, adult day care services, non-emergency transportation, home modification, exercise, etc. Procedures may be performed by a healthcare professional, a service provider, a friend or relative or in some cases by the patient themselves.

This resource provides summary information about the occurrence of the procedure and is not intended to provide real-time snapshots of a procedure as it unfolds, though for long-running procedures such as psychotherapy, it could represent summary level information about overall progress. The creation of a resource to support detailed real-time procedure information awaits the identification of a specific implementation use-case to share such information.

## Boundaries and Relationships

The Procedure resource should not be used to capture an event if a more specific resource already exists - i.e. [Immunization](#resource-Immunization)s, drug administrations ([MedicationAdministration](#resource-MedicationAdministration)) and [Communication](#resource-Communication)s. The boundary between determining whether an action is a Procedure (training or counseling) as opposed to a Communication is based on whether there's a specific intent to change the mind-set of the patient. Mere disclosure of information would be considered a Communication. A process that involves verification of the patient's comprehension or to change the patient's mental state would be a Procedure.

Note that many diagnostic processes are procedures that generate [Observation](#resource-Observation)s and [DiagnosticReport](#resource-DiagnosticReport)s. In many cases, such an observation does not require an explicit representation of the procedure used to create the observation, but where there are details of interest about how the diagnostic procedure was performed, the Procedure resource is used to describe the activity.

Some diagnostic procedures might not have a Procedure record. The Procedure record is only necessary when there is a need to capture information about the physical intervention that was performed to capture the diagnostic information (e.g. anesthetic, incision, scope size, etc.)

A [Task](#resource-Task) is a workflow step such as cancelling an order, fulfilling an order, signing an order, merging a set of records, admitting a patient. Procedures are actions that are intended to result in a physical or mental change to or for the subject (e.g. surgery, physiotherapy, training, counseling). A Task resource often exists in parallel with clinical resources. For example, a Task might request fulfillment of a [ServiceRequest](#resource-ServiceRequest) ordering a Procedure.

> **Exam angle**
>
> - Procedure is a workflow **Event**: something that *was done* (or is being done). The order for it is a **ServiceRequest** or a **CarePlan** activity, linked with `basedOn`.
> - Use a more specific resource when one exists: a vaccine is an **Immunization**, a dose of a drug is a **MedicationAdministration**.
> - **Procedure or Communication?** Counselling or training that aims to change the patient's understanding or mind-set is a Procedure. Just passing on information is a Communication.
> - **Procedure or Task?** A Task is a workflow step (fulfil, cancel, sign an order). A Procedure changes the patient physically or mentally.
> - A diagnostic test usually needs only an **Observation** / **DiagnosticReport**. Add a Procedure only when details of the intervention itself matter (anaesthetic, incision, scope size).
> - Only **`status`** (a modifier, required binding to EventStatus) and **`subject`** are required. A procedure that didn't happen is recorded with `status = not-done` and a `statusReason`.

## Referenced by

[AdverseEvent](#resource-AdverseEvent), [Appointment](#resource-Appointment), [ChargeItem](#resource-ChargeItem), [Claim](#resource-Claim), [DeviceUseStatement](#resource-DeviceUseStatement), [Encounter](#resource-Encounter), [ExplanationOfBenefit](#resource-ExplanationOfBenefit), [Flag](#resource-Flag), [ImagingStudy](#resource-ImagingStudy), [MedicationAdministration](#resource-MedicationAdministration), [MedicationDispense](#resource-MedicationDispense), [MedicationStatement](#resource-MedicationStatement), [Observation](#resource-Observation), [Procedure](#resource-Procedure) (itself, via `partOf` and `reasonReference`) and [QuestionnaireResponse](#resource-QuestionnaireResponse).

## Structure

<div class="structure-table">

| Name | Flags | Card. | Type | Description & Constraints |
|---|---|---|---|---|
| ![Resource](img/fhir/icon_resource.png) **[Procedure](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure)** | [TU](https://hl7.org/fhir/R4/versions.html#std-process) |  | [DomainResource](https://hl7.org/fhir/R4/domainresource.html) | An action that is being or was performed on a patient<br>Elements defined in Ancestors: [id](https://hl7.org/fhir/R4/resource.html#Resource), [meta](https://hl7.org/fhir/R4/resource.html#Resource), [implicitRules](https://hl7.org/fhir/R4/resource.html#Resource), [language](https://hl7.org/fhir/R4/resource.html#Resource), [text](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [contained](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [extension](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [modifierExtension](https://hl7.org/fhir/R4/domainresource.html#DomainResource) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [identifier](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.identifier) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [Identifier](https://hl7.org/fhir/R4/datatypes.html#Identifier) | External Identifiers for this procedure |
| &emsp;![Reference](img/fhir/icon_reference.png) [instantiatesCanonical](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.instantiatesCanonical) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [canonical](https://hl7.org/fhir/R4/datatypes.html#canonical)([PlanDefinition](https://hl7.org/fhir/R4/plandefinition.html) \| [ActivityDefinition](https://hl7.org/fhir/R4/activitydefinition.html) \| [Measure](https://hl7.org/fhir/R4/measure.html) \| [OperationDefinition](https://hl7.org/fhir/R4/operationdefinition.html) \| [Questionnaire](https://hl7.org/fhir/R4/questionnaire.html)) | Instantiates FHIR protocol or definition |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [instantiatesUri](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.instantiatesUri) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) | Instantiates external protocol or definition |
| &emsp;![Reference](img/fhir/icon_reference.png) [basedOn](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.basedOn) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([CarePlan](https://hl7.org/fhir/R4/careplan.html) \| [ServiceRequest](https://hl7.org/fhir/R4/servicerequest.html)) | A request for this procedure |
| &emsp;![Reference](img/fhir/icon_reference.png) [partOf](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.partOf) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Procedure](https://hl7.org/fhir/R4/procedure.html) \| [Observation](https://hl7.org/fhir/R4/observation.html) \| [MedicationAdministration](https://hl7.org/fhir/R4/medicationadministration.html)) | Part of referenced event |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [status](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.status) | [?!](https://hl7.org/fhir/R4/conformance-rules.html#isModifier) [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | preparation \| in-progress \| not-done \| on-hold \| stopped \| completed \| entered-in-error \| unknown<br>[EventStatus](https://hl7.org/fhir/R4/valueset-event-status.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [statusReason](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.statusReason) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Reason for current status<br>[Procedure Not Performed Reason (SNOMED-CT)](https://hl7.org/fhir/R4/valueset-procedure-not-performed-reason.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [category](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.category) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Classification of the procedure<br>[Procedure Category Codes (SNOMED CT)](https://hl7.org/fhir/R4/valueset-procedure-category.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [code](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.code) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Identification of the procedure<br>[Procedure Codes (SNOMED CT)](https://hl7.org/fhir/R4/valueset-procedure-code.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Reference](img/fhir/icon_reference.png) [subject](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.subject) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Patient](https://hl7.org/fhir/R4/patient.html) \| [Group](https://hl7.org/fhir/R4/group.html)) | Who the procedure was performed on |
| &emsp;![Reference](img/fhir/icon_reference.png) [encounter](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.encounter) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Encounter](https://hl7.org/fhir/R4/encounter.html)) | Encounter created as part of |
| &emsp;![Choice of types](img/fhir/icon_choice.gif) [performed[x]](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.performed_x_) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 |  | When the procedure was performed |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) performedDateTime |  |  | [dateTime](https://hl7.org/fhir/R4/datatypes.html#dateTime) |  |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) performedPeriod |  |  | [Period](https://hl7.org/fhir/R4/datatypes.html#Period) |  |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) performedString |  |  | [string](https://hl7.org/fhir/R4/datatypes.html#string) |  |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) performedAge |  |  | [Age](https://hl7.org/fhir/R4/datatypes.html#Age) |  |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) performedRange |  |  | [Range](https://hl7.org/fhir/R4/datatypes.html#Range) |  |
| &emsp;![Reference](img/fhir/icon_reference.png) [recorder](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.recorder) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Patient](https://hl7.org/fhir/R4/patient.html) \| [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html) \| [Practitioner](https://hl7.org/fhir/R4/practitioner.html) \| [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html)) | Who recorded the procedure |
| &emsp;![Reference](img/fhir/icon_reference.png) [asserter](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.asserter) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Patient](https://hl7.org/fhir/R4/patient.html) \| [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html) \| [Practitioner](https://hl7.org/fhir/R4/practitioner.html) \| [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html)) | Person who asserts this procedure |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [performer](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.performer) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | The people who performed the procedure |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [function](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.performer.function) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Type of performance<br>[Procedure Performer Role Codes](https://hl7.org/fhir/R4/valueset-performer-role.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [actor](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.performer.actor) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Practitioner](https://hl7.org/fhir/R4/practitioner.html) \| [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html) \| [Organization](https://hl7.org/fhir/R4/organization.html) \| [Patient](https://hl7.org/fhir/R4/patient.html) \| [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html) \| [Device](https://hl7.org/fhir/R4/device.html)) | The reference to the practitioner |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [onBehalfOf](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.performer.onBehalfOf) |  | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Organization](https://hl7.org/fhir/R4/organization.html)) | Organization the device or practitioner was acting for |
| &emsp;![Reference](img/fhir/icon_reference.png) [location](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.location) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Location](https://hl7.org/fhir/R4/location.html)) | Where the procedure happened |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [reasonCode](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.reasonCode) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Coded reason procedure performed<br>[Procedure Reason Codes](https://hl7.org/fhir/R4/valueset-procedure-reason.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Reference](img/fhir/icon_reference.png) [reasonReference](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.reasonReference) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Condition](https://hl7.org/fhir/R4/condition.html) \| [Observation](https://hl7.org/fhir/R4/observation.html) \| [Procedure](https://hl7.org/fhir/R4/procedure.html) \| [DiagnosticReport](https://hl7.org/fhir/R4/diagnosticreport.html) \| [DocumentReference](https://hl7.org/fhir/R4/documentreference.html)) | The justification that the procedure was performed |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [bodySite](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.bodySite) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Target body sites<br>[SNOMED CT Body Structures](https://hl7.org/fhir/R4/valueset-body-site.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [outcome](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.outcome) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | The result of procedure<br>[Procedure Outcome Codes (SNOMED CT)](https://hl7.org/fhir/R4/valueset-procedure-outcome.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Reference](img/fhir/icon_reference.png) [report](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.report) |  | 0..* | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([DiagnosticReport](https://hl7.org/fhir/R4/diagnosticreport.html) \| [DocumentReference](https://hl7.org/fhir/R4/documentreference.html) \| [Composition](https://hl7.org/fhir/R4/composition.html)) | Any report resulting from the procedure |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [complication](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.complication) |  | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Complication following the procedure<br>[Condition/Problem/Diagnosis Codes](https://hl7.org/fhir/R4/valueset-condition-code.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Reference](img/fhir/icon_reference.png) [complicationDetail](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.complicationDetail) |  | 0..* | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Condition](https://hl7.org/fhir/R4/condition.html)) | A condition that is a result of the procedure |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [followUp](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.followUp) |  | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Instructions for follow up<br>[Procedure Follow up Codes (SNOMED CT)](https://hl7.org/fhir/R4/valueset-procedure-followup.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [note](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.note) |  | 0..* | [Annotation](https://hl7.org/fhir/R4/datatypes.html#Annotation) | Additional information about the procedure |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [focalDevice](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.focalDevice) |  | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | Manipulated, implanted, or removed device |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [action](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.focalDevice.action) |  | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Kind of change to device<br>[Procedure Device Action Codes](https://hl7.org/fhir/R4/valueset-device-action.html) ([Preferred](https://hl7.org/fhir/R4/terminologies.html#preferred)) |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [manipulated](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.focalDevice.manipulated) |  | 1..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Device](https://hl7.org/fhir/R4/device.html)) | Device that was changed |
| &emsp;![Reference](img/fhir/icon_reference.png) [usedReference](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.usedReference) |  | 0..* | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Device](https://hl7.org/fhir/R4/device.html) \| [Medication](https://hl7.org/fhir/R4/medication.html) \| [Substance](https://hl7.org/fhir/R4/substance.html)) | Items used during procedure |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [usedCode](https://hl7.org/fhir/R4/procedure-definitions.html#Procedure.usedCode) |  | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Coded items used during the procedure<br>[FHIR Device Types](https://hl7.org/fhir/R4/valueset-device-kind.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |

</div>

Things to notice in this table:

- The standards status is **TU** (Trial Use, maturity level 3), unlike Patient, which is Normative.
- **Required elements:** `status` and `subject`, plus `performer.actor` and `focalDevice.manipulated` if you include those backbone elements.
- **One modifier:** `status` (?!). A Procedure with `status = entered-in-error` or `not-done` must not be read as a procedure that happened.
- **`performed[x]`** is a choice of five types: a single `dateTime`, a `Period`, free text (`string`), an `Age` or an age `Range`. Use the one that matches what you know, e.g. `performedAge` for "had tonsils out at age 7".
- **Two "why" elements:** `reasonCode` (a code) and `reasonReference` (a link to a Condition, Observation, other Procedure, DiagnosticReport or DocumentReference). The same code/reference pairing appears for `used` and `complication`.
- **Almost every binding is an example** (SNOMED CT value sets), so you may use any suitable codes. Only `status` is required, and `focalDevice.action` is preferred.
- **Devices:** `focalDevice` is the device the procedure is *about* (implanted, removed, changed). `usedReference` / `usedCode` are things *used* to do it (scalpel, endoscope, gauze).

### Terminology bindings

<div class="spec-table">

| Path | Definition | Type | Reference |
|---|---|---|---|
| Procedure.status | A code specifying the state of the procedure. | [Required](https://hl7.org/fhir/R4/terminologies.html#required) | [EventStatus](https://hl7.org/fhir/R4/valueset-event-status.html) |
| Procedure.statusReason | A code that identifies the reason a procedure was not performed. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [ProcedureNotPerformedReason(SNOMED-CT)](https://hl7.org/fhir/R4/valueset-procedure-not-performed-reason.html) |
| Procedure.category | A code that classifies a procedure for searching, sorting and display purposes. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [ProcedureCategoryCodes(SNOMEDCT)](https://hl7.org/fhir/R4/valueset-procedure-category.html) |
| Procedure.code | A code to identify a specific procedure . | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [ProcedureCodes(SNOMEDCT)](https://hl7.org/fhir/R4/valueset-procedure-code.html) |
| Procedure.performer.function | A code that identifies the role of a performer of the procedure. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [ProcedurePerformerRoleCodes](https://hl7.org/fhir/R4/valueset-performer-role.html) |
| Procedure.reasonCode | A code that identifies the reason a procedure is required. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [ProcedureReasonCodes](https://hl7.org/fhir/R4/valueset-procedure-reason.html) |
| Procedure.bodySite | Codes describing anatomical locations. May include laterality. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [SNOMEDCTBodyStructures](https://hl7.org/fhir/R4/valueset-body-site.html) |
| Procedure.outcome | An outcome of a procedure - whether it was resolved or otherwise. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [ProcedureOutcomeCodes(SNOMEDCT)](https://hl7.org/fhir/R4/valueset-procedure-outcome.html) |
| Procedure.complication | Codes describing complications that resulted from a procedure. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [Condition/Problem/DiagnosisCodes](https://hl7.org/fhir/R4/valueset-condition-code.html) |
| Procedure.followUp | Specific follow up required for a procedure e.g. removal of sutures. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [ProcedureFollowUpCodes(SNOMEDCT)](https://hl7.org/fhir/R4/valueset-procedure-followup.html) |
| Procedure.focalDevice.action | A kind of change that happened to the device during the procedure. | [Preferred](https://hl7.org/fhir/R4/terminologies.html#preferred) | [ProcedureDeviceActionCodes](https://hl7.org/fhir/R4/valueset-device-action.html) |
| Procedure.usedCode | Codes describing items used during a procedure. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [FHIRDeviceTypes](https://hl7.org/fhir/R4/valueset-device-kind.html) |

</div>

### Use of Procedure properties

Many of the elements of Procedure have inherent relationships and may be conveyed by the `Procedure.code` or in the text element of the `Procedure.code` property. I.e. you may be able to infer category, bodySite and even indication. Whether these other properties will be populated may vary by implementation.

Care should be taken to avoid nonsensical combinations/statements; e.g. "name=amputation, bodySite=heart".

### Use of Procedure.used

For devices, these are devices that are incidental to / or used to perform the procedure - scalpels, gauze, endoscopes, etc. Devices that are the focus of the procedure should appear in `Procedure.device` instead. *(In R4 that element is called `Procedure.focalDevice`.)*

## Search Parameters

Search parameters for this resource. The [common parameters](https://hl7.org/fhir/R4/search.html#all) also apply. See [Searching](https://hl7.org/fhir/R4/search.html) for more information about searching in REST, messaging, and services.

<div class="spec-table">

| Name | Type | Description | Expression | In Common |
|---|---|---|---|---|
| based-on | [reference](https://hl7.org/fhir/R4/search.html#reference) | A request for this procedure | Procedure.basedOn<br>([CarePlan](https://hl7.org/fhir/R4/careplan.html), [ServiceRequest](https://hl7.org/fhir/R4/servicerequest.html)) |   |
| category | [token](https://hl7.org/fhir/R4/search.html#token) | Classification of the procedure | Procedure.category |   |
| code | [token](https://hl7.org/fhir/R4/search.html#token) | A code to identify a procedure | Procedure.code | [13 Resources](https://hl7.org/fhir/R4/searchparameter-registry.html#clinical-code) |
| date | [date](https://hl7.org/fhir/R4/search.html#date) | When the procedure was performed | Procedure.performed | [17 Resources](https://hl7.org/fhir/R4/searchparameter-registry.html#clinical-date) |
| encounter | [reference](https://hl7.org/fhir/R4/search.html#reference) | Encounter created as part of | Procedure.encounter<br>([Encounter](https://hl7.org/fhir/R4/encounter.html)) | [12 Resources](https://hl7.org/fhir/R4/searchparameter-registry.html#clinical-encounter) |
| identifier | [token](https://hl7.org/fhir/R4/search.html#token) | A unique identifier for a procedure | Procedure.identifier | [30 Resources](https://hl7.org/fhir/R4/searchparameter-registry.html#clinical-identifier) |
| instantiates-canonical | [reference](https://hl7.org/fhir/R4/search.html#reference) | Instantiates FHIR protocol or definition | Procedure.instantiatesCanonical<br>([Questionnaire](https://hl7.org/fhir/R4/questionnaire.html), [Measure](https://hl7.org/fhir/R4/measure.html), [PlanDefinition](https://hl7.org/fhir/R4/plandefinition.html), [OperationDefinition](https://hl7.org/fhir/R4/operationdefinition.html), [ActivityDefinition](https://hl7.org/fhir/R4/activitydefinition.html)) |   |
| instantiates-uri | [uri](https://hl7.org/fhir/R4/search.html#uri) | Instantiates external protocol or definition | Procedure.instantiatesUri |   |
| location | [reference](https://hl7.org/fhir/R4/search.html#reference) | Where the procedure happened | Procedure.location<br>([Location](https://hl7.org/fhir/R4/location.html)) |   |
| part-of | [reference](https://hl7.org/fhir/R4/search.html#reference) | Part of referenced event | Procedure.partOf<br>([Observation](https://hl7.org/fhir/R4/observation.html), [Procedure](https://hl7.org/fhir/R4/procedure.html), [MedicationAdministration](https://hl7.org/fhir/R4/medicationadministration.html)) |   |
| patient | [reference](https://hl7.org/fhir/R4/search.html#reference) | Search by subject - a patient | Procedure.subject.where(resolve() is Patient)<br>([Patient](https://hl7.org/fhir/R4/patient.html)) | [33 Resources](https://hl7.org/fhir/R4/searchparameter-registry.html#clinical-patient) |
| performer | [reference](https://hl7.org/fhir/R4/search.html#reference) | The reference to the practitioner | Procedure.performer.actor<br>([Practitioner](https://hl7.org/fhir/R4/practitioner.html), [Organization](https://hl7.org/fhir/R4/organization.html), [Device](https://hl7.org/fhir/R4/device.html), [Patient](https://hl7.org/fhir/R4/patient.html), [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html), [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html)) |   |
| reason-code | [token](https://hl7.org/fhir/R4/search.html#token) | Coded reason procedure performed | Procedure.reasonCode |   |
| reason-reference | [reference](https://hl7.org/fhir/R4/search.html#reference) | The justification that the procedure was performed | Procedure.reasonReference<br>([Condition](https://hl7.org/fhir/R4/condition.html), [Observation](https://hl7.org/fhir/R4/observation.html), [Procedure](https://hl7.org/fhir/R4/procedure.html), [DiagnosticReport](https://hl7.org/fhir/R4/diagnosticreport.html), [DocumentReference](https://hl7.org/fhir/R4/documentreference.html)) |   |
| status | [token](https://hl7.org/fhir/R4/search.html#token) | preparation \| in-progress \| not-done \| on-hold \| stopped \| completed \| entered-in-error \| unknown | Procedure.status |   |
| subject | [reference](https://hl7.org/fhir/R4/search.html#reference) | Search by subject | Procedure.subject<br>([Group](https://hl7.org/fhir/R4/group.html), [Patient](https://hl7.org/fhir/R4/patient.html)) |   |

</div>

Example searches:

```
GET [base]/Procedure?patient=123&date=ge2024-01-01
GET [base]/Procedure?code=http://snomed.info/sct|80146002&status=completed
GET [base]/Procedure?based-on=ServiceRequest/456
```

The second search finds completed appendectomies (SNOMED CT `80146002`).

For a step-by-step guide to reading the structure table, see [How to read a resource definition](#core-reading-resource).
