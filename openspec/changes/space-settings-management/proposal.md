# Proposal: space-settings-management

## Intent

Añadir una página de **Settings** en la aplicación web donde el usuario pueda gestionar el espacio activo: ver sus detalles, crear invitaciones con código/QR para compartir, y añadir o eliminar miembros. Esto cubre la paridad de funcionalidades entre `gardenia-api` (que ya tiene todos los endpoints) y `gardenia-web` (que solo tenía aceptar invitaciones).

## Contexto

El space switcher del sidebar footer ya permite cambiar de espacio activo. La entrada "Settings" del menú de usuario existe en el sidebar footer pero está deshabilitada (`disabled`). Este change la activa y construye la sección de settings bajo `(protected)/settings/`.

## Scope

- **gardenia-web** — único repositorio afectado; la API ya tiene todo implementado.
- Ruta principal: `app/[lang]/(protected)/settings/page.tsx`
- Módulo: bounded context `spaces`, capas `application`, `infrastructure`, `presentation`
- Bounded context `shared` — solo se modifica el enlace de Settings en `sidebar-footer.tsx`

### Funcionalidades incluidas

1. **Detalles del espacio** — nombre, owner, fecha de creación (`spaceFindById` GQL).
2. **Crear invitación** — el owner genera un código de un solo uso y su QR (mutación `spaceCreateInvitation`). Se muestra el `displayCode`, el código completo, la fecha de expiración y un botón de copiar el enlace de invitación.
3. **Añadir miembro por userId** — formulario para el owner (mutación `spaceAddMember`).
4. **Eliminar miembro por userId** — confirmación antes de ejecutar (mutación `spaceRemoveMember`).
5. **Lista de miembros** — ⚠️ la GQL `spaceFindById` no expone miembros hoy. Esta sección se muestra como `<InDevelopment />` hasta que gardenia-api extienda el view-model. Se deja la estructura lista para cuando se desbloquee.

## Out of Scope

- Cambiar el nombre del espacio (no hay endpoint PATCH en la API).
- Eliminar el espacio.
- Gestión de roles (la API sólo acepta `role` en la creación de invitación, no PATCH de rol existente).
- Ajustes de perfil de usuario (van en `/profile`, ya existe).
- Settings globales de la aplicación (tema, idioma…) — pueden ir en Settings en el futuro pero no en este change.

## Rollback

Eliminar la ruta `settings/`, revertir el botón del sidebar footer a `disabled`, y borrar los nuevos use-cases/mutations/hooks del bounded context `spaces`. Los tests confirman que no queda referencia huérfana.
