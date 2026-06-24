# ERD

```mermaid
erDiagram
  users ||--o{ audit_logs : performs
  users ||--o{ announcements : creates
  users }o--o{ roles : assigned
  roles }o--o{ permissions : grants
```
