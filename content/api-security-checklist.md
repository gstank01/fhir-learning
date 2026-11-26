## Where it is

[Security checklist](https://hl7.org/fhir/R4/security.html) and [Security](https://hl7.org/fhir/R4/secpriv-module.html) pages in the core spec. FHIR itself doesn't define authentication; it relies on standard web security.

## Communication

- Use **TLS (HTTPS)** for all exchange of real data.
- Configure **CORS** carefully for browser apps.
- Don't put sensitive data in URLs (they end up in logs). Use POST search (`[base]/Patient/_search`) if needed.

## Authentication and authorisation

- **SMART App Launch** (OAuth 2.0 + OpenID Connect) is the usual mechanism.
  - Discovery: `[base]/.well-known/smart-configuration`.
  - **EHR launch:** the EHR opens the app with `iss` and `launch` parameters; the app requests the `launch` scope.
  - **Standalone launch:** the user opens the app directly; it asks for context with scopes such as `launch/patient`.
  - Scopes such as `patient/Observation.read` (v1) or `patient/Observation.rs` (v2), `user/*.read`, `openid fhirUser`, `offline_access`.
  - The token response can include the patient in context (`patient`).
- **SMART Backend Services:** system-to-system, no user. Uses `client_credentials` with a signed JWT (`private_key_jwt`) and `system/` scopes. Bulk Data uses this.
- Server side: check the access token on every request and enforce scopes; return `401` when there is no valid token and `403` when the token doesn't allow the action.

## Audit

- Log access with `AuditEvent`: who (agent), what (entity), when (recorded), from where (source), what happened (type, action, outcome).
- **Basic Audit Log Patterns (BALP)** IG, from IHE, defines AuditEvent profiles for RESTful activity, e.g. read, create, query, with rules on which agents and entities to include. Compare an AuditEvent with the BALP profile to see if it conforms (for example: is the patient recorded as an entity for a patient-specific read?).
- `AuditEvent` is a security log. `Provenance` is about where data came from; don't confuse them.

## Other security features

- `meta.security` holds **security labels** such as confidentiality codes (`R` restricted, `N` normal).
- `Consent` records a patient's privacy choices.
- Digital signatures: `Bundle.signature`, `Provenance.signature`.
