> **In this article:** [Why coded data matters](#why) · [code, Coding, CodeableConcept](#datatypes) · [CodeSystem](#codesystem) · [ValueSet](#valueset) · [Bindings](#bindings) · [Worked example](#walkthrough) · [Terminology operations](#operations) · [Validation errors](#errors) · [Cheat sheet](#cheatsheet) · [References](#references) · [Quiz](#res-quiz)

<h2 id="why">Why coded data matters</h2>

A clinician can read "high blood pressure", "HTN" and "hypertensive disorder" and know they mean the same thing. A computer can't. FHIR solves this by carrying **codes from shared terminologies** alongside (or instead of) free text, so that a receiving system can search, count, trigger decision support and exchange data without guessing.

Three pieces work together, and the exam tests all three:

| Piece | Question it answers | FHIR artefact |
|---|---|---|
| **Code system** | Which codes exist, and what does each one mean? | [CodeSystem](https://hl7.org/fhir/R4/codesystem.html) resource (or an external terminology such as SNOMED CT or LOINC) |
| **Value set** | Which codes may be used *here*? | [ValueSet](https://hl7.org/fhir/R4/valueset.html) resource |
| **Binding** | How strictly must this element use that value set? | The `binding` on an element definition, with a [strength](https://hl7.org/fhir/R4/terminologies.html#strength) |

And the data itself carries the code in one of three [data types](https://hl7.org/fhir/R4/datatypes.html): `code`, `Coding` or `CodeableConcept`.

The full background is in the spec's [Using Codes in Resources](https://hl7.org/fhir/R4/terminologies.html) page, which is worth reading in full before the exam.

<h2 id="datatypes">Three ways to carry a code</h2>

| Data type | What it holds | Typical use | Example element |
|---|---|---|---|
| [`code`](https://hl7.org/fhir/R4/datatypes.html#code) | Just the code (a string). The code system is **implied** by the element's binding. | Fixed lists defined by FHIR itself, almost always with a **required** binding | `Patient.gender`, `Observation.status` |
| [`Coding`](https://hl7.org/fhir/R4/datatypes.html#Coding) | One code **with** its system | A single code where the system must be explicit | `Encounter.class`, `Meta.tag` |
| [`CodeableConcept`](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept) | Zero or more `Coding`s **plus** optional text | Clinical concepts, which may be coded in several systems, or not coded at all | `Condition.code`, `Observation.code`, `Patient.maritalStatus` |

### `code`

A `code` is a primitive string with no spaces at the start or end. It carries no `system`, so it only has meaning through the element's binding:

```json
"gender": "female",
"status": "final"
```

```xml
<gender value="female"/>
<status value="final"/>
```

Codes are **case-sensitive** unless the code system says otherwise: `Female` is not a valid gender code.

### `Coding`

The official structure (from the [data types page](https://hl7.org/fhir/R4/datatypes.html#Coding)):

![Coding structure in the FHIR R4 specification](img/spec/coding-structure.png)

| Element | Meaning | Rules to remember |
|---|---|---|
| `system` | The URI of the **code system** that defines the code | Must be the code system URL, **never a value set URL**. Use the URIs listed in [Code systems](https://hl7.org/fhir/R4/terminologies-systems.html) (e.g. `http://loinc.org`, `http://snomed.info/sct`). |
| `version` | The version of the code system | Only needed when the meaning depends on the version |
| `code` | The symbol defined by the system | Exactly as the code system defines it, including case |
| `display` | The code system's display text for the code | Should match the code system's display; it is not a place for your own wording |
| `userSelected` | Whether a user picked this exact Coding | See [CodeableConcept](#cc-rules) |

```json
{
  "system": "http://loinc.org",
  "code": "29463-7",
  "display": "Body weight"
}
```

```xml
<coding>
  <system value="http://loinc.org"/>
  <code value="29463-7"/>
  <display value="Body weight"/>
</coding>
```

All elements of `Coding` are optional (`0..1`), but a Coding without a `system` is close to meaningless: validators warn about it, and most profiles require it.

### `CodeableConcept`

The official structure (from the [data types page](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept)):

![CodeableConcept structure in the FHIR R4 specification](img/spec/codeableconcept-structure.png)

A `CodeableConcept` has just two elements:

- `coding` (`0..*`): one or more Codings that **all represent the same concept**, for example the same diagnosis in SNOMED CT and ICD-10.
- `text` (`0..1`): the concept as the user saw, selected or typed it. The spec describes it as "a human language representation of the concept as seen/selected/uttered by the user".

```json
"code": {
  "coding": [
    {
      "system": "http://snomed.info/sct",
      "code": "38341003",
      "display": "Hypertensive disorder, systemic arterial (disorder)",
      "userSelected": true
    },
    {
      "system": "http://hl7.org/fhir/sid/icd-10",
      "code": "I10",
      "display": "Essential (primary) hypertension"
    }
  ],
  "text": "High blood pressure"
}
```

```xml
<code>
  <coding>
    <system value="http://snomed.info/sct"/>
    <code value="38341003"/>
    <display value="Hypertensive disorder, systemic arterial (disorder)"/>
    <userSelected value="true"/>
  </coding>
  <coding>
    <system value="http://hl7.org/fhir/sid/icd-10"/>
    <code value="I10"/>
    <display value="Essential (primary) hypertension"/>
  </coding>
  <text value="High blood pressure"/>
</code>
```

<h4 id="cc-rules">Rules for CodeableConcept</h4>

1. **`coding` is always an array** in JSON, even with one Coding. In XML each Coding is a repeated `<coding>` element.
2. **All codings mean the same thing.** Use several codings for *translations* of one concept into different code systems, never to send two different concepts. Two different diagnoses are two Conditions; two categories are two `category` CodeableConcepts.
3. **The order of codings has no meaning.** To say which code the user actually picked, set `userSelected: true` on that Coding.
4. **`text` is recommended** and is the only place for the user's original wording. It can be used on its own when no code fits and the binding allows it.
5. **Element order in XML** follows the data type definition: inside `<coding>` it is `system`, `version`, `code`, `display`, `userSelected`; inside the CodeableConcept, all `<coding>` elements come before `<text>`.
6. **No empty elements:** an empty `coding` array or `"text": ""` is invalid.

### Quantity, a coded unit

[`Quantity`](https://hl7.org/fhir/R4/datatypes.html#Quantity) carries a unit as a code too: `system` + `code`, normally from [UCUM](https://hl7.org/fhir/R4/ucum.html) (`http://unitsofmeasure.org`). `unit` is only the human-readable unit.

```json
"valueQuantity": { "value": 72.5, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" }
```

<h2 id="codesystem">CodeSystem: where codes are defined</h2>

A [CodeSystem](https://hl7.org/fhir/R4/codesystem.html) declares a set of codes and their meanings. Some are published as FHIR resources in full (most HL7-defined ones); large external terminologies such as SNOMED CT and LOINC are owned by other organisations, and FHIR only fixes the URI you must use for them.

| Code system | `system` URI | Owner | Notes |
|---|---|---|---|
| SNOMED CT | `http://snomed.info/sct` | SNOMED International | See [Using SNOMED CT with FHIR](https://hl7.org/fhir/R4/snomedct.html) |
| LOINC | `http://loinc.org` | Regenstrief Institute | See [Using LOINC with FHIR](https://hl7.org/fhir/R4/loinc.html) |
| UCUM | `http://unitsofmeasure.org` | Regenstrief Institute | Units of measure, case-sensitive; [Using UCUM](https://hl7.org/fhir/R4/ucum.html) |
| RxNorm | `http://www.nlm.nih.gov/research/umls/rxnorm` | US National Library of Medicine | US medications |
| ICD-10 | `http://hl7.org/fhir/sid/icd-10` | WHO | Classification of diagnoses |
| FHIR-defined, e.g. AdministrativeGender | `http://hl7.org/fhir/administrative-gender` | HL7 | Used with `code` elements |
| HL7 shared terminology, e.g. condition-category | `http://terminology.hl7.org/CodeSystem/condition-category` | HL7 | v2 tables, v3 code systems and shared FHIR code systems live under **terminology.hl7.org** |

The full list is in [Code systems](https://hl7.org/fhir/R4/terminologies-systems.html). Watch out for **older URLs**: some code systems that lived under `http://hl7.org/fhir/…` in STU3 moved to `http://terminology.hl7.org/CodeSystem/…` in R4, and an old URL is a different, wrong system.

Here is a real HL7 code system, from the R4 page [Condition Category Codes](https://hl7.org/fhir/R4/codesystem-condition-category.html):

![The concepts of the Condition Category code system](img/spec/codesystem-condition-category.png)

Key elements of the CodeSystem resource:

| Element | Meaning |
|---|---|
| `url` | The canonical URL: **this is the value of `Coding.system`** |
| `version`, `name`, `title`, `status` | Identification and lifecycle (`status` is required) |
| `caseSensitive` | Whether codes are case-sensitive |
| `hierarchyMeaning` | What parent/child relationships mean, e.g. `is-a` |
| `content` (required) | How much of the code system is in this resource: `not-present`, `example`, `fragment`, `complete`, `supplement` |
| `valueSet` | The canonical URL of the value set that contains every code in this code system |
| `concept` | The codes: `code`, `display`, `definition`, nested `concept` for hierarchies |

A minimal code system defined by an organisation:

```json
{
  "resourceType": "CodeSystem",
  "url": "http://hospital.example.org/fhir/CodeSystem/wound-type",
  "status": "active",
  "caseSensitive": true,
  "content": "complete",
  "concept": [
    { "code": "pressure", "display": "Pressure ulcer", "definition": "Damage to skin caused by sustained pressure." },
    { "code": "surgical", "display": "Surgical wound", "definition": "Wound created by a surgical procedure." }
  ]
}
```

For SNOMED CT or LOINC you'd typically see a CodeSystem resource with `content` = `not-present`: it describes the code system, but the codes themselves live on a terminology server.

<h2 id="valueset">ValueSet: which codes may be used here</h2>

A [ValueSet](https://hl7.org/fhir/R4/valueset.html) selects a set of codes, from one or more code systems, for a particular use. Elements are bound to **value sets**, never directly to code systems. Here is the R4 value set that `Condition.category` is bound to ([page](https://hl7.org/fhir/R4/valueset-condition-category.html)):

![The Condition Category Codes value set page in the FHIR R4 specification](img/spec/valueset-condition-category.png)

Notice the three things the page shows:

1. **The defining URL** `http://hl7.org/fhir/ValueSet/condition-category`. This is what bindings point to. It is **not** what goes in `Coding.system`.
2. **The content logical definition** ("compose"): include all codes from `http://terminology.hl7.org/CodeSystem/condition-category`.
3. **The expansion**: the actual codes (`problem-list-item`, `encounter-diagnosis`) and the system they come from.

### Definition (`compose`) versus `expansion`

| Part | What it is | Who writes it |
|---|---|---|
| [`compose`](https://hl7.org/fhir/R4/valueset.html#compositions) | The **rules**: which code systems to include or exclude, listed codes, filters, other value sets | The value set author |
| [`expansion`](https://hl7.org/fhir/R4/valueset.html#expansion) | The **result**: the list of codes the rules produce at a point in time (`timestamp` is required) | A terminology server, usually through `$expand` |

A `compose.include` (or `exclude`) entry can contain:

| Inside `include` | Effect | Example |
|---|---|---|
| `system` only | Every code in that code system | All condition-category codes |
| `system` + `concept` | Only the listed codes (an **extensional** definition) | Two specific LOINC codes |
| `system` + `filter` | Codes matching a rule (an **intensional** definition) | All SNOMED CT codes that are a kind of *Diabetes mellitus* |
| `valueSet` | All codes from another value set | Re-use an existing value set |

Filter operators include `=`, `is-a`, `descendent-of`, `is-not-a`, `regex`, `in`, `not-in`, `generalizes` and `exists`. Each code system decides which properties and operators it supports (see the SNOMED CT and LOINC pages).

An intensional value set: every SNOMED CT code for a kind of diabetes, excluding one code:

```json
{
  "resourceType": "ValueSet",
  "url": "http://hospital.example.org/fhir/ValueSet/diabetes-diagnoses",
  "status": "active",
  "compose": {
    "include": [{
      "system": "http://snomed.info/sct",
      "filter": [{ "property": "concept", "op": "is-a", "value": "73211009" }]
    }],
    "exclude": [{
      "system": "http://snomed.info/sct",
      "concept": [{ "code": "11687002", "display": "Gestational diabetes mellitus" }]
    }]
  }
}
```

The same in XML:

```xml
<ValueSet xmlns="http://hl7.org/fhir">
  <url value="http://hospital.example.org/fhir/ValueSet/diabetes-diagnoses"/>
  <status value="active"/>
  <compose>
    <include>
      <system value="http://snomed.info/sct"/>
      <filter>
        <property value="concept"/>
        <op value="is-a"/>
        <value value="73211009"/>
      </filter>
    </include>
    <exclude>
      <system value="http://snomed.info/sct"/>
      <concept>
        <code value="11687002"/>
        <display value="Gestational diabetes mellitus"/>
      </concept>
    </exclude>
  </compose>
</ValueSet>
```

An expansion, as a server would return it:

```json
"expansion": {
  "identifier": "urn:uuid:42316ff8-2714-4680-9980-f37a6d1a71bc",
  "timestamp": "2024-05-03T10:00:00+01:00",
  "total": 2,
  "contains": [
    { "system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "problem-list-item", "display": "Problem List Item" },
    { "system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "encounter-diagnosis", "display": "Encounter Diagnosis" }
  ]
}
```

### Implicit value sets

Some value sets exist without anyone writing a ValueSet resource, because their URL follows a pattern ([Implicit code systems](https://hl7.org/fhir/R4/codesystem.html#implicit), [SNOMED CT](https://hl7.org/fhir/R4/snomedct.html), [LOINC](https://hl7.org/fhir/R4/loinc.html)):

| URL | Contains |
|---|---|
| `http://loinc.org/vs` | All LOINC codes |
| `http://snomed.info/sct?fhir_vs` | All SNOMED CT concepts |
| `http://snomed.info/sct?fhir_vs=isa/73211009` | *Diabetes mellitus* and all its descendants |
| `http://snomed.info/sct?fhir_vs=refset/[refset-id]` | The members of a SNOMED CT reference set |
| A code system's `valueSet` element | The "all codes" value set for that code system |

<h2 id="bindings">Bindings: connecting an element to a value set</h2>

A **binding** says which value set an element uses and how strictly. You see it in two places on every resource page. In the structure table, at the end of the description (from [Condition](https://hl7.org/fhir/R4/condition.html)):

![The top of the Condition structure table, showing bindings after each coded element](img/spec/condition-structure-top.png)

And in the **Terminology Bindings** table underneath:

![The Terminology Bindings table for Condition](img/spec/condition-bindings.png)

### The four strengths

From [Binding Strengths](https://hl7.org/fhir/R4/terminologies.html#strength):

| Strength | The rule |
|---|---|
| [**required**](https://hl7.org/fhir/R4/terminologies.html#required) | To be conformant, the concept in this element **SHALL** be from the specified value set. |
| [**extensible**](https://hl7.org/fhir/R4/terminologies.html#extensible) | The concept **SHALL** be from the value set **if any code in it applies**. If none applies (based on human review), an alternate concept (another system/code, or text) may be used instead. |
| [**preferred**](https://hl7.org/fhir/R4/terminologies.html#preferred) | Instances are **encouraged** to use the codes, but don't have to. |
| [**example**](https://hl7.org/fhir/R4/terminologies.html#example) | The value set only **illustrates** the kind of codes intended. |

### How the rules apply to each data type

| | `code` | `Coding` / `CodeableConcept` |
|---|---|---|
| **required** | Must be one of the codes in the value set (case-sensitive) | **At least one Coding SHALL be present**, and one of the codings SHALL be from the value set. `text` is always recommended, but **is not an acceptable substitute** for the required code. |
| **extensible** | (Rare on `code`) | Use a Coding from the value set if any code applies. If nothing applies, use another code or (CodeableConcept only) text alone. |
| **preferred / example** | — | Any codes, or text, are valid; using the value set is encouraged / just an example. |

Three details the exam likes:

- **Extensible with a more general code available.** If the value set has a code that covers your concept but is *more general*, you must still send that value set code. A more specific code may be added as an **extra Coding** in the CodeableConcept, but "it cannot be used instead of the code from the value set" (spec wording).
- **Repeating elements.** A binding applies to every repetition: each `category` CodeableConcept is checked on its own.
- **Maximum value sets.** Some bindings add a maximum value set with the [elementdefinition-maxValueSet](https://hl7.org/fhir/R4/extension-elementdefinition-maxvalueset.html) extension. `Patient.communication.language` is "Preferred, but limited to AllLanguages": you may go beyond the preferred list, but not beyond the maximum.

### Bindings in profiles

[Profiles](https://hl7.org/fhir/R4/profiling.html#binding) can bind an element to a narrower value set or make a binding stricter (e.g. preferred → extensible), but they can't weaken a **required** binding. That is why an element may be `example` in the core spec but `extensible` or `required` in US Core or another IG: always check the IG's profile, not just the base resource.

<h2 id="walkthrough">Worked example: the binding chain for Condition.category</h2>

The question you'll meet over and over: *which Coding is valid for this element?* Follow the chain.

1. **Find the element and its type.** `Condition.category` is `0..*` **CodeableConcept**.
2. **Find the binding.** Extensible, to **ConditionCategoryCodes**.
3. **Open the value set.** Its URL is `http://hl7.org/fhir/ValueSet/condition-category` and it includes all codes from `http://terminology.hl7.org/CodeSystem/condition-category`.
4. **Pick the code that fits.** A diagnosis made during a visit is `encounter-diagnosis`; an item on the patient's ongoing problem list is `problem-list-item`.
5. **Write the Coding with the code system URL** as `system`, the code, and the code system's display.

```json
{
  "resourceType": "Condition",
  "clinicalStatus": {
    "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active" }]
  },
  "verificationStatus": {
    "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed" }]
  },
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/condition-category",
      "code": "encounter-diagnosis",
      "display": "Encounter Diagnosis"
    }]
  }],
  "code": {
    "coding": [{ "system": "http://snomed.info/sct", "code": "38341003", "display": "Hypertensive disorder, systemic arterial (disorder)" }],
    "text": "High blood pressure"
  },
  "subject": { "reference": "Patient/123" }
}
```

```xml
<Condition xmlns="http://hl7.org/fhir">
  <clinicalStatus>
    <coding>
      <system value="http://terminology.hl7.org/CodeSystem/condition-clinical"/>
      <code value="active"/>
    </coding>
  </clinicalStatus>
  <verificationStatus>
    <coding>
      <system value="http://terminology.hl7.org/CodeSystem/condition-ver-status"/>
      <code value="confirmed"/>
    </coding>
  </verificationStatus>
  <category>
    <coding>
      <system value="http://terminology.hl7.org/CodeSystem/condition-category"/>
      <code value="encounter-diagnosis"/>
      <display value="Encounter Diagnosis"/>
    </coding>
  </category>
  <code>
    <coding>
      <system value="http://snomed.info/sct"/>
      <code value="38341003"/>
      <display value="Hypertensive disorder, systemic arterial (disorder)"/>
    </coding>
    <text value="High blood pressure"/>
  </code>
  <subject>
    <reference value="Patient/123"/>
  </subject>
</Condition>
```

Notice:

- `clinicalStatus` and `verificationStatus` are **CodeableConcepts with required bindings**, so each needs a Coding from its value set. Text alone wouldn't do.
- `category` is an **array** of CodeableConcepts (`0..*`), each with its own `coding` array.
- `code` has an **example** binding, so any suitable code system (here SNOMED CT) is fine, and `text` keeps the clinician's wording.
- The XML follows the element order from the structure table: `clinicalStatus`, `verificationStatus`, `category`, `code`, `subject`.

<h2 id="operations">Terminology operations</h2>

A [terminology service](https://hl7.org/fhir/R4/terminology-service.html) answers questions about codes. The operations you need to know:

| Operation | Called on | Question it answers |
|---|---|---|
| [`$expand`](https://hl7.org/fhir/R4/valueset-operation-expand.html) | ValueSet | Which codes are in this value set? |
| [`$validate-code`](https://hl7.org/fhir/R4/valueset-operation-validate-code.html) | ValueSet (or CodeSystem) | Is this code (or Coding, or CodeableConcept) in the value set? |
| [`$lookup`](https://hl7.org/fhir/R4/codesystem-operation-lookup.html) | CodeSystem | What is the display, definition and properties of this code? |
| [`$subsumes`](https://hl7.org/fhir/R4/codesystem-operation-subsumes.html) | CodeSystem | Is code A a parent (or child) of code B? |
| [`$translate`](https://hl7.org/fhir/R4/conceptmap-operation-translate.html) | ConceptMap | What is the matching code in another code system? |

Examples:

```
GET [base]/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-category
GET [base]/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=isa/73211009&count=20
GET [base]/ValueSet/$validate-code?url=http://hl7.org/fhir/ValueSet/condition-category&system=http://terminology.hl7.org/CodeSystem/condition-category&code=encounter-diagnosis
GET [base]/CodeSystem/$lookup?system=http://loinc.org&code=29463-7
```

A `$validate-code` response is a `Parameters` resource with `result` (required), and optionally `message` and `display`:

```json
{
  "resourceType": "Parameters",
  "parameter": [
    { "name": "result", "valueBoolean": false },
    { "name": "message", "valueString": "The code 'Encounter-Diagnosis' was not found in the value set http://hl7.org/fhir/ValueSet/condition-category" }
  ]
}
```

These operations can be called with **GET** because they don't change data and their main inputs are simple values. To validate a whole CodeableConcept or send a value set in the request, use **POST** with a `Parameters` body.

<h2 id="errors">Validation errors you'll meet</h2>

The [FHIR validator](https://hl7.org/fhir/R4/validation.html) checks codes against bindings. The exact wording differs between validators and versions; these are the common situations and what to do:

| What the validator reports | Usual cause | Fix |
|---|---|---|
| The code is not in the value set (required binding) | A code that doesn't exist, the wrong case, or a code from the wrong code system | Use a code from the bound value set, exactly as defined |
| None of the codings are in the value set (extensible binding) | Only local codes were sent although a value set code fits | Add the value set code as a Coding (keep the local one too if useful) |
| Unknown code system, or code system not found | Misspelt URL, an STU3-era URL, or the ValueSet URL used as `system` | Use the code system URL from the value set's definition |
| Display doesn't match the code system's display (warning) | Your own wording in `display` | Use the code system's display; put your wording in `text` |
| Coding has no system (warning) | `system` left out | Add the code system URI |
| Minimum cardinality not met on a CodeableConcept | Required element missing, or an empty `coding` array | Add the element with at least one valid Coding |

Read the **severity**: errors make the resource invalid; warnings (like a display mismatch) don't, but should still be fixed.

<h2 id="cheatsheet">Cheat sheet</h2>

- `code` = just the code; `Coding` = system + code (+ display); `CodeableConcept` = codings + text.
- **`Coding.system` is always a code system URL, never a value set URL.**
- Elements bind to **value sets**; value sets draw codes from **code systems**.
- `compose` = the rules; `expansion` = the resulting list (with a required `timestamp`).
- Several codings in one CodeableConcept = **the same concept** in different systems. `userSelected` marks the one the user picked.
- **required** + CodeableConcept: at least one Coding from the value set; text alone is not enough.
- **extensible**: use the value set code whenever one applies (even a more general one); otherwise another code or text.
- **preferred** and **example** never make an instance invalid.
- Codes are case-sensitive; displays should match the code system.
- Watch for STU3-era URLs such as `http://hl7.org/fhir/condition-category`: in R4 it is `http://terminology.hl7.org/CodeSystem/condition-category`.
- `$expand` lists codes, `$validate-code` checks one, `$lookup` describes one, `$subsumes` compares two, `$translate` maps between systems.

<h2 id="references">References on the HL7 website</h2>

- [Using Codes in Resources](https://hl7.org/fhir/R4/terminologies.html), including [binding strengths](https://hl7.org/fhir/R4/terminologies.html#strength)
- [Data types: code](https://hl7.org/fhir/R4/datatypes.html#code), [Coding](https://hl7.org/fhir/R4/datatypes.html#Coding), [CodeableConcept](https://hl7.org/fhir/R4/datatypes.html#CodeableConcept), [Quantity](https://hl7.org/fhir/R4/datatypes.html#Quantity)
- [CodeSystem resource](https://hl7.org/fhir/R4/codesystem.html) and [implicit code systems](https://hl7.org/fhir/R4/codesystem.html#implicit)
- [ValueSet resource](https://hl7.org/fhir/R4/valueset.html): [compose](https://hl7.org/fhir/R4/valueset.html#compositions) and [expansion](https://hl7.org/fhir/R4/valueset.html#expansion)
- [Code systems list](https://hl7.org/fhir/R4/terminologies-systems.html), [Using SNOMED CT](https://hl7.org/fhir/R4/snomedct.html), [Using LOINC](https://hl7.org/fhir/R4/loinc.html), [Using UCUM](https://hl7.org/fhir/R4/ucum.html)
- [Terminology service](https://hl7.org/fhir/R4/terminology-service.html): [$expand](https://hl7.org/fhir/R4/valueset-operation-expand.html), [$validate-code](https://hl7.org/fhir/R4/valueset-operation-validate-code.html), [$lookup](https://hl7.org/fhir/R4/codesystem-operation-lookup.html), [$subsumes](https://hl7.org/fhir/R4/codesystem-operation-subsumes.html), [$translate](https://hl7.org/fhir/R4/conceptmap-operation-translate.html)
- [Profiling: bindings](https://hl7.org/fhir/R4/profiling.html#binding) and the [maxValueSet extension](https://hl7.org/fhir/R4/extension-elementdefinition-maxvalueset.html)
- [Condition](https://hl7.org/fhir/R4/condition.html), [Condition Category value set](https://hl7.org/fhir/R4/valueset-condition-category.html) and [code system](https://hl7.org/fhir/R4/codesystem-condition-category.html)

Related pages on this site: [Bindings and binding strength](#core-bindings) · [ValueSet and CodeSystem](#core-valueset-codesystem) · [Use terminology for a use case](#impl-terminology) · [Determine terminology for a use case](#res-terminology)

Test yourself with the 20-question quiz below.
