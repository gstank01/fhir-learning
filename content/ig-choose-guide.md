## Where IGs are listed

- **FHIR IG Registry:** [fhir.org/guides/registry](https://www.fhir.org/guides/registry/), the global list of published guides.
- **HL7 FHIR IG list:** [hl7.org/fhir](https://hl7.org/fhir/) links to the guides HL7 has published; [build.fhir.org/ig](https://build.fhir.org/ig/) shows current CI (draft) builds.
- **Simplifier.net** and **packages.fhir.org:** search for IG packages and their profiles.
- **National and regional registries:** for example the UK's NHS England / UK Core guides, or US Core for the US.

## Choosing between guides

1. **Search by keyword** for the domain: "laboratory", "genomics", "UK", "immunization".
2. **Check the scope.** Read the IG home page: who it is for, which use cases and actors it covers, and which country.
3. **Check the interactions.** Does it define the exchange you need (REST read/search, messaging, documents, bulk data)? Look at its CapabilityStatements.
4. **Check status and version.** Prefer a published (normative or STU) release over a draft CI build, and make sure it targets your FHIR version (R4 / R4B / R5).
5. **Check regulation.** A guide required by regulation in your jurisdiction (for example US Core under ONC rules) wins over an equally good alternative.

## Well-known guides

| IG | Use |
|---|---|
| US Core | Base US profiles for patient data access |
| International Patient Summary (IPS) | Cross-border patient summary document |
| SMART App Launch | Authorisation and launching apps |
| Bulk Data Access | Exporting data for populations |
| Da Vinci (several) | US payer–provider exchange |
| Genomics Reporting | Genetic test results |
| UK Core | Base UK profiles |
