## Commonly confused resources

| Scenario | Resource |
|---|---|
| Problem, diagnosis, health concern | `Condition` |
| Allergy or intolerance | `AllergyIntolerance` |
| Lab result, vital sign, social history, survey answer as data | `Observation` |
| A report grouping results with a conclusion (lab panel, imaging report) | `DiagnosticReport` |
| An order for a lab test, imaging, referral | `ServiceRequest` |
| A prescription / medication order | `MedicationRequest` |
| Pharmacy hands out the medication | `MedicationDispense` |
| Nurse gives the medication | `MedicationAdministration` |
| Patient says what they take | `MedicationStatement` |
| A visit, admission or telehealth contact | `Encounter` |
| Care over a period for a condition (pregnancy, cancer treatment) | `EpisodeOfCare` |
| Surgery or other procedure performed | `Procedure` |
| Vaccine given | `Immunization` |
| Booking | `Appointment` (+ `Slot`, `Schedule`) |
| A person's role at an organisation (specialty, location, hours) | `PractitionerRole` |
| The person themself | `Practitioner` |
| A family member's history | `FamilyMemberHistory` |
| Clinical document metadata / attachments | `DocumentReference` |
| Forms | `Questionnaire` (the form) and `QuestionnaireResponse` (the answers) |
| Care plan | `CarePlan` (and `CareTeam`, `Goal`) |

## Workflow resources

FHIR's [workflow](https://hl7.org/fhir/R4/workflow.html) groups resources into three patterns:

- **Request:** something is asked for. `ServiceRequest`, `MedicationRequest`, `DeviceRequest`, `NutritionOrder`, `CommunicationRequest`, `Appointment`.
- **Event:** something happened. `Procedure`, `Observation`, `MedicationAdministration`, `Encounter`, `Communication`, `Immunization`.
- **Definition:** a reusable template. `ActivityDefinition`, `PlanDefinition`, `Questionnaire`.

**`Task`** tracks the *fulfilment* of a request: who is working on it and what state it is in (`requested`, `accepted`, `in-progress`, `completed`, …). Use `Task` when you need to manage the work, not just record the order.

Events point back to the request with `basedOn`. Requests can be grouped with `requisition` / `groupIdentifier`.

## Provenance

Use `Provenance` to record **where a resource came from and who is responsible for it**: the author, the source system, when it was created or changed, the activity (create, update, transform), and optional signature. It references what it is about with `Provenance.target`.

- Use it for data that was imported, transformed, or aggregated from another system, or to prove authorship.
- Use `AuditEvent`, not Provenance, to log **who accessed** data.
- Find it with `_revinclude=Provenance:target`.
