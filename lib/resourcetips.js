// Extra detail for study-card answers, per resource.
// keys: the elements you'd use most, as [element, hint]. A trailing * on the
//       element name means it is required (minimum cardinality 1) in R4.
// vs:   look-alike resources, as [resource, how it differs].

export const RESOURCE_TIPS = {
  Patient: {
    keys: [['identifier', 'business ids such as an MRN'], ['name', 'HumanName'], ['gender', 'code, required binding'], ['birthDate', 'date'], ['telecom / address', 'contact details'], ['active', 'modifier: is the record in use?'], ['link', 'joins merged or duplicate records']],
    vs: [['Practitioner', 'staff who provide care'], ['RelatedPerson', 'family or carers involved in care'], ['Person', 'links the same human across Patient, Practitioner and RelatedPerson records']],
  },
  Practitioner: {
    keys: [['identifier', 'licence or national provider number'], ['name', 'HumanName'], ['qualification', 'degrees and certifications'], ['telecom', 'work contact details'], ['active', 'still practising?']],
    vs: [['PractitionerRole', 'what they do, where, and for which organisation'], ['Patient', 'the person receiving care']],
  },
  PractitionerRole: {
    keys: [['practitioner', 'who'], ['organization', 'for which organisation'], ['code', 'the role, e.g. doctor, nurse'], ['specialty', 'e.g. cardiology'], ['location / healthcareService', 'where and which service'], ['availableTime', 'days and hours']],
    vs: [['Practitioner', 'the person, independent of any role'], ['CareTeam', 'everyone caring for one patient']],
  },
  RelatedPerson: {
    keys: [['patient*', 'whose relative or carer'], ['relationship', 'e.g. mother, guardian'], ['name / telecom', 'who they are and how to reach them'], ['period', 'when the relationship applies']],
    vs: [['Patient', 'the person receiving care (Patient.contact only stores contact details)'], ['Practitioner', 'professional caregivers']],
  },
  Person: {
    keys: [['name / identifier', 'who the human is'], ['link.target', 'the Patient, Practitioner or RelatedPerson records for this person'], ['link.assurance', 'how sure the link is']],
    vs: [['Patient', 'one record in one care context'], ['Linkage', 'links any resource instances that describe the same thing']],
  },
  Group: {
    keys: [['type*', 'person, animal, device, medication…'], ['actual*', 'true = a real list of members; false = a definition'], ['member.entity', 'who is in the group'], ['characteristic', 'rules for membership'], ['quantity', 'how many']],
    vs: [['Organization', 'a formally recognised body that acts together'], ['CareTeam', 'people who provide care'], ['List', 'any curated list of resources']],
  },
  Organization: {
    keys: [['identifier / name', 'one of these is required by rule org-1'], ['type', 'e.g. hospital, insurer, department'], ['partOf', 'parent organisation'], ['address / telecom', 'contact details'], ['active', 'still in use?']],
    vs: [['Location', 'a physical place'], ['HealthcareService', 'a service the organisation offers']],
  },
  Location: {
    keys: [['name', 'e.g. Ward 3B'], ['mode', 'instance (a specific place) or kind (a type of place)'], ['physicalType', 'building, ward, room, bed…'], ['address / position', 'street address or GPS'], ['managingOrganization', 'who runs it'], ['partOf', 'the larger location it belongs to']],
    vs: [['Organization', 'who runs the place'], ['HealthcareService', 'what is offered there']],
  },
  HealthcareService: {
    keys: [['providedBy', 'the Organization'], ['type / specialty', 'what kind of service'], ['location', 'where'], ['availableTime', 'opening hours'], ['referralMethod', 'how to be referred'], ['appointmentRequired', 'true or false']],
    vs: [['Organization', 'who provides it'], ['PractitionerRole', 'one practitioner’s role'], ['Location', 'the place']],
  },
  Endpoint: {
    keys: [['status*', 'active, off…'], ['connectionType*', 'e.g. hl7-fhir-rest'], ['payloadType*', 'what can be sent'], ['address*', 'the URL'], ['managingOrganization', 'who runs it']],
    vs: [['CapabilityStatement', 'what the server at that address can do'], ['Location', 'a physical place']],
  },
  Device: {
    keys: [['identifier / serialNumber', 'which actual device'], ['udiCarrier', 'Unique Device Identifier barcode'], ['type', 'what kind of device'], ['manufacturer', 'maker'], ['patient', 'who it is assigned to'], ['status', 'active, inactive…']],
    vs: [['DeviceRequest', 'an order for a device'], ['DeviceUseStatement', 'a record that the patient uses it'], ['DeviceDefinition', 'a kind of device, not a specific one']],
  },
  Substance: {
    keys: [['code*', 'what the substance is'], ['category', 'e.g. allergen, chemical'], ['instance', 'a specific batch: quantity, expiry'], ['ingredient', 'what it is made of']],
    vs: [['Medication', 'a drug product'], ['Device', 'a manufactured item']],
  },
  Encounter: {
    keys: [['status*', 'modifier: planned, arrived, in-progress, finished…'], ['class*', 'AMB (outpatient), EMER, IMP (inpatient), VR (virtual)…'], ['subject', 'the patient'], ['participant', 'who took part'], ['period', 'start and end'], ['reasonCode / diagnosis', 'why, and diagnoses'], ['location / serviceProvider', 'where and which organisation'], ['episodeOfCare', 'the episode it belongs to']],
    vs: [['EpisodeOfCare', 'many encounters for one condition over time'], ['Appointment', 'the planned booking before the visit']],
  },
  EpisodeOfCare: {
    keys: [['status*', 'planned, active, finished…'], ['patient*', 'who'], ['managingOrganization', 'who is responsible'], ['period', 'start and end'], ['diagnosis', 'the condition(s) it is for'], ['careManager / team', 'who coordinates']],
    vs: [['Encounter', 'a single visit'], ['CarePlan', 'what is planned, not the period of responsibility']],
  },
  Appointment: {
    keys: [['status*', 'proposed, booked, cancelled, fulfilled…'], ['participant*', 'patient, practitioner, location, each with a status'], ['start / end', 'when'], ['serviceType', 'what it is for'], ['slot', 'the Slot it fills'], ['basedOn', 'the ServiceRequest it fulfils']],
    vs: [['Encounter', 'what actually happens'], ['Slot', 'free time that can be booked'], ['AppointmentResponse', 'a participant accepting or declining']],
  },
  Slot: {
    keys: [['schedule*', 'the Schedule it belongs to'], ['status*', 'free, busy, busy-unavailable, busy-tentative…'], ['start* / end*', 'the time period'], ['serviceType', 'what can be booked']],
    vs: [['Schedule', 'the container for a resource’s slots'], ['Appointment', 'the booking that fills a slot']],
  },
  Task: {
    keys: [['status*', 'requested, accepted, in-progress, completed…'], ['intent*', 'order, plan, proposal…'], ['code', 'what kind of task'], ['focus', 'the resource the task acts on, e.g. a ServiceRequest'], ['for', 'the patient who benefits'], ['owner / requester', 'who does it and who asked'], ['businessStatus', 'detailed progress, e.g. "specimen received"']],
    vs: [['ServiceRequest', 'the order itself'], ['Procedure', 'the clinical action that was done']],
  },
  Flag: {
    keys: [['status*', 'active, inactive, entered-in-error'], ['code*', 'what the warning is'], ['subject*', 'who or what it is about'], ['period', 'when it applies'], ['category', 'e.g. safety, behavioural']],
    vs: [['AllergyIntolerance', 'the allergy itself (a Flag may point it out)'], ['DetectedIssue', 'a problem found by a clinical check']],
  },
  List: {
    keys: [['status*', 'current, retired, entered-in-error'], ['mode*', 'working, snapshot or changes'], ['code', 'what kind of list'], ['subject', 'who it is about'], ['entry.item', 'the resources on the list'], ['emptyReason', 'why the list is empty']],
    vs: [['Group', 'a set of people or things'], ['Bundle', 'resources sent together'], ['Composition', 'a structured document']],
  },
  Condition: {
    keys: [['clinicalStatus', 'modifier: active, resolved…'], ['verificationStatus', 'modifier: confirmed, refuted, entered-in-error…'], ['category', 'problem-list-item or encounter-diagnosis'], ['code', 'usually SNOMED CT or ICD-10'], ['subject*', 'the patient'], ['onset[x] / abatement[x]', 'when it started and ended'], ['severity', 'mild, moderate, severe']],
    vs: [['AllergyIntolerance', 'allergies have their own resource'], ['Observation', 'measurements, findings and social history'], ['ClinicalImpression', 'the reasoning behind a diagnosis']],
  },
  AllergyIntolerance: {
    keys: [['clinicalStatus', 'modifier: active, inactive, resolved'], ['verificationStatus', 'modifier: unconfirmed, confirmed, refuted…'], ['type', 'allergy or intolerance'], ['category', 'food, medication, environment, biologic'], ['criticality', 'low, high, unable-to-assess'], ['code', 'the substance'], ['patient*', 'who'], ['reaction', 'manifestation and severity']],
    vs: [['Condition', 'other problems and diagnoses'], ['AdverseEvent', 'a harmful event that happened'], ['Flag', 'a warning banner']],
  },
  Procedure: {
    keys: [['status*', 'modifier: preparation, in-progress, not-done, completed…'], ['code', 'what was done (SNOMED CT)'], ['subject*', 'the patient'], ['performed[x]', 'dateTime, Period, string, Age or Range'], ['performer.actor', 'who did it'], ['basedOn', 'the ServiceRequest or CarePlan'], ['reasonCode / reasonReference', 'why'], ['bodySite / outcome', 'where and the result']],
    vs: [['ServiceRequest', 'the order for the procedure'], ['Immunization / MedicationAdministration', 'more specific events'], ['Communication', 'information shared without intent to change the patient'], ['Task', 'a workflow step']],
  },
  FamilyMemberHistory: {
    keys: [['status*', 'partial, completed…'], ['patient*', 'whose family'], ['relationship*', 'e.g. father'], ['sex', 'of the relative'], ['condition', 'code, onset and outcome'], ['deceased[x]', 'whether and when they died']],
    vs: [['Condition', 'the patient’s own conditions'], ['RelatedPerson', 'a relative involved in care']],
  },
  AdverseEvent: {
    keys: [['actuality*', 'actual or potential (near miss)'], ['event', 'what happened'], ['subject*', 'who'], ['date', 'when'], ['seriousness / outcome', 'how bad and the result'], ['suspectEntity', 'what may have caused it']],
    vs: [['AllergyIntolerance', 'a known allergy, a risk for the future'], ['DetectedIssue', 'a potential problem found by a check']],
  },
  DetectedIssue: {
    keys: [['status*', 'registered, final…'], ['code', 'kind of issue, e.g. drug interaction'], ['severity', 'high, moderate, low'], ['patient', 'who'], ['implicated', 'the resources involved'], ['mitigation', 'what was done about it']],
    vs: [['AdverseEvent', 'harm that actually happened'], ['Flag', 'a standing warning on the record']],
  },
  ClinicalImpression: {
    keys: [['status*', 'in-progress, completed…'], ['subject*', 'the patient'], ['assessor', 'who assessed'], ['problem', 'what was assessed'], ['finding', 'conclusions'], ['summary / prognosis', 'the overall assessment']],
    vs: [['Condition', 'the resulting diagnosis'], ['Observation', 'individual findings and measurements']],
  },
  Observation: {
    keys: [['status*', 'modifier: registered, preliminary, final, amended…'], ['category', 'vital-signs, laboratory, social-history…'], ['code*', 'what was measured, usually LOINC'], ['subject', 'the patient'], ['effective[x]', 'when it applies clinically'], ['value[x]', 'the result: Quantity, CodeableConcept, string…'], ['component', 'parts of one observation, e.g. systolic and diastolic'], ['interpretation / referenceRange', 'high, low, normal range']],
    vs: [['DiagnosticReport', 'a report that groups results'], ['Condition', 'a diagnosis'], ['QuestionnaireResponse', 'answers to a form']],
  },
  DiagnosticReport: {
    keys: [['status*', 'registered, partial, final…'], ['code*', 'the report type, e.g. a LOINC panel'], ['subject', 'the patient'], ['effective[x] / issued', 'when it applies and when it was released'], ['result', 'the Observations'], ['conclusion / conclusionCode', 'the interpretation'], ['presentedForm', 'a PDF of the report'], ['basedOn', 'the ServiceRequest']],
    vs: [['Observation', 'each individual result'], ['DocumentReference', 'a document not structured as a report']],
  },
  Specimen: {
    keys: [['type', 'blood, urine, tissue…'], ['subject', 'whose specimen'], ['collection', 'who, when and from which body site'], ['container', 'tube or container details'], ['receivedTime', 'when the lab got it'], ['request', 'the ServiceRequest']],
    vs: [['BodyStructure', 'a part of the body'], ['Substance', 'a material that is not a patient sample']],
  },
  ImagingStudy: {
    keys: [['status*', 'registered, available…'], ['subject*', 'the patient'], ['started', 'when'], ['modality', 'CT, MR, US…'], ['series', 'the series and their instances (DICOM uids)'], ['endpoint', 'where to retrieve the images']],
    vs: [['DiagnosticReport', 'the radiologist’s report'], ['Media', 'a single photo or video']],
  },
  Media: {
    keys: [['status*', 'completed…'], ['type / modality', 'photo, video, audio'], ['subject', 'who or what'], ['created[x]', 'when'], ['content*', 'the Attachment'], ['bodySite', 'where on the body']],
    vs: [['ImagingStudy', 'DICOM imaging'], ['DocumentReference', 'documents (and in R5, media too)'], ['Binary', 'raw content only']],
  },
  Questionnaire: {
    keys: [['url', 'canonical URL that responses point to'], ['status*', 'draft, active, retired'], ['item', 'questions: linkId*, text, type*, answerOption, nested items']],
    vs: [['QuestionnaireResponse', 'the completed answers']],
  },
  QuestionnaireResponse: {
    keys: [['questionnaire', 'canonical URL of the form'], ['status*', 'in-progress, completed, amended…'], ['subject', 'who it is about'], ['authored / author', 'when and who'], ['item', 'answers, matched by linkId']],
    vs: [['Questionnaire', 'the form definition'], ['Observation', 'individual data points extracted from answers']],
  },
  MedicationRequest: {
    keys: [['status*', 'modifier: active, completed, cancelled…'], ['intent*', 'modifier: proposal, plan, order…'], ['medication[x]*', 'CodeableConcept or Reference(Medication)'], ['subject*', 'the patient'], ['authoredOn / requester', 'when and who prescribed'], ['dosageInstruction', 'Dosage: dose, frequency, route'], ['dispenseRequest', 'quantity, refills, supply duration'], ['reasonCode', 'why']],
    vs: [['MedicationDispense', 'the pharmacy hand-out'], ['MedicationAdministration', 'giving a dose'], ['MedicationStatement', 'what the patient says they take']],
  },
  MedicationDispense: {
    keys: [['status*', 'preparation, in-progress, completed…'], ['medication[x]*', 'what was dispensed'], ['subject', 'the patient'], ['performer', 'the pharmacist'], ['authorizingPrescription', 'the MedicationRequest'], ['quantity / daysSupply', 'how much'], ['whenHandedOver', 'when']],
    vs: [['MedicationRequest', 'the prescription'], ['MedicationAdministration', 'giving a dose']],
  },
  MedicationAdministration: {
    keys: [['status*', 'in-progress, completed, not-done…'], ['medication[x]*', 'what was given'], ['subject*', 'the patient'], ['effective[x]*', 'when'], ['performer', 'who gave it'], ['request', 'the MedicationRequest'], ['dosage', 'dose, route, rate, site']],
    vs: [['MedicationDispense', 'supplying the medicine'], ['MedicationStatement', 'a report of medication use'], ['Immunization', 'vaccines']],
  },
  MedicationStatement: {
    keys: [['status*', 'modifier: active, completed, not-taken…'], ['medication[x]*', 'what'], ['subject*', 'the patient'], ['effective[x]', 'when it was taken'], ['dateAsserted / informationSource', 'when and who reported it'], ['dosage', 'how it is taken']],
    vs: [['MedicationRequest', 'an order'], ['MedicationAdministration', 'a dose actually given by staff']],
  },
  Medication: {
    keys: [['code', 'the drug, e.g. RxNorm or SNOMED CT'], ['form', 'tablet, liquid…'], ['ingredient', 'item[x] and strength'], ['batch', 'lot number and expiry'], ['manufacturer', 'maker']],
    vs: [['MedicationKnowledge', 'reference information about a drug'], ['MedicationRequest', 'an order that uses a Medication']],
  },
  Immunization: {
    keys: [['status*', 'modifier: completed, entered-in-error, not-done'], ['vaccineCode*', 'the vaccine, e.g. CVX'], ['patient*', 'who'], ['occurrence[x]*', 'when'], ['lotNumber', 'batch'], ['site / route / doseQuantity', 'how it was given'], ['performer', 'who gave it'], ['protocolApplied', 'dose number in the series']],
    vs: [['MedicationAdministration', 'other medications'], ['ImmunizationRecommendation', 'what is due next']],
  },
  ImmunizationRecommendation: {
    keys: [['patient*', 'who'], ['date*', 'when the recommendation was made'], ['recommendation.vaccineCode / targetDisease', 'what'], ['recommendation.forecastStatus*', 'due, overdue, complete…'], ['recommendation.dateCriterion', 'due dates']],
    vs: [['Immunization', 'a vaccine that was given'], ['ImmunizationEvaluation', 'whether a past dose counts']],
  },
  ServiceRequest: {
    keys: [['status*', 'modifier: draft, active, completed…'], ['intent*', 'modifier: proposal, plan, order…'], ['code', 'what is requested, e.g. a lab test'], ['subject*', 'the patient'], ['requester / performer', 'who asks and who should do it'], ['occurrence[x]', 'when'], ['priority', 'routine, urgent, stat…'], ['reasonCode', 'why']],
    vs: [['MedicationRequest', 'medication orders'], ['Procedure', 'what was actually done'], ['Task', 'tracking the work on the order']],
  },
  CarePlan: {
    keys: [['status*', 'modifier: draft, active, completed…'], ['intent*', 'modifier: proposal, plan, order…'], ['subject*', 'the patient'], ['period', 'when'], ['addresses', 'the Conditions it manages'], ['goal', 'the Goals'], ['activity', 'planned actions'], ['careTeam', 'who is involved']],
    vs: [['PlanDefinition', 'a reusable template, not for one patient'], ['Goal', 'one target outcome'], ['RequestGroup', 'a set of related requests']],
  },
  Goal: {
    keys: [['lifecycleStatus*', 'modifier: proposed, active, completed…'], ['achievementStatus', 'in-progress, achieved…'], ['description*', 'the goal'], ['subject*', 'the patient'], ['target', 'measure, detail[x] and due date'], ['addresses', 'the Conditions it relates to']],
    vs: [['CarePlan', 'the plan to reach the goal'], ['Observation', 'the measured values']],
  },
  CareTeam: {
    keys: [['status', 'active, inactive…'], ['subject', 'the patient'], ['participant', 'role and member'], ['period', 'when'], ['managingOrganization', 'who runs the team']],
    vs: [['PractitionerRole', 'one practitioner’s job'], ['Group', 'a set of people that is not about care']],
  },
  NutritionOrder: {
    keys: [['status*', 'draft, active…'], ['intent*', 'proposal, plan, order…'], ['patient*', 'who'], ['dateTime*', 'when ordered'], ['oralDiet / supplement / enteralFormula', 'what kind of feeding'], ['allergyIntolerance', 'allergies to consider']],
    vs: [['ServiceRequest', 'other orders'], ['MedicationRequest', 'medications']],
  },
  RiskAssessment: {
    keys: [['status*', 'final, amended…'], ['subject*', 'the patient'], ['occurrence[x]', 'when assessed'], ['prediction', 'outcome, probability[x] and time frame'], ['basis', 'the data used'], ['mitigation', 'how to reduce the risk']],
    vs: [['Observation', 'a measured value'], ['Condition', 'something the patient has now']],
  },
  Communication: {
    keys: [['status*', 'in-progress, completed…'], ['category', 'alert, notification, reminder…'], ['subject', 'the patient'], ['sender / recipient', 'who to whom'], ['sent / received', 'when'], ['payload.content[x]', 'the message: text, attachment or reference']],
    vs: [['CommunicationRequest', 'a request to send a message'], ['Procedure', 'counselling meant to change the patient'], ['Flag', 'a standing warning']],
  },
  DeviceUseStatement: {
    keys: [['status*', 'active, completed…'], ['subject*', 'the patient'], ['device*', 'the Device'], ['timing[x]', 'when or how often'], ['source', 'who reported it'], ['reasonCode', 'why']],
    vs: [['Device', 'the device itself'], ['DeviceRequest', 'an order for a device']],
  },
  Consent: {
    keys: [['status*', 'modifier: draft, active, rejected…'], ['scope*', 'modifier: patient-privacy, research, treatment…'], ['category*', 'type of consent'], ['patient', 'who'], ['dateTime', 'when'], ['policyRule', 'the base policy'], ['provision', 'permit/deny rules: actor, action, purpose, period']],
    vs: [['Contract', 'a legal agreement in general'], ['Provenance', 'who did what to data']],
  },
  Provenance: {
    keys: [['target*', 'the resource(s) this is about'], ['recorded*', 'when recorded'], ['agent*', 'who: type, who, onBehalfOf'], ['activity', 'create, update, transform…'], ['entity', 'source data used'], ['signature', 'digital signature']],
    vs: [['AuditEvent', 'a security log of access and actions'], ['Consent', 'what the patient allows']],
  },
  AuditEvent: {
    keys: [['type* / subtype', 'what kind of event, e.g. rest read'], ['action', 'C, R, U, D or E'], ['recorded*', 'when'], ['outcome', 'success or failure'], ['agent*', 'who did it, and from which network address'], ['source*', 'the system that logged it'], ['entity', 'what was accessed, e.g. the Patient']],
    vs: [['Provenance', 'where data came from and who is responsible']],
  },
  DocumentReference: {
    keys: [['status*', 'modifier: current, superseded, entered-in-error'], ['type / category', 'what kind of document'], ['subject', 'the patient'], ['date / author', 'when and who'], ['content*', 'attachment (data or url) and format'], ['context', 'encounter and period']],
    vs: [['Composition', 'a structured FHIR document'], ['Binary', 'the raw content only'], ['DiagnosticReport', 'a structured report of results']],
  },
  Composition: {
    keys: [['status*', 'preliminary, final, amended…'], ['type*', 'kind of document, e.g. discharge summary (LOINC)'], ['subject', 'the patient'], ['date*', 'when'], ['author*', 'who'], ['title*', 'the document title'], ['section', 'title, code, narrative text and entries']],
    vs: [['DocumentReference', 'metadata about any document'], ['Bundle', 'the document is a Bundle of type document with the Composition first']],
  },
  Bundle: {
    keys: [['type*', 'document, message, transaction, batch, searchset, history, collection…'], ['entry.fullUrl', 'the identity of each entry'], ['entry.resource', 'the resource'], ['entry.request / response', 'for transactions and batches'], ['entry.search', 'match or include, in search results'], ['total / link', 'search count and paging links']],
    vs: [['List', 'a curated list of references'], ['Composition', 'the structure of a document']],
  },
  OperationOutcome: {
    keys: [['issue*', 'one or more problems'], ['issue.severity*', 'fatal, error, warning, information'], ['issue.code*', 'required, invalid, not-found…'], ['issue.diagnostics', 'technical detail'], ['issue.expression', 'FHIRPath to the problem element']],
    vs: [['AuditEvent', 'a log entry'], ['DetectedIssue', 'a clinical problem']],
  },
  CapabilityStatement: {
    keys: [['status* / date*', 'metadata'], ['kind*', 'instance, capability or requirements'], ['fhirVersion*', 'e.g. 4.0.1'], ['format*', 'json, xml'], ['rest.resource', 'supported types, interactions, search params, operations'], ['rest.security', 'e.g. SMART on FHIR']],
    vs: [['TerminologyCapabilities', 'what a terminology server can do'], ['ImplementationGuide', 'a whole package of rules']],
  },
  Binary: {
    keys: [['contentType*', 'MIME type, e.g. application/pdf'], ['data', 'base64-encoded content'], ['securityContext', 'which resource controls access']],
    vs: [['DocumentReference', 'metadata that points to the content'], ['Media', 'photos and video with clinical context']],
  },
  Parameters: {
    keys: [['parameter.name*', 'parameter name'], ['parameter.value[x]', 'a simple value'], ['parameter.resource', 'a whole resource'], ['parameter.part', 'nested parameters']],
    vs: [['Bundle', 'a collection of resources with its own REST endpoint']],
  },
  Subscription: {
    keys: [['status*', 'requested, active, error, off'], ['reason*', 'why the subscription exists'], ['criteria*', 'search string, e.g. Observation?patient=123'], ['channel*', 'type (rest-hook, websocket, email…), endpoint and payload']],
    vs: [['MessageHeader', 'messaging between systems'], ['Communication', 'a message between people']],
  },
  MessageHeader: {
    keys: [['event[x]*', 'what happened, e.g. admit-notification'], ['source*', 'the sending system'], ['destination', 'where it is going'], ['focus', 'the main resources in the message'], ['response', 'for replies: the original message id and code']],
    vs: [['Bundle', 'the container: type message'], ['Subscription', 'notifications based on search criteria']],
  },
  StructureDefinition: {
    keys: [['url* / name* / status*', 'identity'], ['kind*', 'primitive-type, complex-type, resource or logical'], ['type*', 'the type being defined or constrained'], ['baseDefinition', 'what it builds on'], ['derivation', 'specialization or constraint (a profile)'], ['differential / snapshot', 'the changes, and the full result']],
    vs: [['ImplementationGuide', 'the package that holds the profiles'], ['SearchParameter / OperationDefinition', 'other conformance resources']],
  },
  ValueSet: {
    keys: [['url', 'canonical URL used in bindings'], ['status*', 'draft, active…'], ['compose', 'include and exclude rules: system, concept, filter'], ['expansion', 'the resulting list of codes']],
    vs: [['CodeSystem', 'defines the codes'], ['ConceptMap', 'maps codes between systems']],
  },
  CodeSystem: {
    keys: [['url', 'the value used in Coding.system'], ['status*', 'draft, active…'], ['content*', 'not-present, example, fragment, complete, supplement'], ['caseSensitive', 'are codes case-sensitive?'], ['concept', 'code, display, definition, child concepts']],
    vs: [['ValueSet', 'selects codes for a use'], ['NamingSystem', 'registers identifiers for systems']],
  },
  ConceptMap: {
    keys: [['url / status*', 'identity'], ['source[x] / target[x]', 'the value sets being mapped'], ['group', 'source and target code systems'], ['group.element', 'source code and its targets'], ['target.equivalence*', 'equivalent, wider, narrower, inexact…']],
    vs: [['ValueSet', 'a list of codes'], ['StructureMap', 'transforms whole structures, not just codes']],
  },
  ImplementationGuide: {
    keys: [['url* / name* / status*', 'identity'], ['packageId*', 'npm package name, e.g. hl7.fhir.us.core'], ['fhirVersion*', 'e.g. 4.0.1'], ['dependsOn', 'other IGs it uses'], ['definition', 'the resources and pages it contains']],
    vs: [['StructureDefinition', 'one profile or extension'], ['CapabilityStatement', 'what a system must support']],
  },
  SearchParameter: {
    keys: [['url* / name* / status*', 'identity'], ['code*', 'the name used in the URL'], ['base*', 'resource types it applies to'], ['type*', 'string, token, reference, date…'], ['expression', 'FHIRPath to the element'], ['description*', 'what it searches']],
    vs: [['OperationDefinition', 'defines an operation or named query'], ['StructureDefinition', 'defines structures, not searches']],
  },
  Coverage: {
    keys: [['status*', 'active, cancelled…'], ['beneficiary*', 'the patient covered'], ['payor*', 'the insurer'], ['subscriber / subscriberId', 'policy holder and member id'], ['relationship', 'beneficiary to subscriber'], ['period', 'when it is valid'], ['class', 'group and plan']],
    vs: [['InsurancePlan', 'the product offered by an insurer'], ['Claim', 'a request for payment']],
  },
  Claim: {
    keys: [['status* / type* / use*', 'use: claim, preauthorization or predetermination'], ['patient*', 'who'], ['created*', 'when'], ['provider*', 'who is billing'], ['priority*', 'how urgent'], ['insurance*', 'which Coverage'], ['diagnosis / procedure / item', 'what is being billed'], ['total', 'amount']],
    vs: [['ClaimResponse', 'the insurer’s reply'], ['ExplanationOfBenefit', 'the summary for the patient'], ['Invoice', 'a bill, not a claim to an insurer']],
  },
  ExplanationOfBenefit: {
    keys: [['status* / type* / use*', 'what kind of claim'], ['patient* / created*', 'who and when'], ['insurer* / provider*', 'who paid and who billed'], ['outcome*', 'queued, complete, error, partial'], ['insurance*', 'the coverage used'], ['item.adjudication / total / payment', 'what was paid and owed']],
    vs: [['Claim', 'the original request'], ['ClaimResponse', 'the reply to the provider']],
  },
  CoverageEligibilityRequest: {
    keys: [['status*', 'active…'], ['purpose*', 'auth-requirements, benefits, discovery, validation'], ['patient*', 'who'], ['created*', 'when'], ['insurer*', 'who is asked'], ['insurance', 'which Coverage'], ['item', 'the services to check']],
    vs: [['CoverageEligibilityResponse', 'the answer'], ['Claim', 'with use = preauthorization asks for approval of specific care']],
  },
  ResearchStudy: {
    keys: [['title / identifier', 'which study'], ['status*', 'active, completed…'], ['phase', 'e.g. phase-3'], ['condition / focus', 'what is studied'], ['protocol', 'PlanDefinition'], ['site / sponsor', 'where and who funds it'], ['enrollment', 'Group of participants']],
    vs: [['ResearchSubject', 'one person in the study'], ['PlanDefinition', 'the protocol']],
  },
  PlanDefinition: {
    keys: [['url / status*', 'identity'], ['type', 'order-set, clinical-protocol, eca-rule, workflow-definition'], ['goal', 'what the plan aims for'], ['action', 'steps: title, trigger, condition, definition[x]']],
    vs: [['ActivityDefinition', 'one activity, not a whole plan'], ['CarePlan', 'a plan for one patient'], ['RequestGroup', 'the requests created when applied']],
  },
  Measure: {
    keys: [['url / status*', 'identity'], ['scoring', 'proportion, ratio, continuous-variable, cohort'], ['library', 'the logic (e.g. CQL)'], ['group.population', 'initial-population, denominator, numerator…'], ['improvementNotation', 'is higher or lower better?']],
    vs: [['MeasureReport', 'the calculated results'], ['Library', 'the logic the measure uses']],
  },
};
