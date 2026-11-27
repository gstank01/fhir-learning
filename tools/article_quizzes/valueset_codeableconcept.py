"""Writes public/data/quiz/topic-core-valueset-codeableconcept.json: the 20-question quiz for the ValueSet / CodeableConcept article.

Correct option first in every question (the site shuffles them).
Usage: python3 tools/article_quizzes/valueset_codeableconcept.py public/data/quiz/topic-core-valueset-codeableconcept.json
"""
import json
import sys

B = 'https://hl7.org/fhir/R4/'
J = '```json\n'
X = '```xml\n'
E = '\n```'


def ex(title, md):
    return {'title': title, 'markdown': md}


Q = []


def q(kind, question, options, explanation, exhibit=None, ref=None):
    item = {'kind': kind, 'question': question, 'options': options, 'explanation': explanation}
    if exhibit:
        item['exhibit'] = exhibit
    if ref:
        item['ref'] = {'label': ref[0], 'url': ref[1]}
    assert len(options) == 4 and len(set(options)) == 4, question
    Q.append(item)


q('concept', 'What is the difference between a **CodeSystem** and a **ValueSet**?',
  ['A CodeSystem defines codes and their meanings; a ValueSet selects codes from one or more code systems for a particular use',
   'A ValueSet defines codes; a CodeSystem selects codes from value sets for a particular use',
   'They are the same thing: ValueSet is the newer name for CodeSystem',
   'A CodeSystem is used in `code` elements and a ValueSet in `CodeableConcept` elements'],
  'A **CodeSystem** says which codes exist and what they mean. A **ValueSet** picks the codes allowed for a purpose, and elements are bound to value sets, never directly to code systems.',
  ref=('ValueSet resource', B + 'valueset.html'))

q('screenshot', 'Refer to the exhibit from the Condition Category value set page. What value goes in `Coding.system` for a Condition category code?',
  ['`http://terminology.hl7.org/CodeSystem/condition-category`',
   '`http://hl7.org/fhir/ValueSet/condition-category`',
   '`ConditionCategoryCodes`',
   '`2.16.840.1.113883.4.642.3.162`'],
  'The page shows two URLs. The **defining URL** (`…/ValueSet/condition-category`) identifies the value set and is what bindings point to. The codes come from the **code system** `…/CodeSystem/condition-category`, and that is what goes in `Coding.system`. The name and the OID are not system URIs.',
  exhibit=ex('Condition Category Codes value set (FHIR R4)', '![Condition Category Codes value set page](img/spec/valueset-condition-category.png)'),
  ref=('Condition Category value set', B + 'valueset-condition-category.html'))

q('json', 'Which JSON is a valid `CodeableConcept`?',
  ['`{ "coding": [ { "system": "http://loinc.org", "code": "29463-7" } ], "text": "Weight" }`',
   '`{ "coding": { "system": "http://loinc.org", "code": "29463-7" }, "text": "Weight" }`',
   '`{ "system": "http://loinc.org", "code": "29463-7", "text": "Weight" }`',
   '`{ "coding": [], "text": "Weight" }`'],
  '`CodeableConcept.coding` is `0..*`, so it is always a JSON **array**, even with one Coding. `system` and `code` belong inside a Coding, not directly on the CodeableConcept. Empty arrays are never allowed in FHIR JSON; leave `coding` out instead.',
  ref=('CodeableConcept', B + 'datatypes.html#CodeableConcept'))

q('xml', 'Refer to the exhibit. What is wrong with this XML?',
  ['Primitive values must be in a `value` attribute, e.g. `<code value="active"/>`, not between tags',
   '`<coding>` must come after `<text>`',
   'The `system` must be a ValueSet URL',
   'Nothing: the XML is valid'],
  'In FHIR XML, primitive values always go in the **`value` attribute**: `<system value="…"/>`, `<code value="active"/>`. Text between the tags is invalid. Inside a CodeableConcept, `<coding>` elements come **before** `<text>`, and `system` is always a code system URL.',
  exhibit=ex('Condition.clinicalStatus in XML', X + '<clinicalStatus>\n  <coding>\n    <system>http://terminology.hl7.org/CodeSystem/condition-clinical</system>\n    <code>active</code>\n  </coding>\n</clinicalStatus>' + E),
  ref=('XML representation', B + 'xml.html'))

q('screenshot', 'Refer to the exhibit from the Condition structure table. Which element may carry a code that is **not** in its value set when nothing in the value set fits?',
  ['`category`', '`clinicalStatus`', '`verificationStatus`', 'None of them: every binding shown is required'],
  '`category` has an **Extensible** binding: use a code from ConditionCategoryCodes if one applies, otherwise another code or text. `clinicalStatus` and `verificationStatus` are **Required**: only codes from their value sets are valid.',
  exhibit=ex('Condition structure table, top (FHIR R4)', '![Top of the Condition structure table](img/spec/condition-structure-top.png)'),
  ref=('Extensible binding', B + 'terminologies.html#extensible'))

q('screenshot', 'Refer to the Terminology Bindings table for Condition. How many of the listed elements have only an **example** binding, so any suitable codes may be used?',
  ['5', '3', '4', '6'],
  '`code`, `bodySite`, `stage.summary`, `stage.type` and `evidence.code` are **Example**: five elements. `clinicalStatus` and `verificationStatus` are Required, `category` Extensible, and `severity` Preferred. Example bindings never make an instance invalid.',
  exhibit=ex('Condition Terminology Bindings (FHIR R4)', '![Terminology Bindings table for Condition](img/spec/condition-bindings.png)'),
  ref=('Binding strengths', B + 'terminologies.html#strength'))

q('json', 'Refer to the exhibit. Which codes are in the expansion of this value set?',
  ['Only `8480-6` and `8462-4`', 'Every LOINC code', '`8480-6`, `8462-4` and `85354-9`', 'No codes: a value set needs a filter to have members'],
  'An `include` with a `concept` list selects **only the listed codes** (an extensional definition). Without the `concept` list it would include every code in LOINC. A filter is just another way to select codes, not a requirement.',
  exhibit=ex('ValueSet.compose', J + '"compose": {\n  "include": [{\n    "system": "http://loinc.org",\n    "concept": [\n      { "code": "8480-6", "display": "Systolic blood pressure" },\n      { "code": "8462-4", "display": "Diastolic blood pressure" }\n    ]\n  }]\n}' + E),
  ref=('ValueSet compose', B + 'valueset.html#compositions'))

q('json', 'Refer to the exhibit. Which statement about this value set is true?',
  ['It contains Diabetes mellitus (73211009) and all its descendants, except Gestational diabetes mellitus (11687002)',
   'It contains only the two codes 73211009 and 11687002',
   'It contains every SNOMED CT code except 73211009',
   'It is invalid: `include` and `exclude` cannot be used together'],
  'The `is-a` filter makes an **intensional** definition: the concept 73211009 plus all its descendants. The `exclude` then removes 11687002. A server works out the actual list with `$expand`.',
  exhibit=ex('ValueSet.compose', J + '"compose": {\n  "include": [{\n    "system": "http://snomed.info/sct",\n    "filter": [{ "property": "concept", "op": "is-a", "value": "73211009" }]\n  }],\n  "exclude": [{\n    "system": "http://snomed.info/sct",\n    "concept": [{ "code": "11687002" }]\n  }]\n}' + E),
  ref=('ValueSet filters', B + 'valueset.html#compositions'))

q('rule', '`Condition.verificationStatus` is a CodeableConcept with a **required** binding. A system sends `"verificationStatus": { "text": "Confirmed by the specialist" }`. Is this valid?',
  ['No: with a required binding at least one Coding from the value set must be present; text alone is not a substitute',
   'Yes: `text` is always allowed instead of a Coding',
   'Yes: required bindings only apply to `code` elements',
   'No: CodeableConcept elements may never contain `text`'],
  'For a CodeableConcept with a **required** binding, "at least one Coding element SHALL be present" and one of them SHALL be from the value set. Text is recommended alongside, but is not an acceptable substitute for the code.',
  ref=('Required binding', B + 'terminologies.html#required'))

q('rule', '`Condition.category` (CodeableConcept) has an **extensible** binding. A research system needs a category that no code in the value set covers. What may it send?',
  ['Another code that fits (from any code system), or text only',
   'Nothing: the element must be left empty',
   'The closest code from the value set, even though it doesn’t apply',
   'A Coding whose `system` is the ValueSet URL'],
  'With an **extensible** binding, a code from the value set must be used **if any applies**. When none does (based on human review), an alternate concept may be used: another system/code pair, or, for a CodeableConcept, text alone. Never send a code that doesn’t actually apply.',
  ref=('Extensible binding', B + 'terminologies.html#extensible'))

q('rule', 'An element has an **extensible** binding. The value set contains a code that covers your concept but is more general; you also have a more specific SNOMED CT code. What does the spec require?',
  ['Send the value set code; the more specific code may be added as an extra Coding, but not used instead of it',
   'Send only the more specific SNOMED CT code',
   'Send only text, because neither code is exact',
   'Send whichever code the user picked'],
  'The spec says that if an applicable but more general concept exists in the extensibly bound value set, "the code that is used in the instance SHALL be taken from the value set". A more specific code "may also be included … as an additional Coding … but it cannot be used instead of the code from the value set".',
  ref=('Extensible binding', B + 'terminologies.html#extensible'))

q('concept', 'A CodeableConcept contains two Codings: a SNOMED CT code and an ICD-10 code. What does this mean?',
  ['Both codes represent the same concept in different code systems',
   'The patient has two different conditions',
   'The first code is the diagnosis and the second the reason',
   'The second Coding replaces the first'],
  'All Codings in one CodeableConcept represent the **same concept**, typically as translations into different code systems. Their order carries no meaning. Two different concepts need two separate CodeableConcepts or resources.',
  ref=('CodeableConcept', B + 'datatypes.html#CodeableConcept'))

q('concept', 'What does `Coding.userSelected: true` indicate?',
  ['The user picked this exact Coding (e.g. from a pick list), as opposed to codes added by translation',
   'The code is the preferred code in the value set',
   'The user typed the code by hand into `display`',
   'The Coding must be shown first in user interfaces'],
  '`userSelected` marks the Coding that was chosen directly by the user. Other Codings in the CodeableConcept may have been added by mapping or translation. Order of codings has no meaning, so this flag is how you tell which one was chosen.',
  ref=('Coding', B + 'datatypes.html#Coding'))

q('url', 'Which request asks a terminology server for the codes in the Condition Category value set?',
  ['`GET [base]/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-category`',
   '`GET [base]/CodeSystem/$expand?url=http://hl7.org/fhir/ValueSet/condition-category`',
   '`GET [base]/ValueSet/$lookup?url=http://hl7.org/fhir/ValueSet/condition-category`',
   '`GET [base]/ValueSet?expand=http://hl7.org/fhir/ValueSet/condition-category`'],
  '`$expand` is an operation on **ValueSet**, called with the `$` prefix; `url` identifies the value set. `$lookup` is a CodeSystem operation for one code, and `expand` is not a search parameter.',
  ref=('$expand', B + 'valueset-operation-expand.html'))

q('response', 'Refer to the exhibit, a response to `$validate-code`. What does it tell the client?',
  ['The code is not valid in the value set; `message` explains why',
   'The code is valid, and `message` is the code’s display',
   'The server failed and the request should be retried',
   'The value set could not be found'],
  '`$validate-code` returns a **Parameters** resource with `result` (required) and optionally `message` and `display`. `result: false` means the code is not valid in the value set. Here the code’s case is wrong: codes are case-sensitive.',
  exhibit=ex('$validate-code response', J + '{\n  "resourceType": "Parameters",\n  "parameter": [\n    { "name": "result", "valueBoolean": false },\n    { "name": "message", "valueString": "The code \'Encounter-Diagnosis\' was not found in the value set http://hl7.org/fhir/ValueSet/condition-category" }\n  ]\n}' + E),
  ref=('$validate-code', B + 'valueset-operation-validate-code.html'))

q('concept', 'Which operation returns the display, definition and properties of a single code, e.g. LOINC `29463-7`?',
  ['`$lookup` on CodeSystem', '`$expand` on ValueSet', '`$subsumes` on CodeSystem', '`$translate` on ConceptMap'],
  '`GET [base]/CodeSystem/$lookup?system=http://loinc.org&code=29463-7` returns details about one code. `$expand` lists a value set’s codes, `$subsumes` tests whether one code is a parent of another, and `$translate` maps a code to another code system.',
  ref=('$lookup', B + 'codesystem-operation-lookup.html'))

q('url', 'Which URL identifies the implicit value set that contains **all** LOINC codes?',
  ['`http://loinc.org/vs`', '`http://loinc.org`', '`http://hl7.org/fhir/ValueSet/loinc`', '`urn:oid:2.16.840.1.113883.6.1`'],
  'LOINC defines implicit value sets: `http://loinc.org/vs` contains every LOINC code. `http://loinc.org` is the **code system** URI used in `Coding.system`, and the OID is LOINC’s OID, not a FHIR value set URL.',
  ref=('Using LOINC with FHIR', B + 'loinc.html'))

q('url', 'A profile needs a value set of SNOMED CT concept 73211009 (Diabetes mellitus) and all its descendants, without writing a ValueSet resource. Which URL can it use?',
  ['`http://snomed.info/sct?fhir_vs=isa/73211009`', '`http://snomed.info/sct/73211009`', '`http://snomed.info/sct?code=73211009&descendants=true`', '`http://hl7.org/fhir/ValueSet/73211009`'],
  'SNOMED CT implicit value sets use the base URL plus a `fhir_vs` query: `?fhir_vs=isa/[sctid]` means the concept and all its descendants, `?fhir_vs=refset/[sctid]` the members of a reference set, and `?fhir_vs` on its own all concepts.',
  ref=('Using SNOMED CT with FHIR', B + 'snomedct.html'))

q('concept', 'A CodeSystem resource for SNOMED CT has `"content": "not-present"`. What does this mean?',
  ['The resource describes the code system, but its codes are not included in the resource',
   'The code system has no codes',
   'The code system has been retired',
   'Only some example codes are included'],
  '`CodeSystem.content` says how much of the code system the resource carries: `not-present`, `example`, `fragment`, `complete` or `supplement`. Large external terminologies are usually `not-present`; their codes are available from a terminology server.',
  ref=('CodeSystem resource', B + 'codesystem.html'))

q('json', 'An Observation records a dose of 5 mg. Which `valueQuantity` uses a coded unit correctly?',
  ['`{ "value": 5, "unit": "mg", "system": "http://unitsofmeasure.org", "code": "mg" }`',
   '`{ "value": 5, "unit": "mg", "system": "http://unitsofmeasure.org", "code": "milligram" }`',
   '`{ "value": "5", "unit": "mg", "system": "http://unitsofmeasure.org", "code": "mg" }`',
   '`{ "value": 5, "unit": "mg", "system": "http://loinc.org", "code": "mg" }`'],
  'A Quantity’s unit is a coded value too: `system` = UCUM (`http://unitsofmeasure.org`) and `code` = the UCUM code `mg` (UCUM codes are case-sensitive). `unit` is just for display. `value` is a decimal, so it has **no quotes**, and LOINC does not define units.',
  ref=('Quantity', B + 'datatypes.html#Quantity'))

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    json.dump({'title': 'ValueSets and CodeableConcept', 'questions': Q}, f, ensure_ascii=False, indent=1)
    f.write('\n')
print(len(Q), 'questions; kinds:', sorted({x['kind'] for x in Q}))
