// Topic structure of the HL7 FHIR Foundational Implementer exam, taken from
// HL7's official study guide. Titles, weights and objectives stay fixed here;
// the study notes for each topic live in content/<id>.md and can be edited by
// the admin from the website (edits are stored in the database).

export const EXAM = {
  name: 'HL7 FHIR Foundational Implementer',
  fhirVersion: 'R4',
  questions: 100,
  minutes: 180,
  passPercent: 60,
};

export const DOMAINS = [
  {
    id: 'ig',
    title: 'Understanding Implementation Guides',
    weight: [4, 8],
    topics: [
      {
        id: 'ig-select-profiles',
        title: 'Select profiles based on use case',
        weight: [3, 5],
        objectives: [
          'Locate the list of available resources / profiles in the standard or implementation guide.',
          'Interpret the resource scope and usage, description, boundaries, and relationships sections and compare it to the use case.',
          'Infer any other related resource/profile needed to complete information requirements for the use case.',
        ],
      },
      {
        id: 'ig-choose-guide',
        title: 'Determine which implementation guide to use for a use case',
        weight: [1, 3],
        objectives: [
          'Locate the registries of Implementation Guides (global, local, those recommended in the domain etc.).',
          'Search by keywords to find ones that may be appropriate, e.g. "laboratory", "genomics", "UK".',
          'Examine each implementation guide, read the scope, use cases, and interactions to determine appropriateness.',
        ],
      },
    ],
  },
  {
    id: 'api',
    title: 'FHIR API Behavior',
    weight: [19, 33],
    topics: [
      {
        id: 'api-exchange-paradigms',
        title: 'Determine exchange paradigms for a specific use case',
        weight: [4, 6],
        objectives: [
          'Recall the available exchange paradigms (include new paradigms like bulk-transfer and subscription).',
          'Compare the key features of the paradigm and the use case.',
          'Estimate suitability of each paradigm and make a selection.',
        ],
      },
      {
        id: 'api-restful-methods',
        title: 'Select RESTful API methods for specific interactions',
        weight: [4, 6],
        objectives: [
          'Locate the category of API method for an interaction (creating, updating, deleting, read, searching, executing an operation).',
          'Interpret the use of conditional updates.',
          'Compare the use of direct get vs search.',
        ],
      },
      {
        id: 'api-select-operations',
        title: 'Select operations for a use case',
        weight: [2, 4],
        objectives: [
          'Locate the resource/system operation list.',
          'Determine candidate operations in the list.',
          'Compare the operation parameters with provided requirements to identify gaps.',
        ],
      },
      {
        id: 'api-capability-statement',
        title: 'Interpret a capability statement',
        weight: [2, 4],
        objectives: [
          'Distinguish the sections of the capability statement.',
          'Locate which resources are supported in REST mode.',
          'Locate which methods are supported for each resource in REST mode.',
        ],
      },
      {
        id: 'api-bundles',
        title: 'Select Bundle features for a use case',
        weight: [3, 5],
        objectives: [
          'Determine the bundle type within the paradigm.',
          'Determine key components and parts of the bundle.',
        ],
      },
      {
        id: 'api-safety-checklist',
        title: 'Follow safety checklist',
        weight: [2, 4],
        objectives: [
          'Locate the checklist.',
          'Interpret the checklist.',
          'Apply items from the checklist to specific problems.',
          'Given an undesired consequence, identify what could have been done to prevent it.',
        ],
      },
      {
        id: 'api-security-checklist',
        title: 'Follow security checklist',
        weight: [2, 4],
        objectives: [
          'Locate the authentication method used either by the client or server depending on the context.',
          'Compare the AuditEvent resource entries to the Basic Audit Log Patterns Implementation Guide to determine conformance with recommendations.',
          'Consider methods for secure communications with the FHIR API.',
        ],
      },
    ],
  },
  {
    id: 'res',
    title: 'Resource Model and Structure',
    weight: [25, 33],
    topics: [
      {
        id: 'res-select-resources',
        title: 'Select resources based on a use case',
        weight: [7, 9],
        objectives: [
          'Select the right resource given a scenario.',
          'Select the right "workflow" resource for a scenario.',
          'Identify when Provenance is used.',
        ],
      },
      {
        id: 'res-element-suitability',
        title: 'Determine suitability of an element based on use case',
        weight: [9, 11],
        objectives: [
          'Define the component data elements, constraints, and relationships for the use case.',
          'Determine element cardinality and flags.',
          'Determine the terminology for a coded element.',
          'Determine the correct reference mechanism to link various resources.',
        ],
      },
      {
        id: 'res-search-availability',
        title: 'Determine search parameter availability for resources',
        weight: [2, 4],
        objectives: [
          'Interpret which search parameters are available for a specific resource.',
          'Estimate how to combine search parameters to retrieve that resource.',
          'Determine which search parameters are applicable for a particular scenario.',
          'Find out if there is an operation that fits your use case.',
        ],
      },
      {
        id: 'res-find-extensions',
        title: 'Determine existing extensions for a use case',
        weight: [2, 4],
        objectives: [
          'Decide if a data requirement is not met by the resource(s) and existing properties.',
          'Search FHIR standard extensions, those of relevant IGs and other extensions from registries, to find a suitable extension.',
          'Compare the data type of the extension with the existing data.',
        ],
      },
      {
        id: 'res-terminology',
        title: 'Determine terminology for a use case',
        weight: [3, 5],
        objectives: [
          'Distinguish the correct data type to represent an element of a use case.',
          'Determine the binding strength.',
          'Determine the value set.',
        ],
      },
    ],
  },
  {
    id: 'impl',
    title: 'Implementation',
    weight: [19, 29],
    topics: [
      {
        id: 'impl-extensions',
        title: 'Use existing extensions for a use case',
        weight: [2, 4],
        objectives: [
          'Format the extension instance in FHIR data.',
          'Put the extension in the correct place: extend the resource or the element (or data type) within it.',
          'Identify the correct placement sequence of an extension in a resource for XML or JSON.',
          'Identify the correct URL for the extension.',
          'Use the correct data type for the value.',
        ],
      },
      {
        id: 'impl-elements',
        title: 'Use selected element based on a use case',
        weight: [9, 11],
        objectives: [
          'Use simple and complex data types.',
          'Use the name of the element correctly.',
          'Confirm elements are in the correct order, and so are elements in data types, for XML.',
          'Put the data in the right place (XML).',
          'Use the value attribute (not text between tags).',
          'Use the choice data types correctly.',
          'Use repeating elements correctly (JSON needs arrays even for repeatable elements that have only one repetition).',
          'Use a backbone element correctly.',
          'Use quotes correctly for strings but not for numbers and booleans.',
        ],
      },
      {
        id: 'impl-search',
        title: 'Use search parameters for resources',
        weight: [2, 4],
        objectives: [
          'Given the parameters, write a simple search using parameter name and search criteria data types.',
          'Use AND/OR to combine search criteria.',
          'Use special syntax for dates and quantities.',
        ],
      },
      {
        id: 'impl-operations',
        title: 'Use operations for a use case',
        weight: [2, 4],
        objectives: [
          'Use the in/out parameter data types correctly.',
          'Determine if it is a simple operation (URL based) or POST operation (complex).',
          'Write the operation call based on the parameters.',
        ],
      },
      {
        id: 'impl-terminology',
        title: 'Use terminology for a use case',
        weight: [4, 6],
        objectives: [
          'Use the structure correctly for a basic code data type, e.g. Patient.gender.',
          'Use the structure correctly for a more complex CodeableConcept data type.',
          'Use the different attributes: system, code, display, and text.',
          'Manage more than one code in a CodeableConcept.',
        ],
      },
    ],
  },
  {
    id: 'ts',
    title: 'Troubleshooting and Validation',
    weight: [13, 19],
    topics: [
      {
        id: 'ts-validation-errors',
        title: 'Troubleshoot validation errors',
        weight: [4, 6],
        objectives: [
          'Determine the location of a validation error in the evaluated resource.',
          'Determine suitable corrective action(s) based on the validation error(s).',
          'Determine if corrective action(s) are needed based on message severity.',
        ],
      },
      {
        id: 'ts-server-errors',
        title: 'Troubleshoot REST API server errors',
        weight: [5, 7],
        objectives: [
          'Interpret the different HTTP error codes.',
          'Interpret the OperationOutcome response.',
          'Triage based on the kind of problem (lack of connectivity/server down, permissions failure, incorrect use of the API / wrong URL / wrong HTTP verb, missing data, incorrect data, etc.).',
          'Fetch and read the CapabilityStatement of the API to check that it supports your intent.',
        ],
      },
      {
        id: 'ts-profile-validation',
        title: 'Apply profile rules to validate a resource instance',
        weight: [4, 6],
        objectives: [
          'Choose the method to validate the instance.',
          'Execute the validation (for example, ask a server to validate).',
          'Interpret the validation output.',
        ],
      },
    ],
  },
];

export const OVERVIEW_ID = 'overview';

export function allTopicIds() {
  return [OVERVIEW_ID, ...DOMAINS.flatMap((d) => d.topics.map((t) => t.id))];
}

export function isTopicId(id) {
  return allTopicIds().includes(id);
}
