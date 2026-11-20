# Diseño pendiente — fotografías e indicadores

Esta revisión no cambia el esquema ni crea buckets. Las cuatro tablas actuales ya contienen `district` en `incidents` y `profiles`; no existe una relación de fotografías ni una vista de estadísticas en las cuatro migraciones versionadas.

## Fotografías

- Definir primero si las fotos pertenecen a mascotas, reportes o ambos y sus reglas de retención. Usar un bucket privado de Supabase Storage con rutas derivadas del `auth.uid()` y un identificador de registro, sin confiar en rutas enviadas por el navegador.
- Registrar referencias a objetos en una migración nueva solo cuando se confirme la cardinalidad. La lectura y escritura deben comprobar propietario o rol municipal con alcance de distrito; preferir URLs firmadas de corta duración para mostrar archivos privados.
- Validar tipo MIME, tamaño y extensión en servidor y en Storage; probar carga ajena, lectura ajena, sustitución y borrado antes de publicar.
- Revisar buckets y tablas reales de Cloud antes de crear recursos para evitar duplicados.

## Indicadores por distrito

- Derivar recuentos de `incidents` por distrito, estado y período desde los datos existentes. Definir zona horaria, períodos y criterios de actualización antes de añadir vistas o tablas de agregados.
- Si se usa una vista en `public`, fijar `security_invoker = true` y limitar columnas para no exponer direcciones ni descripciones. Para un panel municipal, filtrar el distrito según `profiles.role` y `profiles.district` verificados en servidor y RLS.
- Probar que un ciudadano y un municipal de otro distrito no accedan a detalles ajenos. Considerar umbral mínimo de publicación si se muestran recuentos públicos pequeños.
- Crear índices o agregados materializados solo tras medir consultas reales; no duplicar `incidents` por distrito.
