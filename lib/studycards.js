// Scenario flashcards: "which resource would you use?". Each card names the
// resource that fits, and a note on why (often how it differs from a
// look-alike resource). Definition cards for all 146 resources are built in
// the browser from lib/resources.js.

export const SCENARIO_CARDS = [
  // Individuals
  { resource: 'Patient', scenario: 'Store a person’s name, date of birth, gender and address so they can be registered for care.', note: 'Patient is the “who”: demographics and administrative details, not clinical data.' },
  { resource: 'Practitioner', scenario: 'Record a doctor’s name, qualifications and licence number, regardless of where they work.', note: 'Practitioner is the person. Where and as what they work is PractitionerRole.' },
  { resource: 'PractitionerRole', scenario: 'Dr Smith works as a cardiologist at City Hospital on Mondays and Wednesdays.', note: 'A role links a Practitioner to an Organization, with specialty, location and availability.' },
  { resource: 'RelatedPerson', scenario: 'The patient’s daughter brings her to appointments and is involved in her care decisions.', note: 'RelatedPerson takes part in care in their own right. Patient.contact only holds contact details.' },
  { resource: 'Person', scenario: 'Link the Patient record and the Practitioner record of a nurse who is also being treated at her own hospital.', note: 'Person ties together records of the same human across roles and systems.' },
  { resource: 'Group', scenario: 'All patients enrolled in a diabetes management programme, used as the subject of a bulk export.', note: 'A Group is a set of people (or things) that are acted on together, but not an organisation.' },
  // Entities
  { resource: 'Organization', scenario: 'A hospital, a GP practice, an insurer or a hospital department.', note: 'Any formally or informally recognised group of people or organisations.' },
  { resource: 'Location', scenario: 'Ward 3B, bed 12, or the street address of a clinic building.', note: 'Location is a physical place. The organisation that runs it is an Organization.' },
  { resource: 'HealthcareService', scenario: 'The physiotherapy service a clinic offers, with opening hours and how to get referred.', note: 'Describes a service available, not a service that was performed.' },
  { resource: 'Endpoint', scenario: 'The base URL and connection details of another organisation’s FHIR server.', note: 'Technical details for reaching a system electronically.' },
  { resource: 'Device', scenario: 'A specific insulin pump with its serial number, assigned to a patient.', note: 'Device is the actual item. DeviceRequest orders one; DeviceUseStatement records its use.' },
  { resource: 'Substance', scenario: 'A container of latex or a batch of a chemical used in a procedure.', note: 'A material with a definite composition, often used in allergy and supply records.' },
  // Workflow & management
  { resource: 'Encounter', scenario: 'A patient’s visit to the emergency department this morning.', note: 'An interaction between patient and provider: a visit, admission or telehealth call.' },
  { resource: 'EpisodeOfCare', scenario: 'All the care a woman receives during her pregnancy, across many visits.', note: 'Groups encounters over a period of responsibility for a condition. One episode, many encounters.' },
  { resource: 'Appointment', scenario: 'Book the patient in with Dr Lee on Thursday at 10:00.', note: 'A planned meeting. When it happens, the actual visit is an Encounter.' },
  { resource: 'Slot', scenario: 'Show the free 15-minute periods in a clinic’s calendar that patients can book.', note: 'Slots belong to a Schedule; an Appointment fills a Slot.' },
  { resource: 'Task', scenario: 'Track that the lab has accepted a test order and is currently working on it.', note: 'Task tracks the fulfilment of a request: who is doing it and its status.' },
  { resource: 'Flag', scenario: 'Show a warning banner on the patient’s record: “Risk of violence: do not visit alone”.', note: 'A prospective alert for anyone looking at the record.' },
  { resource: 'List', scenario: 'The patient’s current medication list, curated by their GP.', note: 'A curated collection of references to other resources.' },
  // Clinical summary
  { resource: 'Condition', scenario: 'The patient has been diagnosed with type 2 diabetes.', note: 'Problems, diagnoses and health concerns. Allergies are separate.' },
  { resource: 'AllergyIntolerance', scenario: 'The patient is allergic to penicillin and gets a rash.', note: 'Not Condition. Use verificationStatus to say if it is confirmed or refuted.' },
  { resource: 'Procedure', scenario: 'An appendectomy was performed last week.', note: 'Something done to the patient. The order for it was a ServiceRequest.' },
  { resource: 'FamilyMemberHistory', scenario: 'The patient’s father had a heart attack at age 50.', note: 'Health information about a relative, recorded on the patient’s record.' },
  { resource: 'AdverseEvent', scenario: 'A patient fell on the ward and broke their wrist.', note: 'An event that caused (or could have caused) harm during care or research.' },
  { resource: 'DetectedIssue', scenario: 'A drug–drug interaction is found when checking a new prescription.', note: 'An issue found by a clinical check, e.g. interactions or duplicate therapy.' },
  { resource: 'ClinicalImpression', scenario: 'A clinician’s assessment of a patient’s chest pain, with their reasoning and differential diagnoses.', note: 'The thinking behind a diagnosis. The diagnosis itself is a Condition.' },
  // Diagnostics
  { resource: 'Observation', scenario: 'A blood pressure reading of 120/80 mmHg.', note: 'One Observation with two components (systolic and diastolic), using the vital signs profile.' },
  { resource: 'Observation', scenario: 'The patient smokes 10 cigarettes a day.', note: 'Social history is recorded as an Observation, not a Condition.' },
  { resource: 'DiagnosticReport', scenario: 'A full blood count report with its results and the lab’s overall conclusion.', note: 'The report groups the result Observations and adds interpretation.' },
  { resource: 'Specimen', scenario: 'The blood sample taken from the patient for testing.', note: 'The sample itself, with collection details.' },
  { resource: 'ImagingStudy', scenario: 'The set of DICOM images from a chest CT scan.', note: 'The images and series. The radiologist’s report is a DiagnosticReport.' },
  { resource: 'Media', scenario: 'A photo of a skin wound taken during a consultation.', note: 'Photos, video and audio captured during care (R4; replaced by DocumentReference in R5).' },
  { resource: 'Questionnaire', scenario: 'The PHQ-9 depression screening form, with its questions and answer options.', note: 'The form definition. Answers go in QuestionnaireResponse.' },
  { resource: 'QuestionnaireResponse', scenario: 'A patient’s completed answers to the PHQ-9 form.', note: 'The filled-in form, pointing back to its Questionnaire.' },
  // Medications
  { resource: 'MedicationRequest', scenario: 'A prescription for amoxicillin 500 mg three times a day for 7 days.', note: 'The order. Handing it out is MedicationDispense; giving a dose is MedicationAdministration.' },
  { resource: 'MedicationDispense', scenario: 'The pharmacy hands the patient 21 amoxicillin capsules.', note: 'Supplying the medication, usually against a MedicationRequest.' },
  { resource: 'MedicationAdministration', scenario: 'A nurse gives the patient a dose of morphine on the ward.', note: 'The actual giving of a dose to the patient.' },
  { resource: 'MedicationStatement', scenario: 'The patient says they take ibuprofen when they have a headache.', note: 'What the patient is (or was) taking, from any source, including their own report.' },
  { resource: 'Medication', scenario: 'Describe a drug product: its code, form (tablet) and ingredients.', note: 'Medication describes the drug; other resources reference it.' },
  { resource: 'Immunization', scenario: 'A flu vaccine was given to the patient today.', note: 'Vaccines have their own resource, not MedicationAdministration.' },
  { resource: 'ImmunizationRecommendation', scenario: 'The patient is due for a tetanus booster next month.', note: 'Which vaccines are recommended, and when.' },
  // Care provision & requests
  { resource: 'ServiceRequest', scenario: 'An order for a chest X-ray, or a referral to a cardiologist.', note: 'Orders for tests, procedures and referrals. Medications use MedicationRequest.' },
  { resource: 'CarePlan', scenario: 'The plan for managing a patient’s heart failure, with planned activities and goals.', note: 'How care will be delivered for a condition over time.' },
  { resource: 'Goal', scenario: 'Get the patient’s HbA1c below 7% within six months.', note: 'An intended health outcome, often part of a CarePlan.' },
  { resource: 'CareTeam', scenario: 'The GP, practice nurse and dietitian who together look after a patient’s diabetes.', note: 'Everyone who takes part in a patient’s care.' },
  { resource: 'NutritionOrder', scenario: 'Order a diabetic diet for an inpatient.', note: 'Diet, supplement and feeding orders.' },
  { resource: 'RiskAssessment', scenario: 'The patient’s 10-year risk of cardiovascular disease is 15%.', note: 'A predicted outcome and its probability.' },
  { resource: 'Communication', scenario: 'A message sent from the GP to the patient with their test results.', note: 'A record of information that was shared. A request to send it is CommunicationRequest.' },
  { resource: 'DeviceUseStatement', scenario: 'The patient reports using a CPAP machine every night.', note: 'A statement that a device is or was used by the patient.' },
  // Security & documents
  { resource: 'Consent', scenario: 'The patient agrees to share their records with a research study.', note: 'Privacy, treatment and research consents.' },
  { resource: 'Provenance', scenario: 'Record which system and which person created a lab result, and when it was imported.', note: 'Where data came from and who is responsible. Access logs are AuditEvent.' },
  { resource: 'AuditEvent', scenario: 'Log that a user viewed a patient’s record at 14:32 from a ward PC.', note: 'A security log of activity. See the Basic Audit Log Patterns IG.' },
  { resource: 'DocumentReference', scenario: 'A scanned discharge letter (PDF), stored with its type, date and author so it can be found.', note: 'Metadata about any document, pointing to the content.' },
  { resource: 'Composition', scenario: 'The sections and narrative of a discharge summary, as the first entry in a document Bundle.', note: 'Structures a FHIR document. Bundle.type = document, Composition first.' },
  // Infrastructure
  { resource: 'Bundle', scenario: 'Send a patient, an encounter and three observations in one request that must all succeed or all fail.', note: 'A Bundle of type transaction. Search results are a Bundle of type searchset.' },
  { resource: 'OperationOutcome', scenario: 'The server explains why a create request failed validation.', note: 'Errors, warnings and information returned by the server.' },
  { resource: 'CapabilityStatement', scenario: 'Find out which resources and interactions a FHIR server supports.', note: 'Returned by GET [base]/metadata.' },
  { resource: 'Binary', scenario: 'Store the raw bytes of a PDF or an image.', note: 'Content in its native format, with a content type.' },
  { resource: 'Parameters', scenario: 'The inputs sent to the $validate operation.', note: 'Used only for operation inputs and outputs; it has no REST endpoint.' },
  { resource: 'Subscription', scenario: 'Notify an app whenever a new lab result is created for a patient.', note: 'Push notifications based on search criteria (R4), sent over a channel such as rest-hook.' },
  { resource: 'MessageHeader', scenario: 'The first entry of a FHIR message, saying which event it is and who it is for.', note: 'Bundle.type = message, MessageHeader first.' },
  // Conformance & terminology
  { resource: 'StructureDefinition', scenario: 'A profile that requires Observation.category to be vital-signs for blood pressure readings.', note: 'Profiles, extensions, resources and data types are all StructureDefinitions.' },
  { resource: 'ValueSet', scenario: 'The list of codes allowed in Patient.maritalStatus.', note: 'Selects codes for a use. Elements are bound to value sets.' },
  { resource: 'CodeSystem', scenario: 'Define a set of codes and what each one means.', note: 'Defines codes. A ValueSet selects from code systems.' },
  { resource: 'ConceptMap', scenario: 'Map a hospital’s local lab codes to LOINC.', note: 'Mappings between codes; used by $translate.' },
  { resource: 'ImplementationGuide', scenario: 'Package all the profiles, extensions and value sets for a national standard.', note: 'Gathers the parts of an IG into one computable definition.' },
  { resource: 'SearchParameter', scenario: 'Define a custom search on an extension, e.g. search patients by birth place.', note: 'Named search with a type and a FHIRPath expression.' },
  // Financial
  { resource: 'Coverage', scenario: 'Record the patient’s health insurance policy and member number.', note: 'Who pays: the insurance cover itself.' },
  { resource: 'Claim', scenario: 'Ask an insurer to pay for a hospital stay.', note: 'The request for payment. The reply is ClaimResponse.' },
  { resource: 'ExplanationOfBenefit', scenario: 'Show the patient what their insurer paid and what they still owe.', note: 'Claim details and adjudication, typically shared with patients.' },
  { resource: 'CoverageEligibilityRequest', scenario: 'Before surgery, check whether the patient’s insurance covers it.', note: 'Asks about eligibility; the answer is CoverageEligibilityResponse.' },
  // Specialized
  { resource: 'ResearchStudy', scenario: 'A clinical trial of a new asthma drug, with its phase and sites.', note: 'The study. Each enrolled patient is a ResearchSubject.' },
  { resource: 'PlanDefinition', scenario: 'A reusable sepsis protocol listing the actions to take and when.', note: 'A definition (template) of a plan, applied to a patient to create a CarePlan or RequestGroup.' },
  { resource: 'Measure', scenario: 'Define a quality measure: the percentage of diabetic patients with an annual eye exam.', note: 'The measure definition. Calculated results go in MeasureReport.' },
];
