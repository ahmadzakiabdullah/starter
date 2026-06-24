# Security

## Access control

Authorization is enforced through Laravel policies and role/permission checks. Superadmins retain global access; media management is available to admin and superadmin roles.

## Sensitive configuration

SMTP usernames and passwords in the settings table are encrypted at rest. Keep `APP_KEY` secret and stable; changing it prevents decryption of existing values.

## Operational controls

- Media uploads use an extension allowlist and a 10 MB limit.
- Backup filenames are validated before disk access.
- Audit logs record security-relevant administrative actions.
- `/api/health` returns dependency status only; it does not expose secrets or detailed host configuration.

## Reporting

Report security issues privately to the system owner. Do not include credentials, database dumps, or personal data in tickets or chat messages.
