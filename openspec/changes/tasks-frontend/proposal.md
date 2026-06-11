# Proposal: Tasks Feature (Frontend)

## Intent

Gardenia's backend exposes a full Task scheduling API (tasks + task templates) over GraphQL, but `gardenia-web` has no UI for it. Users cannot view scheduled tasks, inspect run history, schedule new tasks from templates, cancel tasks, or manage templates. This change introduces the `tasks` bounded context end-to-end so users can operate the task engine from the app. Greenfield — no `tasks` context exists yet.

## Scope

### In Scope
- `src/core/tasks/` full DDD/Hexagonal structure (domain / application / infrastructure / presentation)
- GraphQL repository (Apollo Client) covering all task + template queries/mutations
- Task list screen with server-side pagination
- Task detail screen with run history (`taskRunsFindByTaskId`)
- Schedule task modal using a template picker (`taskTemplateFindByCriteria`) → `scheduleTask`
- Cancel task confirm flow (`ConfirmModal` → `cancelTask`)
- Task templates list + CRUD screens (create / update / delete)
- New shared `Pagination` component in `src/shared/presentation/components/ui/`
- Nav entry (`NavItemKey` + both locale `ShellDict` files)
- i18n parity (en + es)

### Out of Scope (deferred)
- `TodayTasksSection` dashboard wiring
- Advanced filtering / sorting UI
- Task run detail screen (drill-down beyond run list)

## Capabilities

### New Capabilities
- `tasks-management`: list, view, schedule, and cancel tasks; view run history
- `task-templates-management`: list and CRUD task templates; template picker for scheduling
- `shared-pagination`: reusable server-side pagination UI component

### Modified Capabilities
- None

## Approach

Mirror the `plants`/`spaces` contexts exactly:
- **domain**: `Task`, `TaskRun`, `TaskTemplate` interfaces + enums (status, backoff strategy)
- **application**: use-cases (one folder per operation) + repository port
- **infrastructure**: `tasks.gql.repository.ts` with `queries/` + `mutations/`; mappers `JSON.parse`/`stringify` the `payload` string at the boundary so domain holds a typed object
- **presentation**: hooks (`useTasks`, `useScheduleTask`, `useCancelTask`, `useTaskTemplates`, ...), screens, schemas, i18n (en/es with parity test)
- **routing**: `app/[lang]/(protected)/tasks/` + `tasks/templates/`
- **Pagination**: presentational, controlled (`page`, `pageSize`, `total`, `onPageChange`); state owned by each screen and forwarded to GraphQL `pagination` input

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/core/tasks/**` | New | Full DDD context |
| `src/shared/presentation/components/ui/pagination/` | New | Shared component |
| `app/[lang]/(protected)/tasks/**` | New | Routes |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modified | Nav entry |
| `src/shared/.../ShellDict` + en/es locale files | Modified | Nav label typing + i18n |

## Delivery Slicing (PRs ≤ 400 lines, ask-on-risk)

1. **PR1 — Pagination + domain/infra core**: shared `Pagination` component, tasks domain interfaces, GraphQL repo + mappers (read-only queries), port
2. **PR2 — Task list + detail**: list screen w/ pagination, detail + run history, hooks, route, nav entry, i18n
3. **PR3 — Schedule + cancel**: template picker modal, `scheduleTask`, cancel confirm, hooks, i18n
4. **PR4 — Templates list + CRUD**: templates list, create/update/delete screens + schemas, hooks, route, i18n

Each slice is autonomous and verifiable. PR4 may split if it exceeds budget.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| GraphQL `payload` is a JSON string, not object | High | Centralize `JSON.parse`/`stringify` in the infra mapper; domain only sees typed objects |
| `NavItemKey` typing breaks TS if updated incompletely | Med | Update `NavItemKey`, both locale files, and `ShellDict` in the same commit |
| `Pagination` is new shared infra — API churn affects future consumers | Med | Design as controlled/presentational with minimal stable props before wiring screens |
| Template-driven schedule payload validation | Med | Zod schema in presentation; validate before mutation |

## Rollback Plan

All changes are additive (new context + new shared component + new routes). Revert by removing `src/core/tasks/`, the `tasks` routes, the `Pagination` component, and reverting the nav/i18n diffs. No existing context is modified, so rollback cannot break plants/spaces.

## Dependencies

- Backend GraphQL task API live and reachable via existing Apollo Client config

## Success Criteria

- [ ] User can view a paginated task list, open a task, and see its run history
- [ ] User can schedule a task from a template and cancel an existing task
- [ ] User can list and CRUD task templates
- [ ] `Pagination` component is reusable across tasks + templates screens
- [ ] en/es i18n parity test passes; nav entry renders without TS errors
