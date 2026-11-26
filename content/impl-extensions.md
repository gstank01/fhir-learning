## Structure

Every extension has a `url` (the canonical URL of its StructureDefinition) and **either** one `value[x]` **or** nested `extension`s, never both.

```json
{
  "resourceType": "Patient",
  "extension": [{
    "url": "http://hl7.org/fhir/StructureDefinition/patient-birthPlace",
    "valueAddress": { "city": "Leeds", "country": "GB" }
  }],
  "name": [{ "family": "Smith" }]
}
```

The `value` property name is `value` + the type name with a capital letter: `valueString`, `valueCodeableConcept`, `valueBoolean`, `valueDateTime`, `valueAddress`.

## Complex extension

```json
{
  "url": "http://hl7.org/fhir/StructureDefinition/patient-nationality",
  "extension": [
    { "url": "code", "valueCodeableConcept": { "coding": [{ "system": "urn:iso:std:iso:3166", "code": "FR" }] } },
    { "url": "period", "valuePeriod": { "start": "2010-01-01" } }
  ]
}
```

Nested extensions defined inside a complex extension use a short relative `url` (`code`, `period`).

## Where it goes

- Extending the **resource**: put it in the resource's top-level `extension` array.
- Extending an **element** or **data type**: put it inside that element, e.g. inside an `address` or a `name`.
- Extending a **primitive** in JSON: use the underscore property:

```json
"birthDate": "1970-03-30",
"_birthDate": {
  "extension": [{
    "url": "http://hl7.org/fhir/StructureDefinition/patient-birthTime",
    "valueDateTime": "1970-03-30T14:30:00+01:00"
  }]
}
```

In XML, primitive extensions go inside the element: `<birthDate value="1970-03-30"><extension url="...">...</extension></birthDate>`.

- **Modifier extensions** go in `modifierExtension`, never in `extension`.

## Order

- **JSON:** property order doesn't matter (by convention `resourceType` first).
- **XML:** order matters. In a resource, the order is `id`, `meta`, `implicitRules`, `language`, `text`, `contained`, **`extension`, `modifierExtension`**, then the resource's own elements. Inside an element or data type, `extension` (and `modifierExtension`) come **first**, before the other child elements. Inside an extension, `extension` children come before `value[x]`.

```xml
<Patient xmlns="http://hl7.org/fhir">
  <id value="1"/>
  <extension url="http://hl7.org/fhir/StructureDefinition/patient-birthPlace">
    <valueAddress><city value="Leeds"/></valueAddress>
  </extension>
  <name><family value="Smith"/></name>
</Patient>
```
