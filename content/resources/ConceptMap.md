> **Vocabulary Work Group** · Maturity Level: 3 · Trial Use · Security Category: Anonymous · Compartments: not linked to any defined compartments

## Scope and Usage

A concept map defines a mapping from a set of concepts defined in a code system (commonly referred to as the "system") to one or more concepts defined in other code systems. In the mapping context, a system can be a typical code system based on a recognized standard or local terminology (in any of its forms), or in some cases it may be an "implicit" code system that is not based on a recognized terminology but still represents a set of "concepts" that can be usefully mapped. Mappings are one way - from the source to the target system. In many cases, the reverse mappings are valid, but this cannot be assumed to be the case.

Mappings between code system concepts are only intended to be defined in the context of a particular business usage. The business use case is normally defined by the specification of the source and target value sets. The mappings may be useful in other contexts, but this must be determined based on the context of use and meaning; it cannot be taken for granted automatically. An example where the usage context is important for choosing the correct mapping is mapping from a clinical terminology (e.g. SNOMED CT) to a classification (e.g. ICD-10) for either data analysis or billing. Mappings in the data analysis context would be targeted for an appropriate classification (often at a higher level), whereas in the billing context there may be specific requirements to be met (e.g. leaf level codes only) that could result in multiple mappings for a single source concept and then require additional information beyond the source concept itself in order to select the correct final mapping.

Note that all code systems (explicit or implicit) represented in FHIR have URI identifiers for value sets (also either explicit or implicit) that include the entire code system, and these "all codes" value sets can be used for mappings that are valid in all use contexts that are appropriate for the code system.

Each mapping for a concept from the source to target system includes an **equivalence** property that specifies how similar the mapping is (or, in some cases, that there is no valid mapping). There is one element for each concept or field in the source value set or system that needs to be mapped. Each source concept may have multiple targets:

- because there are multiple possible mappings (e.g., ambiguous)
- to specify a correct map, and specify other mappings as invalid
- when there are multiple mappings depending on the values of other elements (`dependsOn`)

There SHOULD be at least one target for each element, but some incomplete concept maps might not have a target for each concept.

A key concept for the ConceptMap resource is the [$translate](https://hl7.org/fhir/R4/conceptmap-operation-translate.html) operation. This operation is a formal definition of an API by which a terminology server can allow clients to ask for a translation to be done based on the content in the ConceptMap resource. As such it also provides useful perspective on the operational use of ConceptMap resources in any context.

## Boundaries and Relationships

While ConceptMap resources are not referred to directly from any other resource, they may be included and used in [ImplementationGuide](#resource-ImplementationGuide) resources, and provide background knowledge that is useful in many contexts, including operations defined in this specification.

In addition to ConceptMap, there is also the [StructureMap](#resource-StructureMap) resource. The ConceptMap resource defines relationships between concepts in their own right, along with grading of their equivalencies, while the StructureMap defines an executable transform for instances that conform to a known structure.

Both [CodeSystem](#resource-CodeSystem) supplements and Concept Maps may be used to define relationships between concepts in different systems. ConceptMaps are assertions of the relationships between different concepts that are associated with particular contexts of use, while CodeSystem supplements are used to define inherent properties and semantics of the concepts in the code system.

> **Exam angle**
>
> - ConceptMap **maps codes from one code system to another**, e.g. local lab codes → LOINC, or SNOMED CT → ICD-10. Clients use it through the **`$translate`** operation.
> - Maps are **one way** (source → target). Never assume the reverse map is valid.
> - A mapping is only valid in its **context of use**, set by the source and target **value sets** (`source[x]`, `target[x]`).
> - Every target has an **`equivalence`**: required (`1..1`), a **modifier** (?!), with a required binding. `narrower` and `inexact` **must** have a `comment` (rule `cmd-1`).
> - **ConceptMap vs StructureMap:** ConceptMap relates *concepts*; StructureMap *transforms instances* from one structure to another.
> - **ConceptMap vs CodeSystem supplement:** a ConceptMap asserts relationships for a context; a supplement adds properties and designations to a code system.
> - **ConceptMap vs ValueSet:** a ValueSet *selects* codes; a ConceptMap *maps* between them.
> - R5 renamed `equivalence` to `relationship` (with fewer values). The exam is based on R4.

## Background and Context

Further discussion of the issues involved in mapping between concept definition systems can be found in the HL7 v3 Core Principles document and the functionality described in the OMG CTS 2 specification.

This resource is referenced by itself (through `group.unmapped.url`, which points to another ConceptMap to use for unmapped codes).

## Structure

<div class="structure-table">

| Name | Flags | Card. | Type | Description & Constraints |
|---|---|---|---|---|
| ![Resource](img/fhir/icon_resource.png) **[ConceptMap](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap)** | [I](https://hl7.org/fhir/R4/conformance-rules.html#constraints) [TU](https://hl7.org/fhir/R4/versions.html#std-process) |  | [DomainResource](https://hl7.org/fhir/R4/domainresource.html) | A map from one set of concepts to one or more other concepts<br>+ Warning: Name should be usable as an identifier for the module by machine processing applications such as code generation<br>Elements defined in Ancestors: [id](https://hl7.org/fhir/R4/resource.html#Resource), [meta](https://hl7.org/fhir/R4/resource.html#Resource), [implicitRules](https://hl7.org/fhir/R4/resource.html#Resource), [language](https://hl7.org/fhir/R4/resource.html#Resource), [text](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [contained](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [extension](https://hl7.org/fhir/R4/domainresource.html#DomainResource), [modifierExtension](https://hl7.org/fhir/R4/domainresource.html#DomainResource) |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [url](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.url) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) | Canonical identifier for this concept map, represented as a URI (globally unique) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [identifier](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.identifier) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [Identifier](https://hl7.org/fhir/R4/datatypes.html#Identifier) | Additional identifier for the concept map |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [version](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.version) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Business version of the concept map |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [name](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.name) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) [I](https://hl7.org/fhir/R4/conformance-rules.html#constraints) | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Name for this concept map (computer friendly) |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [title](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.title) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Name for this concept map (human friendly) |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [status](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.status) | [?!](https://hl7.org/fhir/R4/conformance-rules.html#isModifier) [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 1..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | draft \| active \| retired \| unknown<br>[PublicationStatus](https://hl7.org/fhir/R4/valueset-publication-status.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [experimental](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.experimental) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [boolean](https://hl7.org/fhir/R4/datatypes.html#boolean) | For testing purposes, not real usage |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [date](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.date) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [dateTime](https://hl7.org/fhir/R4/datatypes.html#dateTime) | Date last changed |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [publisher](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.publisher) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Name of the publisher (organization or individual) |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [contact](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.contact) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [ContactDetail](https://hl7.org/fhir/R4/metadatatypes.html#ContactDetail) | Contact details for the publisher |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [description](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.description) |  | 0..1 | [markdown](https://hl7.org/fhir/R4/datatypes.html#markdown) | Natural language description of the concept map |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [useContext](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.useContext) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [UsageContext](https://hl7.org/fhir/R4/metadatatypes.html#UsageContext) | The context that the content is intended to support |
| &emsp;![Complex type](img/fhir/icon_datatype.gif) [jurisdiction](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.jurisdiction) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..* | [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Intended jurisdiction for concept map (if applicable)<br>[Jurisdiction](https://hl7.org/fhir/R4/valueset-jurisdiction.html) ([Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible)) |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [purpose](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.purpose) |  | 0..1 | [markdown](https://hl7.org/fhir/R4/datatypes.html#markdown) | Why this concept map is defined |
| &emsp;![Primitive type](img/fhir/icon_primitive.png) [copyright](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.copyright) |  | 0..1 | [markdown](https://hl7.org/fhir/R4/datatypes.html#markdown) | Use and/or publishing restrictions |
| &emsp;![Choice of types](img/fhir/icon_choice.gif) [source[x]](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.source_x_) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 |  | The source value set that contains the concepts that are being mapped |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) sourceUri |  |  | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) |  |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) sourceCanonical |  |  | [canonical](https://hl7.org/fhir/R4/datatypes.html#canonical)([ValueSet](https://hl7.org/fhir/R4/valueset.html)) |  |
| &emsp;![Choice of types](img/fhir/icon_choice.gif) [target[x]](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.target_x_) | [Σ](https://hl7.org/fhir/R4/elementdefinition-definitions.html#ElementDefinition.isSummary) | 0..1 |  | The target value set which provides context for the mappings |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) targetUri |  |  | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) |  |
| &emsp;&emsp;![Reference](img/fhir/icon_reference.png) targetCanonical |  |  | [canonical](https://hl7.org/fhir/R4/datatypes.html#canonical)([ValueSet](https://hl7.org/fhir/R4/valueset.html)) |  |
| &emsp;![Backbone element](img/fhir/icon_element.gif) [group](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group) |  | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | Same source and target systems |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [source](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.source) |  | 0..1 | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) | Source system where concepts to be mapped are defined |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [sourceVersion](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.sourceVersion) |  | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Specific version of the code system |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [target](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.target) |  | 0..1 | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) | Target system that the concepts are to be mapped to |
| &emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [targetVersion](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.targetVersion) |  | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Specific version of the code system |
| &emsp;&emsp;![Backbone element](img/fhir/icon_element.gif) [element](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element) |  | 1..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | Mappings for a concept from the source set |
| &emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [code](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.code) |  | 0..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | Identifies element being mapped |
| &emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [display](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.display) |  | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Display for the code |
| &emsp;&emsp;&emsp;![Backbone element](img/fhir/icon_element.gif) [target](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target) | [I](https://hl7.org/fhir/R4/conformance-rules.html#constraints) | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | Concept in target system for element<br>+ Rule: If the map is narrower or inexact, there SHALL be some comments |
| &emsp;&emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [code](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.code) |  | 0..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | Code that identifies the target element |
| &emsp;&emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [display](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.display) |  | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Display for the code |
| &emsp;&emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [equivalence](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.equivalence) | [?!](https://hl7.org/fhir/R4/conformance-rules.html#isModifier) | 1..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | relatedto \| equivalent \| equal \| wider \| subsumes \| narrower \| specializes \| inexact \| unmatched \| disjoint<br>[ConceptMapEquivalence](https://hl7.org/fhir/R4/valueset-concept-map-equivalence.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |
| &emsp;&emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [comment](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.comment) | [I](https://hl7.org/fhir/R4/conformance-rules.html#constraints) | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Description of status/issues in mapping |
| &emsp;&emsp;&emsp;&emsp;![Backbone element](img/fhir/icon_element.gif) [dependsOn](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.dependsOn) |  | 0..* | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | Other elements required for this mapping (from context) |
| &emsp;&emsp;&emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [property](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.dependsOn.property) |  | 1..1 | [uri](https://hl7.org/fhir/R4/datatypes.html#uri) | Reference to property mapping depends on |
| &emsp;&emsp;&emsp;&emsp;&emsp;![Reference](img/fhir/icon_reference.png) [system](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.dependsOn.system) |  | 0..1 | [canonical](https://hl7.org/fhir/R4/datatypes.html#canonical)([CodeSystem](https://hl7.org/fhir/R4/codesystem.html)) | Code System (if necessary) |
| &emsp;&emsp;&emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [value](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.dependsOn.value) |  | 1..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Value of the referenced element |
| &emsp;&emsp;&emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [display](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.dependsOn.display) |  | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Display for the code (if value is a code) |
| &emsp;&emsp;&emsp;&emsp;![Reuse](img/fhir/icon_reuse.png) [product](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.product) |  | 0..* | see [dependsOn](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.element.target.dependsOn) | Other concepts that this mapping also produces |
| &emsp;&emsp;![Backbone element](img/fhir/icon_element.gif) [unmapped](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.unmapped) | [I](https://hl7.org/fhir/R4/conformance-rules.html#constraints) | 0..1 | [BackboneElement](https://hl7.org/fhir/R4/backboneelement.html) | What to do when there is no mapping for the source concept<br>+ Rule: If the mode is 'fixed', a code must be provided<br>+ Rule: If the mode is 'other-map', a url must be provided |
| &emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [mode](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.unmapped.mode) |  | 1..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | provided \| fixed \| other-map<br>[ConceptMapGroupUnmappedMode](https://hl7.org/fhir/R4/valueset-conceptmap-unmapped-mode.html) ([Required](https://hl7.org/fhir/R4/terminologies.html#required)) |
| &emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [code](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.unmapped.code) |  | 0..1 | [code](https://hl7.org/fhir/R4/datatypes.html#code) | Fixed code when mode = fixed |
| &emsp;&emsp;&emsp;![Primitive type](img/fhir/icon_primitive.png) [display](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.unmapped.display) |  | 0..1 | [string](https://hl7.org/fhir/R4/datatypes.html#string) | Display for the code |
| &emsp;&emsp;&emsp;![Reference](img/fhir/icon_reference.png) [url](https://hl7.org/fhir/R4/conceptmap-definitions.html#ConceptMap.group.unmapped.url) |  | 0..1 | [canonical](https://hl7.org/fhir/R4/datatypes.html#canonical)([ConceptMap](https://hl7.org/fhir/R4/conceptmap.html)) | canonical reference to an additional ConceptMap to use for mapping if the source concept is unmapped |

</div>

Things to notice in this table:

- **Only `status` is required at the top level.** Inside, each `group` needs at least one `element` (`1..*`), each `target` needs an `equivalence` (`1..1`), and `unmapped` needs a `mode`.
- **The nesting is the mapping:** `group` (one source system → one target system) → `element` (a source code) → `target` (a target code with its equivalence).
- **`source[x]` / `target[x]`** are the *value sets* that set the context. **`group.source` / `group.target`** are the *code systems* the codes come from. Don't mix them up.
- **Two modifiers:** `status` and `target.equivalence`. An equivalence of `unmatched` or `disjoint` turns a target into a statement that there is *no* match.
- **`product`** reuses the structure of `dependsOn` (the reuse icon): it lists other concepts the mapping also produces.
- **The metadata block** (`url`, `version`, `name`, `title`, `status`, `experimental`, `date`, `publisher`, `contact`, `description`, `useContext`, `jurisdiction`, `purpose`, `copyright`) is the same on every conformance and terminology resource (CodeSystem, ValueSet, StructureDefinition…).

### The equivalence codes

| Code | Meaning (source → target) |
|---|---|
| `relatedto` | The concepts are related, but the exact relationship isn't known |
| `equivalent` | Same meaning (may differ in minor ways, e.g. wording) |
| `equal` | Exactly the same, including definitions |
| `wider` | The target is **broader** than the source |
| `subsumes` | The target subsumes (is a parent of) the source |
| `narrower` | The target is **narrower** than the source. **A comment is required.** |
| `specializes` | The target specializes the source |
| `inexact` | The concepts overlap but aren't the same. **A comment is required.** |
| `unmatched` | There is no match for the source concept in the target |
| `disjoint` | The concepts are explicitly unrelated |

### Terminology bindings

<div class="spec-table">

| Path | Definition | Type | Reference |
|---|---|---|---|
| ConceptMap.status | The lifecycle status of an artifact. | [Required](https://hl7.org/fhir/R4/terminologies.html#required) | [PublicationStatus](https://hl7.org/fhir/R4/valueset-publication-status.html) |
| ConceptMap.jurisdiction | Countries and regions within which this artifact is targeted for use. | [Extensible](https://hl7.org/fhir/R4/terminologies.html#extensible) | [Jurisdiction ValueSet](https://hl7.org/fhir/R4/valueset-jurisdiction.html) |
| ConceptMap.group.element.target.equivalence | The degree of equivalence between concepts. | [Required](https://hl7.org/fhir/R4/terminologies.html#required) | [ConceptMapEquivalence](https://hl7.org/fhir/R4/valueset-concept-map-equivalence.html) |
| ConceptMap.group.unmapped.mode | Defines which action to take if there is no match in the group. | [Required](https://hl7.org/fhir/R4/terminologies.html#required) | [ConceptMapGroupUnmappedMode](https://hl7.org/fhir/R4/valueset-conceptmap-unmapped-mode.html) |

</div>

### Constraints

<div class="spec-table">

| id | Level | Location | Description | [Expression](https://hl7.org/fhir/R4/fhirpath.html) |
|---|---|---|---|---|
| cmd-0 | [Warning](https://hl7.org/fhir/R4/conformance-rules.html#warning) | (base) | Name should be usable as an identifier for the module by machine processing applications such as code generation | name.matches('[A-Z]([A-Za-z0-9_]){0,254}') |
| cmd-1 | [Rule](https://hl7.org/fhir/R4/conformance-rules.html#rule) | ConceptMap.group.element.target | If the map is narrower or inexact, there SHALL be some comments | comment.exists() or equivalence.empty() or ((equivalence != 'narrower') and (equivalence != 'inexact')) |
| cmd-2 | [Rule](https://hl7.org/fhir/R4/conformance-rules.html#rule) | ConceptMap.group.unmapped | If the mode is 'fixed', a code must be provided | (mode = 'fixed') implies code.exists() |
| cmd-3 | [Rule](https://hl7.org/fhir/R4/conformance-rules.html#rule) | ConceptMap.group.unmapped | If the mode is 'other-map', a url must be provided | (mode = 'other-map') implies url.exists() |

</div>

## Example

Mapping two local lab codes to LOINC:

```json
{
  "resourceType": "ConceptMap",
  "url": "http://hospital.example.org/fhir/ConceptMap/local-lab-to-loinc",
  "name": "LocalLabToLoinc",
  "status": "active",
  "sourceUri": "http://hospital.example.org/fhir/ValueSet/local-lab-codes",
  "targetUri": "http://loinc.org/vs",
  "group": [{
    "source": "http://hospital.example.org/lab-codes",
    "target": "http://loinc.org",
    "element": [
      {
        "code": "GLU",
        "display": "Glucose",
        "target": [{ "code": "2345-7", "display": "Glucose [Mass/volume] in Serum or Plasma", "equivalence": "equivalent" }]
      },
      {
        "code": "HB",
        "display": "Haemoglobin",
        "target": [{
          "code": "718-7",
          "display": "Hemoglobin [Mass/volume] in Blood",
          "equivalence": "narrower",
          "comment": "The local code covers any specimen; the LOINC code is for whole blood only."
        }]
      }
    ]
  }]
}
```

`http://loinc.org/vs` is the implicit "all codes" value set for LOINC mentioned in Scope and Usage. The `narrower` mapping has a `comment`, as rule `cmd-1` requires.

Asking a terminology server to translate a code:

```
GET [base]/ConceptMap/$translate?url=http://hospital.example.org/fhir/ConceptMap/local-lab-to-loinc&system=http://hospital.example.org/lab-codes&code=GLU
```

The server answers with a `Parameters` resource: `result` (true if a match was found), `message`, and one `match` per target, with its `equivalence` and `concept` (the target Coding).

## Notes

- The value of the system, version and code elements are the same as used by the [Coding](https://hl7.org/fhir/R4/datatypes.html#Coding) data type.
- When a mapping equivalence is characterized as "narrower", some explanation of the scope difference SHALL be provided in the comments.
- The concept map is a statement of mapping in a single direction. The existence of a matching mapping in the reverse direction cannot be assumed to exist automatically, but only through human review.
- For simplicity, it is better if there is only one element for each source concept. If there is more than one, then just as one element can have multiple targets, multiple occurrences of element with the same element.code simply aggregate their target elements as if there was only one element.

## Grouping Mappings

The concept mappings in element are arranged into groups that share common source/target systems. These groups have no semantic significance; they exist to make the representation more concise. Concept maps may contain more than one group with the same source and target - this would be a less concise representation but may be useful in order to maintain a fixed order for the concepts that are mapped.

Concepts that are labeled as 'unmatched' are considered to be unmatched in the target value set, irrespective of whether they are contained in a group with a stated target system or not. Groups that contain no target system may only contain 'unmatched' concepts. There is no difference in the meaning of an unmatched target whether or not there is a stated target system.

## Mapping Dependencies

In the simple case, a mapping is made from one code to another. E.g. from "home address" in one code system to "address - home" in another. But in other cases, the mapping is not a simple one to one mapping. A typical example might be mapping between a radiology imaging request that has 2 elements: modality, and body site, and another radiology imaging request that pre-coordinates both of these into a single code modality+body site. In this case, it is not possible to map from one code to another. Instead, the mapping might contain entries like this:

| Source Concept | DependsOn.property | DependsOn Concept | Target Concept |
|---|---|---|---|
| X-Ray | Bodysite | Chest | Chest-XRay |

When attempting to translate the source to the target, an application must also provide a value for the element identified in `dependsOn.property` so that the correct mapping can be performed. To support the reverse operation, `product` is the converse, and works in reverse.

To see a real example of a mapping with dependencies, check the [Specimen Type Mapping](https://hl7.org/fhir/R4/conceptmap-example-specimen-type.html).

## Handling Unmapped Codes

If there is no explicit mapping for a code - that is, the engine processing the ConceptMap finds a group with a matching source system, but not matching element for the code it is translating, processing proceeds to the `unmapped` element that specifies what should happen.

The unmapped element can specify one of the following different actions to take if there is no mapping for a concept:

| Mode | What happens |
|---|---|
| `provided` | Use the code source as provided in the `$translate` request. This is especially useful for translations between versions of the same code system, where only a few codes have changed. |
| `fixed` | Use the code (and display) explicitly provided in the `group.unmapped`. This is useful when there's a fall back general code - especially for classifications. |
| `other-map` | Use the map identified by the canonical URL in `url`. This is useful when a published concept map needs to be varied for a few specific cases on an institutional basis - the institution can create a simple concept map that expresses their special cases, and then refer to the general purpose mappings. |

Note that this element is not used when there is an element with a matching code value, and an equivalence value of `unmatched` (or `disjoint`).

## Implicit Code Systems

The ConceptMap resource is intended to map between concepts defined in a code system. It can also be useful to use the ConceptMap resource to define relationships between concepts defined in other kinds of resources. Here are some common kinds of conceptual maps:

- Between two elements in different structure definitions (e.g. between CDA and FHIR v2)
- Between a code system and a Medication resource

Though these resources are not explicitly defining code systems, they do define 'concepts' that can still usefully be treated as code systems for the sake of subsetting (e.g. ValueSet) and defining relationships (e.g. ConceptMap). See [Implicit Code Systems](https://hl7.org/fhir/R4/codesystem.html#implicit) for further information.

Note that this is different from StructureMap because that is intended to define an executional transform between structures, not a conceptual model.

## Search Parameters

Search parameters for this resource. The [common parameters](https://hl7.org/fhir/R4/search.html#all) also apply. See [Searching](https://hl7.org/fhir/R4/search.html) for more information about searching in REST, messaging, and services.

<div class="spec-table">

| Name | Type | Description | Expression | In Common |
|---|---|---|---|---|
| context | [token](https://hl7.org/fhir/R4/search.html#token) | A use context assigned to the concept map | (ConceptMap.useContext.value as CodeableConcept) |   |
| context-quantity | [quantity](https://hl7.org/fhir/R4/search.html#quantity) | A quantity- or range-valued use context assigned to the concept map | (ConceptMap.useContext.value as Quantity) \| (ConceptMap.useContext.value as Range) |   |
| context-type | [token](https://hl7.org/fhir/R4/search.html#token) | A type of use context assigned to the concept map | ConceptMap.useContext.code |   |
| context-type-quantity | [composite](https://hl7.org/fhir/R4/search.html#composite) | A use context type and quantity- or range-based value assigned to the concept map | On ConceptMap.useContext:<br>context-type: code<br>context-quantity: value.as(Quantity) \| value.as(Range) |   |
| context-type-value | [composite](https://hl7.org/fhir/R4/search.html#composite) | A use context type and value assigned to the concept map | On ConceptMap.useContext:<br>context-type: code<br>context: value.as(CodeableConcept) |   |
| date | [date](https://hl7.org/fhir/R4/search.html#date) | The concept map publication date | ConceptMap.date |   |
| dependson | [uri](https://hl7.org/fhir/R4/search.html#uri) | Reference to property mapping depends on | ConceptMap.group.element.target.dependsOn.property |   |
| description | [string](https://hl7.org/fhir/R4/search.html#string) | The description of the concept map | ConceptMap.description |   |
| identifier | [token](https://hl7.org/fhir/R4/search.html#token) | External identifier for the concept map | ConceptMap.identifier |   |
| jurisdiction | [token](https://hl7.org/fhir/R4/search.html#token) | Intended jurisdiction for the concept map | ConceptMap.jurisdiction |   |
| name | [string](https://hl7.org/fhir/R4/search.html#string) | Computationally friendly name of the concept map | ConceptMap.name |   |
| other | [reference](https://hl7.org/fhir/R4/search.html#reference) | canonical reference to an additional ConceptMap to use for mapping if the source concept is unmapped | ConceptMap.group.unmapped.url<br>([ConceptMap](https://hl7.org/fhir/R4/conceptmap.html)) |   |
| product | [uri](https://hl7.org/fhir/R4/search.html#uri) | Reference to property mapping depends on | ConceptMap.group.element.target.product.property |   |
| publisher | [string](https://hl7.org/fhir/R4/search.html#string) | Name of the publisher of the concept map | ConceptMap.publisher |   |
| source | [reference](https://hl7.org/fhir/R4/search.html#reference) | The source value set that contains the concepts that are being mapped | (ConceptMap.source as canonical)<br>([ValueSet](https://hl7.org/fhir/R4/valueset.html)) |   |
| source-code | [token](https://hl7.org/fhir/R4/search.html#token) | Identifies element being mapped | ConceptMap.group.element.code |   |
| source-system | [uri](https://hl7.org/fhir/R4/search.html#uri) | Source system where concepts to be mapped are defined | ConceptMap.group.source |   |
| source-uri | [reference](https://hl7.org/fhir/R4/search.html#reference) | The source value set that contains the concepts that are being mapped | (ConceptMap.source as uri)<br>([ValueSet](https://hl7.org/fhir/R4/valueset.html)) |   |
| status | [token](https://hl7.org/fhir/R4/search.html#token) | The current status of the concept map | ConceptMap.status |   |
| target | [reference](https://hl7.org/fhir/R4/search.html#reference) | The target value set which provides context for the mappings | (ConceptMap.target as canonical)<br>([ValueSet](https://hl7.org/fhir/R4/valueset.html)) |   |
| target-code | [token](https://hl7.org/fhir/R4/search.html#token) | Code that identifies the target element | ConceptMap.group.element.target.code |   |
| target-system | [uri](https://hl7.org/fhir/R4/search.html#uri) | Target system that the concepts are to be mapped to | ConceptMap.group.target |   |
| target-uri | [reference](https://hl7.org/fhir/R4/search.html#reference) | The target value set which provides context for the mappings | (ConceptMap.target as uri)<br>([ValueSet](https://hl7.org/fhir/R4/valueset.html)) |   |
| title | [string](https://hl7.org/fhir/R4/search.html#string) | The human-friendly name of the concept map | ConceptMap.title |   |
| url | [uri](https://hl7.org/fhir/R4/search.html#uri) | The uri that identifies the concept map | ConceptMap.url |   |
| version | [token](https://hl7.org/fhir/R4/search.html#token) | The business version of the concept map | ConceptMap.version |   |

</div>

Example searches:

```
GET [base]/ConceptMap?source-system=http://hospital.example.org/lab-codes&target-system=http://loinc.org
GET [base]/ConceptMap?source-code=GLU&status=active
GET [base]/ConceptMap?url=http://hospital.example.org/fhir/ConceptMap/local-lab-to-loinc
```

For a step-by-step guide to reading the structure table, see [How to read a resource definition](#core-reading-resource), and for code systems and value sets, [ValueSet and CodeSystem](#core-valueset-codesystem).
