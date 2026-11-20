# Modelo de datos

```mermaid
erDiagram
  auth_users ||--|| profiles : owns
  profiles ||--o{ pets : owns
  profiles ||--o{ incidents : reports
  incidents ||--o{ incident_status_history : records
  profiles ||--o{ incident_status_history : changes
```

La migración en `supabase/migrations` es la fuente de verdad del esquema. `profiles.role` se asigna como `citizen` al registrarse. Solo un administrador de un proyecto Supabase exclusivo puede promover y asignar distrito a personal municipal.
