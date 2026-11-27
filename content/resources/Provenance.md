> **Security Work Group** · Maturity Level: 3 · Trial Use · Security Category: Not Classified · Compartments: Device, Patient, Practitioner, RelatedPerson

Provenance of a resource is a record that describes entities and processes involved in producing and delivering or otherwise influencing that resource. Provenance provides a critical foundation for assessing authenticity, enabling trust, and allowing reproducibility. Provenance assertions are a form of contextual metadata and can themselves become important records with their own provenance. Provenance statement indicates clinical significance in terms of confidence in authenticity, reliability, and trustworthiness, integrity, and stage in lifecycle (e.g. Document Completion - has the artifact been legally authenticated), all of which may impact security, privacy, and trust policies.

## Scope and Usage

The Provenance resource tracks information about the activity that created, revised, deleted, or signed a version of a resource, describing the entities and agents involved. This information can be used to form assessments about its quality, reliability, trustworthiness, or to provide pointers for where to go to further investigate the origins of the resource and the information in it.

Provenance resources are a record-keeping assertion that gathers information about the context in which the information in a resource was obtained. Provenance resources are prepared by the application that initiates the create/update etc. of the resource. An [AuditEvent](#resource-AuditEvent) resource contains overlapping information, but is created as events occur, to track and audit the events. AuditEvent resources are often (though not exclusively) created by the application responding to the read/query/create/update/etc. event.

## Boundaries and Relationships

Many other FHIR resources contain some elements that represent information about how the resource was obtained, and therefore they overlap with the functionality of the Provenance resource. These properties in other resources should always be used in preference to the Provenance resource, and the Provenance resource should be used where additional information is required, or explicit record or provenance is desired.

The relationship between a resource and its provenance is established by a reference from the provenance resource to its target. In this way, provenance may be provided about any resource or version, including past versions. There may be multiple provenance records for a given resource or version of a resource.

> **Exam angle**
>
> - **Provenance vs AuditEvent** is the classic question. **Provenance** = where data came from and who is responsible for it: written by the app that **creates or changes** the data, about the data (W3C "Generation"). **AuditEvent** = a security log of **events** such as reads, searches and changes, usually written by the **server** that responds (W3C "Usage" and other activities).
> - **Use the resource's own elements first** (e.g. `Observation.performer`, `Condition.recorder`, `meta.source`). Add a Provenance only when you need more, or an explicit provenance record.
> - The link goes **from Provenance to the resource** (`target`), never the other way, so one resource can have **many** Provenance records. Find them with `_revinclude=Provenance:target`.
> - **Required:** `target` (`1..*`), `recorded` (`1..1`, an instant), `agent` (`1..*`) with `agent.who` (`1..1`), and `entity.role` / `entity.what` if you include an entity.
> - **Create the resource and its Provenance together in a transaction**, so you never end up with one without the other.
> - Use Provenance to record **imports and transforms** (e.g. middleware turning HL7 v2 or CDA into FHIR) and **deletions** (who deleted what).
> - `signature` gives integrity and non-repudiation.

## Background and Context

The Provenance resource is based on the [W3C Provenance specification](https://www.w3.org/TR/prov-overview/), and mappings are provided. The Provenance resource is tailored to fit the FHIR use-cases for provenance more directly. In terms of W3C Provenance the FHIR Provenance resource covers "Generation" of "Entity" with respect to FHIR defined resources for creation or updating; whereas AuditEvent covers "Usage" of "Entity" and all other "Activity" as defined in W3C Provenance.

The W3C Provenance Specification has the following fundamental model (diagram redrawn here, with the FHIR elements each part maps to):

<div class="diagram">
<svg viewBox="0 0 700 250" role="img" aria-label="W3C provenance model: an activity generated the target entity, used another entity, and was associated with an agent" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="pv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker>
  </defs>
  <g style="font-family:var(--font-body);font-size:13px">
    <ellipse cx="110" cy="62" rx="92" ry="32" style="fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5"/>
    <text x="110" y="58" text-anchor="middle" style="fill:var(--ink);font-weight:600">Entity</text>
    <text x="110" y="76" text-anchor="middle" style="fill:var(--muted);font-size:12px">Provenance.target</text>
    <ellipse cx="110" cy="190" rx="92" ry="32" style="fill:var(--warn-soft);stroke:var(--warn);stroke-width:1.5"/>
    <text x="110" y="186" text-anchor="middle" style="fill:var(--ink);font-weight:600">Entity</text>
    <text x="110" y="204" text-anchor="middle" style="fill:var(--muted);font-size:12px">Provenance.entity.what</text>
    <rect x="240" y="96" width="150" height="62" rx="6" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5"/>
    <text x="315" y="122" text-anchor="middle" style="fill:var(--ink);font-weight:600">Activity</text>
    <text x="315" y="140" text-anchor="middle" style="fill:var(--muted);font-size:12px">the Provenance itself</text>
    <path d="M520,92 L640,92 L672,127 L640,162 L520,162 z" style="fill:var(--good-soft);stroke:var(--good);stroke-width:1.5"/>
    <text x="590" y="123" text-anchor="middle" style="fill:var(--ink);font-weight:600">Agent</text>
    <text x="590" y="141" text-anchor="middle" style="fill:var(--muted);font-size:12px">Provenance.agent</text>
    <line x1="198" y1="72" x2="240" y2="106" style="stroke:var(--muted);stroke-width:1.5" marker-end="url(#pv-arrow)"/>
    <text x="214" y="66" style="fill:var(--muted);font-size:11.5px">wasGeneratedBy</text>
    <line x1="240" y1="148" x2="198" y2="178" style="stroke:var(--muted);stroke-width:1.5" marker-end="url(#pv-arrow)"/>
    <text x="226" y="186" style="fill:var(--muted);font-size:11.5px">used</text>
    <line x1="390" y1="127" x2="516" y2="127" style="stroke:var(--muted);stroke-width:1.5" marker-end="url(#pv-arrow)"/>
    <text x="453" y="119" text-anchor="middle" style="fill:var(--muted);font-size:11.5px">wasAssociatedWith</text>
    <line x1="110" y1="94" x2="110" y2="156" style="stroke:var(--muted);stroke-width:1.5" marker-end="url(#pv-arrow)"/>
    <text x="118" y="129" style="fill:var(--muted);font-size:11.5px">wasDerivedFrom</text>
    <path d="M200,50 C 330,30 530,28 588,88" style="fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 3" marker-end="url(#pv-arrow)"/>
    <text x="400" y="22" text-anchor="middle" style="fill:var(--muted);font-size:11.5px">wasAttributedTo</text>
  </g>
</svg>
</div>

Where:

- **Entity** - An entity is a physical, digital, conceptual or other kind of thing with some fixed aspects; entities may be real or imaginary.
- **Agent** - An agent is something that bears some form of responsibility for an activity taking place, for the existence of an entity, or for another agent's activity.
- **Activity** - An activity is something that occurs over a time period and acts upon or with entities. It may include consuming, processing, transforming, modifying, relocating, using, or generating entities.

The Provenance resource corresponds to a single activity that identifies a set of resources (target) generated by the activity. The activity also references other entities (entity) that were used and the agents (agent) that were associated with the activity. To record multiple activities that resulted in one (target), record each (activity) in independent Provenance records all pointing at that (target).

The Provenance resource depends upon having References to all the resources, entities, and agents involved in the activity. These References need not be resolvable. The references must provide a unique and unambiguous identification. If a resource, entity, or agent can have different versions that must be identified, then the Reference must have versioning information included.

Versioning and unique identification are not mandated for all systems that provide Resources, entities, and agents. But, inclusion of Provenance requirements may introduce requirements for versioning and unique identification on those systems.

The Provenance resource is based on leveraging the W3C Provenance specification to represent HL7 support of provenance throughout its standards and explicitly modeled as functional capabilities in ISO/HL7 10781 EHR System Functional Model Release 2 and ISO 21089 Trusted End-to-End Information Flows. Mappings are provided. The Provenance resource is tailored to fit the FHIR use-cases for provenance more directly. In terms of W3C Provenance the FHIR Provenance resources covers "Generation" of "Entity" with respect to FHIR defined resources for creation or updating; whereas AuditEvent covers "Usage" of "Entity" and all other "Activity" as defined in W3C Provenance.

This resource is referenced by [Contract](#resource-Contract), [DeviceRequest](#resource-DeviceRequest), [MedicationAdministration](#resource-MedicationAdministration), [MedicationDispense](#resource-MedicationDispense), [MedicationRequest](#resource-MedicationRequest), [ServiceRequest](#resource-ServiceRequest) and [Task](#resource-Task) (through `relevantHistory` on Contract, DeviceRequest, ServiceRequest and Task, and `eventHistory` on the three medication resources).

## Structure

<div class="structure-table">

| Name | Flags | Card. | Type | Description & Constraints |
|---|---|---|---|---|
| ![Resource](img/fhir/icon_resource.png) **[Provenance](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance)** | [TU](https://hl7.org/fhir/R4/versions.html#std-process) |  | [DomainResource](https://hl7.org/fhir/R4/domainresource.html) | Who, What, When for a set of resources<br>Elements defined in Ancestors: [id](https://hl7.org/fhir/R4/resource.html#Resource), [meta](https://hl7.org/fhir/R4/resource.html#Resource), [implicitRules](https://hl7.org/fhir/R4/resource.html#Resource), [language](https://hl7.org/fhir/R4/resource.html#Resource), [text](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [contained](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [extension](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [modifierExtension](https://hl7.org/fhir/R4/domainresource.html#DomainResource) |
| &emsp;![Reference](img/fhir/icon_reference.png) [target](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.target) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..* | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Any](https://hl7.org/fhir/R4/resourcelist.html)) | Target Reference(s) (usually version specific) |
| &emsp;![Choice of types](img/fhir/icon_choice.gif) [occurred[x]](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.occurred_x_) |  | 0..1 |  | When the activity occurred |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) occurredPeriod |  |  | [Period](https://hl7.org/fhir/R4/datatypes.html#Period) |  |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) occurredDateTime |  |  | [dateTime](https://hl7.org/fhir/R4/datatypes.html#dateTime) |  |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [recorded](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.recorded) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [instant](https://hl7.org/fhir/R4/datatypes.html#instant) | When the activity was recorded / updated |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [policy](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.policy) |  | 0..* | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) | Policy or plan the activity was defined by |
| &emsp;![Reference](img/fhir/icon_reference.png) [location](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.location) |  | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Location](https://hl7.org/fhir/R4/location.html)) | Where the activity occurred, if relevant |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [reason](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.reason) |  | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Reason the activity is occurring<br>[V3 Value SetPurposeOfUse](https://hl7.org/fhir/R4/v3/PurposeOfUse/vs.html) ([Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible)) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [activity](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.activity) |  | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Activity that occurred<br>[Provenance activity type](https://hl7.org/fhir/R4/valueset-provenance-activity-type.html) ([Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible)) |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [agent](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.agent) |  | 1..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | Actor involved |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [type](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.agent.type) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | How the agent participated<br>[Provenance participant type](https://hl7.org/fhir/R4/valueset-provenance-agent-type.html) ([Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible)) |
| &emsp;&emsp;![Complex type](img/fhir/icon_datatype.gif) [role](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.agent.role) |  | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | What the agents role was<br>[SecurityRoleType](https://hl7.org/fhir/R4/valueset-security-role-type.html) ([Example](https://hl7.org/fhir/R4/terminologies.html#example)) |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [who](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.agent.who) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Practitioner](https://hl7.org/fhir/R4/practitioner.html) \| [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html) \| [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html) \| [Patient](https://hl7.org/fhir/R4/patient.html) \| [Device](https://hl7.org/fhir/R4/device.html) \| [Organization](https://hl7.org/fhir/R4/organization.html)) | Who participated |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [onBehalfOf](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.agent.onBehalfOf) |  | 0..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Practitioner](https://hl7.org/fhir/R4/practitioner.html) \| [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html) \| [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html) \| [Patient](https://hl7.org/fhir/R4/patient.html) \| [Device](https://hl7.org/fhir/R4/device.html) \| [Organization](https://hl7.org/fhir/R4/organization.html)) | Who the agent is representing |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [entity](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.entity) |  | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | An entity used in this activity |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [role](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.entity.role) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | derivation \| revision \| quotation \| source \| removal<br>[ProvenanceEntityRole](https://hl7.org/fhir/R4/valueset-provenance-entity-role.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) [what](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.entity.what) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [Reference](https://hl7.org/fhir/R4/references.html#Reference)([Any](https://hl7.org/fhir/R4/resourcelist.html)) | Identity of entity |
| &emsp;&emsp;![Reuse](img/fhir/icon_reuse.png) [agent](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.entity.agent) |  | 0..* | see [agent](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.agent) | Entity is attributed to this agent |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [signature](https://hl7.org/fhir/R4/provenance-definitions.html#Provenance.signature) |  | 0..* | [Signature](https://hl7.org/fhir/R4/datatypes.html#Signature) | Signature on target |

</div>

Things to notice in this table:

- **Required:** `target` (`1..*`, any resource, usually a version-specific reference), `recorded` (`1..1`), and at least one `agent` with its `who`. Inside an `entity`, `role` and `what` are required.
- **No modifiers.** Provenance describes other resources; it doesn't change their meaning.
- **Two times:** `occurred[x]` (when the activity happened: a dateTime or a Period) and `recorded` (when it was recorded, an **instant** with full precision and timezone).
- **`target` and `entity.what` are `Reference(Any)`:** provenance can be about, and use, any resource.
- **`agent.who` vs `agent.onBehalfOf`:** e.g. a Practitioner acting for an Organization, or a Device acting for a Practitioner.
- **`entity.agent`** reuses the agent structure (the reuse icon): the agents an input entity is attributed to.
- **`entity.role`** has a **required** binding: `derivation`, `revision`, `quotation`, `source`, `removal`.

### Terminology bindings

<div class="spec-table">

| Path | Definition | Type | Reference |
|---|---|---|---|
| Provenance.reason | The reason the activity took place. | [Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible) | [v3.PurposeOfUse](https://hl7.org/fhir/R4/v3/PurposeOfUse/vs.html) |
| Provenance.activity | The activity that took place. | [Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible) | [ProvenanceActivityType](https://hl7.org/fhir/R4/valueset-provenance-activity-type.html) |
| Provenance.agent.type | The type of participation that a provenance agent played with respect to the activity. | [Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible) | [ProvenanceParticipantType](https://hl7.org/fhir/R4/valueset-provenance-agent-type.html) |
| Provenance.agent.role | The role that a provenance agent played with respect to the activity. | [Example](https://hl7.org/fhir/R4/terminologies.html#example) | [SecurityRoleType](https://hl7.org/fhir/R4/valueset-security-role-type.html) |
| Provenance.entity.role | How an entity was used in an activity. | [Required](https://hl7.org/fhir/R4/terminologies.html#required) | [ProvenanceEntityRole](https://hl7.org/fhir/R4/valueset-provenance-entity-role.html) |

</div>

The activity codes come from the HL7 v3 DataOperation code system, e.g. `CREATE`, `UPDATE`, `DELETE`. The `agent.type` value set (`http://terminology.hl7.org/CodeSystem/provenance-participant-type`) includes `enterer`, `performer`, `author`, `verifier`, `legal`, `attester`, `informant`, `custodian`, `assembler` and `composer`.

## Using the Provenance Resource

The Provenance resource identifies information about another resource (the reference element). The Provenance resource may be used in several different ways:

- As part of a document bundle where it identifies the provenance of part or all of the document
- On a RESTful system where it keeps track of provenance information relating to resources

When used in a document bundle, the references are often not explicitly versioned, but they always implicitly pertain to the version of the resource found in the document. On a RESTful system, the target resource reference should be version specific, but this requires special care: For new resources that need to have a corresponding Provenance resource, the version-specific reference is often not knowable until after the target resource has been updated. This can create an integrity problem for the system - what if the Provenance resource cannot be created after the target resource has been updated? To avoid any such integrity problems, the target resource and the Provenance resources should be submitted as a pair using a transaction.

Here is such a transaction: a lab result imported by an interface engine, with its Provenance.

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [{
    "fullUrl": "urn:uuid:4f6a30fb-cd3c-4ab6-8757-532101f72065",
    "resource": {
      "resourceType": "Observation",
      "status": "final",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "2345-7", "display": "Glucose [Mass/volume] in Serum or Plasma" }] },
      "subject": { "reference": "Patient/123" },
      "valueQuantity": { "value": 5.4, "unit": "mmol/L", "system": "http://unitsofmeasure.org", "code": "mmol/L" }
    },
    "request": { "method": "POST", "url": "Observation" }
  }, {
    "resource": {
      "resourceType": "Provenance",
      "target": [{ "reference": "urn:uuid:4f6a30fb-cd3c-4ab6-8757-532101f72065" }],
      "recorded": "2024-05-03T09:12:44.512+01:00",
      "activity": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v3-DataOperation", "code": "CREATE" }] },
      "agent": [{
        "type": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/provenance-participant-type", "code": "assembler" }] },
        "who": { "reference": "Device/interface-engine" },
        "onBehalfOf": { "reference": "Organization/hospital-lab" }
      }],
      "entity": [{
        "role": "source",
        "what": { "reference": "DocumentReference/hl7v2-oru-message-789" }
      }]
    },
    "request": { "method": "POST", "url": "Provenance" }
  }]
}
```

The server replaces the `urn:uuid:` with the Observation's real id when it processes the transaction, so the Provenance points at the right resource.

### HTTP Header

The custom header `X-Provenance` to provide a provenance resource when performing PUT or POST operations using the RESTful interface:

```
POST [base]/Observation
Content-Type: application/fhir+?
X-Provenance: { "resourceType": "Provenance", "location": { "reference": "Location/1" }, "agent" ... }

[body]
```

The intent is that the server picks up the provenance, fills out the target, and then stores the provenance information as it normally would. Notes:

- Irrespective of the Content-Type or Accept headers, the Provenance resource is in the JSON format
- The provenance SHALL not have a specified Provenance.target. The server will fill the target in as it processes the contents of the POST/PUT and determines the ids of the resource(s) to which the interaction applies
- Servers MAY ignore the header, but SHOULD process it if they support provenance
- Some server frameworks impose a length limit on individual HTTP headers, or on the headers as a whole. Servers MAY reject a request if the X-Provenance header is too long
- The use of the header is not documented for other HTTP methods (GET etc)

### Signatures

The Provenance resource includes a signature element (digital signature) which can be used for standards based integrity verification and non-repudiation purposes. The [Signature](https://hl7.org/fhir/R4/datatypes.html#Signature) datatype provides details on use of the signature element. The `Signature.type` coded value of "Source" should be used when the signature is for simply proving that the resource content is the same as it was when the resource was updated or created.

### Provenance of Removal

A Provenance record can be recorded to indicate who deleted a Resource. If versioning is supported, the version that was deleted is referenced in `Provenance.target`; if versioning is not supported then `Provenance.target` contains the non-version reference. `Provenance.entity` is not used unless there is a business requirement to do so.

### Use of Provenance to record Import and Transform

Provenance can be used to record activities of an automaton that transforms input. Such as middleware that extracts information from a HL7 v2 message and creates FHIR resources, or middleware that extracts information from an HL7 CDA document and creates FHIR resources, etc. The Provenance in these cases is recording the activity of the middleware.

The middleware in this case would, in addition to creating the target resources, create a Provenance resource that indicates all the target resources (using `Provenance.target`). The middleware is identified as one of the `Provenance.agent` elements, with the `Provenance.agent.role` of assembler.

*(Note: in R4 the code `assembler` belongs to the provenance participant type value set, which is bound to `Provenance.agent.type`, as in the transaction example above.)*

The middleware may record the source as another `Provenance.agent` element.

The original content is optionally saved. This might be as a [DocumentReference](#resource-DocumentReference), or [Binary](#resource-Binary). The `Provenance.entity` would then point at this original content.

The original source might include some form of 'provenance' to cover the history of the original content prior to the import transformation. This original source 'provenance' should be converted into FHIR Provenance records as appropriate.

## Search Parameters

Search parameters for this resource. The [common parameters](https://hl7.org/fhir/R4/search.html#all) also apply. See [Searching](https://hl7.org/fhir/R4/search.html) for more information about searching in REST, messaging, and services.

<div class="spec-table">

| Name | Type | Description | Expression | In Common |
|---|---|---|---|---|
| agent | [reference](https://hl7.org/fhir/R4/search.html#reference) | Who participated | Provenance.agent.who<br>([Practitioner](https://hl7.org/fhir/R4/practitioner.html), [Organization](https://hl7.org/fhir/R4/organization.html), [Device](https://hl7.org/fhir/R4/device.html), [Patient](https://hl7.org/fhir/R4/patient.html), [PractitionerRole](https://hl7.org/fhir/R4/practitionerrole.html), [RelatedPerson](https://hl7.org/fhir/R4/relatedperson.html)) |   |
| agent-role | [token](https://hl7.org/fhir/R4/search.html#token) | What the agents role was | Provenance.agent.role |   |
| agent-type | [token](https://hl7.org/fhir/R4/search.html#token) | How the agent participated | Provenance.agent.type |   |
| entity | [reference](https://hl7.org/fhir/R4/search.html#reference) | Identity of entity | Provenance.entity.what<br>(Any) |   |
| location | [reference](https://hl7.org/fhir/R4/search.html#reference) | Where the activity occurred, if relevant | Provenance.location<br>([Location](https://hl7.org/fhir/R4/location.html)) |   |
| patient | [reference](https://hl7.org/fhir/R4/search.html#reference) | Target Reference(s) (usually version specific) | Provenance.target.where(resolve() is Patient)<br>([Patient](https://hl7.org/fhir/R4/patient.html)) |   |
| recorded | [date](https://hl7.org/fhir/R4/search.html#date) | When the activity was recorded / updated | Provenance.recorded |   |
| signature-type | [token](https://hl7.org/fhir/R4/search.html#token) | Indication of the reason the entity signed the object(s) | Provenance.signature.type |   |
| target | [reference](https://hl7.org/fhir/R4/search.html#reference) | Target Reference(s) (usually version specific) | Provenance.target<br>(Any) |   |
| when | [date](https://hl7.org/fhir/R4/search.html#date) | When the activity occurred | (Provenance.occurred as dateTime) |   |

</div>

Example searches:

```
GET [base]/Provenance?target=Observation/456
GET [base]/Provenance?patient=123&recorded=ge2024-01-01
GET [base]/Observation?patient=123&_revinclude=Provenance:target
```

The last search returns a patient's Observations **plus** every Provenance that points at them, in one Bundle.

For a step-by-step guide to reading the structure table, see [How to read a resource definition](#core-reading-resource).
