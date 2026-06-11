# Tasks: Tasks Frontend

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1 400–1 700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 → PR2 → PR3 → PR4 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Shared Pagination + tasks domain/infra core (read) | PR1 | Base: `main`. ~300–350 lines |
| 2 | Task list + detail + hooks + nav + i18n | PR2 | Base: PR1 branch. ~350–400 lines |
| 3 | Schedule + cancel flows + mutations + hooks | PR3 | Base: PR2 branch. ~300–350 lines |
| 4 | Templates list + CRUD + screens + schemas + hooks + i18n | PR4 | Base: PR3 branch. ~350–450 lines; may split into 4a/4b |

---

## PR1 — Shared Pagination + Domain/Infra Core

### Phase 1.1: Shared Pagination Component (R1.1)

- [ ] 1.1 RED — Write `src/shared/presentation/components/ui/pagination/pagination.test.tsx`: failing tests for page count, `onPageChange` call, disabled prev on page 1, disabled next on last page
- [ ] 1.2 GREEN — Create `src/shared/presentation/components/ui/pagination/pagination.tsx` with `PaginationProps` contract (controlled, stateless); make all tests pass
- [ ] 1.3 Export `Pagination` from `src/shared/presentation/components/ui/index.ts` (or barrel file)

### Phase 1.2: Domain Interfaces + Enums (CC2)

- [ ] 1.4 Create `src/core/tasks/domain/interfaces/task-status.enum.ts` — `TaskStatus` string enum
- [ ] 1.5 Create `src/core/tasks/domain/interfaces/task-run-status.enum.ts` — `TaskRunStatus` string enum
- [ ] 1.6 Create `src/core/tasks/domain/interfaces/task-backoff-strategy.enum.ts` — `TaskBackoffStrategy` string enum
- [ ] 1.7 Create `src/core/tasks/domain/interfaces/task.interface.ts` — `ITask` (payload: `Record<string, unknown>`)
- [ ] 1.8 Create `src/core/tasks/domain/interfaces/task-run.interface.ts` — `ITaskRun`
- [ ] 1.9 Create `src/core/tasks/domain/interfaces/task-template.interface.ts` — `ITaskTemplate`
- [ ] 1.10 Create `src/core/tasks/domain/interfaces/index.ts` barrel

### Phase 1.3: Application Layer — Ports + DTOs

- [ ] 1.11 Create `src/core/tasks/application/interfaces/pagination.interface.ts` — `PaginationInput`, `Paginated<T>`
- [ ] 1.12 Create `src/core/tasks/application/interfaces/tasks.interfaces.ts` — `ListTasksInput`, `ListTaskRunsInput`, `ScheduleTaskInput`, `ListTemplatesInput`, `CreateTemplateInput`, `UpdateTemplateInput`
- [ ] 1.13 Create `src/core/tasks/application/ports/tasks.repository.port.ts` — `ITasksRepository` with all method signatures

### Phase 1.4: Read Use-Cases (Strict TDD)

- [ ] 1.14 RED — Write `src/core/tasks/application/use-cases/list-tasks/list-tasks.use-case.spec.ts` with mocked port
- [ ] 1.15 GREEN — Create `list-tasks.use-case.ts`; pass spec
- [ ] 1.16 RED — Write `get-task/get-task.use-case.spec.ts`
- [ ] 1.17 GREEN — Create `get-task.use-case.ts`; pass spec
- [ ] 1.18 RED — Write `list-task-runs/list-task-runs.use-case.spec.ts`
- [ ] 1.19 GREEN — Create `list-task-runs.use-case.ts`; pass spec
- [ ] 1.20 RED — Write `list-templates/list-templates.use-case.spec.ts`
- [ ] 1.21 GREEN — Create `list-templates.use-case.ts`; pass spec
- [ ] 1.22 RED — Write `get-template/get-template.use-case.spec.ts`
- [ ] 1.23 GREEN — Create `get-template.use-case.ts`; pass spec

### Phase 1.5: Infrastructure — Read Queries + Mappers + Repository (R1.2)

- [ ] 1.24 Create `src/core/tasks/infrastructure/repositories/graphql/queries/tasks-find-by-criteria.query.ts`
- [ ] 1.25 Create `queries/task-find-by-id.query.ts`
- [ ] 1.26 Create `queries/task-runs-find-by-task-id.query.ts`
- [ ] 1.27 Create `queries/task-templates-find-by-criteria.query.ts`
- [ ] 1.28 Create `queries/task-template-find-by-id.query.ts`
- [ ] 1.29 Create `responses/` types for all 5 read queries
- [ ] 1.30 Create `mappers/task.mapper.ts` — `toTask()` with `JSON.parse(payload)`, null-guard, error on parse failure
- [ ] 1.31 Create `mappers/task-run.mapper.ts` — `toTaskRun()` with `output` JSON boundary
- [ ] 1.32 Create `mappers/task-template.mapper.ts` — `toTaskTemplate()` with `defaultPayload` JSON boundary
- [ ] 1.33 RED — Write `tasks.gql.repository.spec.ts`: mock `apolloClient`, assert read methods call correct queries + assert payload string becomes parsed object + null/empty payload yields `{}`
- [ ] 1.34 GREEN — Create `tasks.gql.repository.ts` (read methods only: `listTasks`, `getTask`, `listTaskRuns`, `listTemplates`, `getTemplate`); pass spec

---

## PR2 — Task List + Detail + Run History

### Phase 2.1: Presentation Hooks — Read (R2.1, R2.3)

- [ ] 2.1 RED — Write `src/core/tasks/presentation/hooks/use-tasks/use-tasks.hook.spec.ts`: mock use-case, assert enabled/disabled by `spaceId`, returns `Paginated<ITask>`
- [ ] 2.2 GREEN — Create `use-tasks.hook.ts` with `useQuery`, `enabled: !!spaceId`; pass spec
- [ ] 2.3 RED — Write `use-task/use-task.hook.spec.ts`
- [ ] 2.4 GREEN — Create `use-task.hook.ts`; pass spec
- [ ] 2.5 RED — Write `use-task-runs/use-task-runs.hook.spec.ts`
- [ ] 2.6 GREEN — Create `use-task-runs.hook.ts`; pass spec

### Phase 2.2: Presentational Sub-Components (R2.2)

- [ ] 2.7 RED — Write `components/task-status-badge/task-status-badge.spec.tsx`: assert `data-testid="task-status-badge"` for `completed` → success variant and `failed` → destructive
- [ ] 2.8 GREEN — Create `task-status-badge.tsx` mapping all 5 statuses to `Badge` variants; pass spec
- [ ] 2.9 Create `components/task-run-status-badge/task-run-status-badge.tsx` (+ spec for status → variant mapping)

### Phase 2.3: Task List Screen (R2.1)

- [ ] 2.10 RED — Write `screens/tasks-list/tasks-list.screen.spec.tsx`: renders 10 rows for 12 total, shows `Pagination` with 2 pages, page change calls hook with `page:2`
- [ ] 2.11 GREEN — Create `tasks-list.screen.tsx` (`page`/`pageSize` state, `useTasks`, `DataTable`, `Pagination`, `PageHeader`, status filter Tabs); pass spec

### Phase 2.4: Task Detail Screen (R2.3)

- [ ] 2.12 RED — Write `screens/task-detail/task-detail.screen.spec.tsx`: `data-testid="task-run-list"` shows 3 entries; `data-testid="task-run-list-empty"` visible when no runs
- [ ] 2.13 GREEN — Create `task-detail.screen.tsx` (task summary card, runs `DataTable`, runs `Pagination`, Breadcrumb); pass spec

### Phase 2.5: Routes (R2.1, R2.3)

- [ ] 2.14 Create `app/[lang]/(protected)/tasks/page.tsx` — server component wiring `TasksListScreen`
- [ ] 2.15 Create `app/[lang]/(protected)/tasks/[id]/page.tsx` — wiring `TaskDetailScreen`

### Phase 2.6: Nav + i18n (R2.4, CC1)

- [ ] 2.16 Add `tasks: 'Tasks'` to `src/shared/presentation/i18n/shell/en.ts` nav object
- [ ] 2.17 Add `tasks: 'Tareas'` to `src/shared/presentation/i18n/shell/es.ts` nav object
- [ ] 2.18 Add `{ key: 'tasks', href: '/[lang]/tasks', icon: ListChecks }` to `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` (same commit as 2.16/2.17)
- [ ] 2.19 Create `src/core/tasks/presentation/i18n/en.ts` — `list`, `detail`, `status`, `runStatus`, `backoff` key groups
- [ ] 2.20 Create `src/core/tasks/presentation/i18n/es.ts` — full parity with en.ts
- [ ] 2.21 Create `src/core/tasks/presentation/i18n/i18n-parity.test.ts` — ensure all en keys have es equivalent
- [ ] 2.22 Register tasks dict in `get-dictionary.ts` (`AppDict`, `en`/`es` entries)

---

## PR3 — Schedule + Cancel Flows

### Phase 3.1: Infrastructure — Write Mutations (R3.1, R3.2, R1.2)

- [ ] 3.1 Create `mutations/schedule-task.mutation.ts` + `responses/schedule-task.response.ts`
- [ ] 3.2 Create `mutations/cancel-task.mutation.ts` + `responses/cancel-task.response.ts`
- [ ] 3.3 Add `scheduleTask` + `cancelTask` to `tasks.gql.repository.ts` with `JSON.stringify(payload)` before `mutate`
- [ ] 3.4 Add tests to `tasks.gql.repository.spec.ts`: payload object is stringified in `scheduleTask` variables; `cancelTask` calls correct mutation

### Phase 3.2: Write Use-Cases (R3.1, R3.2)

- [ ] 3.5 RED — Write `schedule-task/schedule-task.use-case.spec.ts`
- [ ] 3.6 GREEN — Create `schedule-task.use-case.ts`; pass spec
- [ ] 3.7 RED — Write `cancel-task/cancel-task.use-case.spec.ts`
- [ ] 3.8 GREEN — Create `cancel-task.use-case.ts`; pass spec

### Phase 3.3: Hooks (R3.1, R3.2)

- [ ] 3.9 RED — Write `use-schedule-task/use-schedule-task.hook.spec.ts`: assert mutation invalidates `['tasks', spaceId]`
- [ ] 3.10 GREEN — Create `use-schedule-task.hook.ts`; pass spec
- [ ] 3.11 RED — Write `use-cancel-task/use-cancel-task.hook.spec.ts`: assert mutation invalidates `['tasks', spaceId]` + `['task', taskId]`
- [ ] 3.12 GREEN — Create `use-cancel-task.hook.ts`; pass spec

### Phase 3.4: Zod Schema + Schedule Modal (R3.1)

- [ ] 3.13 Create `src/core/tasks/presentation/schemas/schedule-task.schema.ts` — `scheduleTaskSchema` (templateId, name 1..100, scheduledAt ISO, payload valid JSON)
- [ ] 3.14 RED — Write `components/schedule-task-modal/schedule-task-modal.spec.tsx`: template-picker lists 3 templates, selecting one pre-fills payload, submit calls `scheduleTask` with stringified payload
- [ ] 3.15 GREEN — Create `schedule-task-modal.tsx` (Dialog, template Select via `useTaskTemplates`, payload textarea, `scheduleTaskSchema` validation, `useScheduleTask` on submit); pass spec

### Phase 3.5: Cancel Confirm Flow (R3.2)

- [ ] 3.16 RED — Add tests to `task-detail.screen.spec.tsx`: `data-testid="cancel-task-btn"` present for `pending`, absent for `active`; confirm modal fires `cancelTask`
- [ ] 3.17 GREEN — Wire `CancelTaskButton` + `ConfirmModal` + `useCancelTask` into `task-detail.screen.tsx`; pass spec

### Phase 3.6: i18n — Schedule Keys (CC1)

- [ ] 3.18 Add `schedule` key group to `en.ts` and `es.ts` in `src/core/tasks/presentation/i18n/`; verify parity test passes

---

## PR4 — Task Templates List + CRUD

### Phase 4.1: Infrastructure — Template Mutations (CC2, R4.2–R4.4)

- [ ] 4.1 Create `mutations/task-template-create.mutation.ts` + `responses/task-template-create.response.ts`
- [ ] 4.2 Create `mutations/task-template-update.mutation.ts` + `responses/task-template-update.response.ts`
- [ ] 4.3 Create `mutations/task-template-delete.mutation.ts` + `responses/task-template-delete.response.ts`
- [ ] 4.4 Add `createTemplate`, `updateTemplate`, `deleteTemplate` to `tasks.gql.repository.ts` with `JSON.stringify(defaultPayload)` on create/update
- [ ] 4.5 Add mutation tests to `tasks.gql.repository.spec.ts`: `defaultPayload` object stringified in create/update variables; delete calls correct mutation

### Phase 4.2: Write Use-Cases (R4.2–R4.4)

- [ ] 4.6 RED — Write `create-template/create-template.use-case.spec.ts`
- [ ] 4.7 GREEN — Create `create-template.use-case.ts`; pass spec
- [ ] 4.8 RED — Write `update-template/update-template.use-case.spec.ts`
- [ ] 4.9 GREEN — Create `update-template.use-case.ts`; pass spec
- [ ] 4.10 RED — Write `delete-template/delete-template.use-case.spec.ts`
- [ ] 4.11 GREEN — Create `delete-template.use-case.ts`; pass spec

### Phase 4.3: Hooks (R4.1–R4.4)

- [ ] 4.12 RED — Write `use-task-templates/use-task-templates.hook.spec.ts`
- [ ] 4.13 GREEN — Create `use-task-templates.hook.ts`; pass spec
- [ ] 4.14 RED — Write `use-task-template/use-task-template.hook.spec.ts`
- [ ] 4.15 GREEN — Create `use-task-template.hook.ts`; pass spec
- [ ] 4.16 RED — Write `use-create-task-template/use-create-task-template.hook.spec.ts`: invalidates `['task-templates', spaceId]` on success
- [ ] 4.17 GREEN — Create `use-create-task-template.hook.ts`; pass spec
- [ ] 4.18 RED — Write `use-update-task-template/use-update-task-template.hook.spec.ts`: invalidates list + single template keys
- [ ] 4.19 GREEN — Create `use-update-task-template.hook.ts`; pass spec
- [ ] 4.20 RED — Write `use-delete-task-template/use-delete-task-template.hook.spec.ts`
- [ ] 4.21 GREEN — Create `use-delete-task-template.hook.ts`; pass spec

### Phase 4.4: Zod Schema + Template Form (R4.2, R4.3)

- [ ] 4.22 Create `src/core/tasks/presentation/schemas/task-template.schema.ts` — `taskTemplateSchema` (name 1..100, maxRetries int ≥0, backoffStrategy enum, defaultPayload valid JSON)
- [ ] 4.23 RED — Write `components/template-form/template-form.spec.tsx`: pre-populated in edit mode (name = "Daily sync"), valid submit calls create/update, invalid does not
- [ ] 4.24 GREEN — Create `template-form.tsx` (shared create+edit form, `taskTemplateSchema`, `useCreateTaskTemplate`/`useUpdateTaskTemplate`); pass spec

### Phase 4.5: Templates List Screen + Delete Confirm (R4.1, R4.4)

- [ ] 4.25 RED — Write `screens/templates-list/templates-list.screen.spec.tsx`: 10 rows for 15 total, `Pagination` shows 2 pages, delete confirm fires `deleteTaskTemplate`
- [ ] 4.26 GREEN — Create `templates-list.screen.tsx` (`useTaskTemplates`, `DataTable`, `Pagination`, `DeleteTemplateConfirm` `ConfirmModal`); pass spec

### Phase 4.6: Routes (R4.1–R4.4)

- [ ] 4.27 Create `app/[lang]/(protected)/tasks/templates/page.tsx` — wiring `TemplatesListScreen`
- [ ] 4.28 Create `app/[lang]/(protected)/tasks/templates/new/page.tsx` — wiring `TemplateForm` (create mode)
- [ ] 4.29 Create `app/[lang]/(protected)/tasks/templates/[id]/page.tsx` — wiring `TemplateForm` (edit mode, calls `useTaskTemplate` for prefill)

### Phase 4.7: i18n — Templates Keys (CC1)

- [ ] 4.30 Add `templates` key group to `en.ts` and `es.ts` in `src/core/tasks/presentation/i18n/`; verify parity test passes
