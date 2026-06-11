# Design: Tasks Feature (Frontend)

## 1. Architecture Approach

### Pattern

Mirror the existing `plants` / `spaces` bounded contexts **exactly**. New context lives at
`src/core/tasks/` and follows the same DDD / Hexagonal layering already in the codebase:

```
src/core/tasks/
  domain/interfaces/        # pure typed shapes + enums (no deps)
  application/
    ports/                  # repository port (interface)
    interfaces/             # use-case input/output contracts (DTOs)
    use-cases/<op>/         # one folder per operation, one class per use-case
  infrastructure/
    repositories/graphql/   # Apollo-backed adapter, queries/, mutations/, responses/, mapper
  presentation/
    hooks/<name>/           # React Query hooks (one folder per hook)
    screens/<name>/         # screen components (container)
    components/<name>/      # context-specific presentational components
    schemas/                # Zod form schemas
    i18n/                   # en.ts, es.ts, i18n-parity.test.ts
```

### Layering rules (enforced, copied from existing contexts)

- **domain** has zero imports. Pure interfaces + enums. `payload` is a typed object here, never a string.
- **application** depends only on domain. Use-cases receive the repository **port** via constructor injection.
- **infrastructure** implements the port using `apolloClient`. This is the ONLY layer that knows GraphQL exists and the ONLY place where `payload` is `JSON.parse`/`stringify`-d.
- **presentation** depends on application (use-cases) + domain (types). Hooks wire concrete repo → use-case → React Query. No business logic in components.

### Key boundary decision: data fetching stack

Repositories use **Apollo Client** (`apolloClient.query` / `apolloClient.mutate`) — consistent with plants/spaces. But hooks use **`@tanstack/react-query`** (`useQuery` / `useMutation`), NOT Apollo's `useQuery`. This is the established pattern (see `use-plants.hook.ts`): Apollo is a transport detail hidden in infra; React Query owns client cache/invalidation in presentation. We follow it verbatim — do NOT introduce Apollo hooks.

### State management

All UI state via React hooks (`useState`) owned by each screen. Server state via React Query. No signals, no NgRx, no BehaviorSubject, no Zustand for task data (the existing `spaces.store.ts` Zustand store is reused only to read `currentSpaceId`).

---

## 2. Domain Layer

`src/core/tasks/domain/interfaces/`

### Enums

`task-status.enum.ts`, `task-run-status.enum.ts`, `task-backoff-strategy.enum.ts` — string enums so values round-trip cleanly through GraphQL.

```ts
// task-status.enum.ts
export enum TaskStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

// task-run-status.enum.ts
export enum TaskRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

// task-backoff-strategy.enum.ts
export enum TaskBackoffStrategy {
  FIXED = 'FIXED',
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
}
```

> NOTE: exact members must be reconciled against the live GraphQL schema enum names during `sdd-apply`. If the backend exposes different members, the enum is the single source of truth to update — nothing else hardcodes the strings.

### Interfaces

```ts
// task.interface.ts
export interface ITask {
  id: string;
  spaceId: string;
  templateId: string;
  name: string;
  status: TaskStatus;
  payload: Record<string, unknown>;   // typed object in domain — NOT a string
  scheduledAt: string;                // ISO
  startedAt?: string;
  completedAt?: string;
  maxRetries: number;
  backoffStrategy: TaskBackoffStrategy;
  createdAt: string;
  updatedAt: string;
}

// task-run.interface.ts
export interface ITaskRun {
  id: string;
  taskId: string;
  status: TaskRunStatus;
  attempt: number;
  startedAt: string;
  finishedAt?: string;
  error?: string;
  output?: Record<string, unknown>;   // typed object — JSON string at the wire
  createdAt: string;
}

// task-template.interface.ts
export interface ITaskTemplate {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  defaultPayload: Record<string, unknown>;  // typed object — JSON string at the wire
  maxRetries: number;
  backoffStrategy: TaskBackoffStrategy;
  createdAt: string;
  updatedAt: string;
}
```

> Naming: existing domain interfaces (`Plant`, `Space`) do NOT use an `I` prefix. The task brief and the new-context convention request `ITask` / `ITaskRun` / `ITaskTemplate`. We adopt the `I` prefix for the tasks context to match the brief; this is an intentional, localized deviation documented in ADR-1.

---

## 3. Application Layer

### Repository port

`src/core/tasks/application/ports/tasks.repository.port.ts`

```ts
export interface ITasksRepository {
  // tasks
  listTasks(input: ListTasksInput): Promise<Paginated<ITask>>;
  getTask(id: string): Promise<ITask>;
  listTaskRuns(input: ListTaskRunsInput): Promise<Paginated<ITaskRun>>;
  scheduleTask(input: ScheduleTaskInput): Promise<ITask>;
  cancelTask(id: string): Promise<ITask>;
  // templates
  listTemplates(input: ListTemplatesInput): Promise<Paginated<ITaskTemplate>>;
  getTemplate(id: string): Promise<ITaskTemplate>;
  createTemplate(input: CreateTemplateInput): Promise<ITaskTemplate>;
  updateTemplate(input: UpdateTemplateInput): Promise<ITaskTemplate>;
  deleteTemplate(id: string): Promise<void>;
}
```

### Shared pagination contract

`src/core/tasks/application/interfaces/pagination.interface.ts`

```ts
export interface PaginationInput { page: number; pageSize: number; }
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number; }
```

`PaginationInput` maps 1:1 to the GraphQL `pagination` input variable. `page` is 1-based (UI convention); the infra mapper translates to whatever the backend expects (offset/limit) if needed.

### Use-case input/output contracts

`src/core/tasks/application/interfaces/`

```ts
export interface ListTasksInput     { spaceId: string; pagination: PaginationInput; status?: TaskStatus; }
export interface ListTaskRunsInput  { taskId: string; pagination: PaginationInput; }
export interface ScheduleTaskInput  { spaceId: string; templateId: string; name: string; payload: Record<string, unknown>; scheduledAt: string; }
export interface ListTemplatesInput { spaceId: string; pagination: PaginationInput; }
export interface CreateTemplateInput{ spaceId: string; name: string; description?: string; defaultPayload: Record<string, unknown>; maxRetries: number; backoffStrategy: TaskBackoffStrategy; }
export interface UpdateTemplateInput extends Partial<Omit<CreateTemplateInput, 'spaceId'>> { id: string; }
```

### Use-cases (one folder per operation)

`src/core/tasks/application/use-cases/`

| Folder | Class | execute signature |
|--------|-------|-------------------|
| `list-tasks/` | `ListTasksUseCase` | `execute(input: ListTasksInput): Promise<Paginated<ITask>>` |
| `get-task/` | `GetTaskUseCase` | `execute(id: string): Promise<ITask>` |
| `list-task-runs/` | `ListTaskRunsUseCase` | `execute(input: ListTaskRunsInput): Promise<Paginated<ITaskRun>>` |
| `schedule-task/` | `ScheduleTaskUseCase` | `execute(input: ScheduleTaskInput): Promise<ITask>` |
| `cancel-task/` | `CancelTaskUseCase` | `execute(id: string): Promise<ITask>` |
| `list-templates/` | `ListTemplatesUseCase` | `execute(input: ListTemplatesInput): Promise<Paginated<ITaskTemplate>>` |
| `get-template/` | `GetTemplateUseCase` | `execute(id: string): Promise<ITaskTemplate>` |
| `create-template/` | `CreateTemplateUseCase` | `execute(input: CreateTemplateInput): Promise<ITaskTemplate>` |
| `update-template/` | `UpdateTemplateUseCase` | `execute(input: UpdateTemplateInput): Promise<ITaskTemplate>` |
| `delete-template/` | `DeleteTemplateUseCase` | `execute(id: string): Promise<void>` |

Each use-case takes `ITasksRepository` via constructor and delegates (thin, like `GetPlantsUseCase`). Each gets a `.spec.ts` with a mocked port (Strict TDD).

---

## 4. Infrastructure Layer

`src/core/tasks/infrastructure/repositories/graphql/`

### File structure

```
tasks.gql.repository.ts          # implements ITasksRepository
tasks.gql.repository.spec.ts     # mocks apolloClient (query/mutate)
queries/
  tasks-find-by-criteria.query.ts      # TASKS_FIND_BY_CRITERIA
  task-find-by-id.query.ts             # TASK_FIND_BY_ID
  task-runs-find-by-task-id.query.ts   # TASK_RUNS_FIND_BY_TASK_ID
  task-templates-find-by-criteria.query.ts  # TASK_TEMPLATES_FIND_BY_CRITERIA
  task-template-find-by-id.query.ts    # TASK_TEMPLATE_FIND_BY_ID
mutations/
  schedule-task.mutation.ts            # SCHEDULE_TASK
  cancel-task.mutation.ts              # CANCEL_TASK
  task-template-create.mutation.ts     # TASK_TEMPLATE_CREATE
  task-template-update.mutation.ts     # TASK_TEMPLATE_UPDATE
  task-template-delete.mutation.ts     # TASK_TEMPLATE_DELETE
responses/
  tasks-find-by-criteria.response.ts
  task-find-by-id.response.ts
  task-runs-find-by-task-id.response.ts
  task-templates-find-by-criteria.response.ts
  task-template-find-by-id.response.ts
  schedule-task.response.ts
  cancel-task.response.ts
  task-template-create.response.ts
  task-template-update.response.ts
  task-template-delete.response.ts
mappers/
  task.mapper.ts            # GraphQL row <-> ITask (payload JSON boundary)
  task-run.mapper.ts        # output JSON boundary
  task-template.mapper.ts   # defaultPayload JSON boundary
```

GraphQL constants follow the existing `gql\`...\`` pattern (see `plants-find-by-criteria.query.ts`). Response types are thin wrappers matching the query root field (see `plants-find-by-criteria.response.ts`).

### The `payload` JSON boundary (CRITICAL)

Wire shape: `payload` (task), `output` (run), `defaultPayload` (template) arrive as **JSON strings**. Domain wants typed objects.

**Mappers are the only place this conversion happens.**

```ts
// mappers/task.mapper.ts
import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';

interface TaskRow { /* same fields as ITask but payload: string */ }

export function toTask(row: TaskRow): ITask {
  return {
    ...row,
    payload: row.payload ? JSON.parse(row.payload) as Record<string, unknown> : {},
  };
}
```

- **Reads**: every query result passes through `toTask` / `toTaskRun` / `toTaskTemplate` before leaving infra. `JSON.parse` happens here, guarded against `null`/empty.
- **Writes**: `scheduleTask`, `createTemplate`, `updateTemplate` `JSON.stringify` the `payload` / `defaultPayload` object into the GraphQL variables right before `apolloClient.mutate`. The use-case/domain side always passes a typed object.
- Parse failures throw a descriptive error (`Failed to parse task payload for task ${id}`) — never silently swallow.

### Repository skeleton

```ts
export class TasksGqlRepository implements ITasksRepository {
  async listTasks(input: ListTasksInput): Promise<Paginated<ITask>> {
    const res = await apolloClient.query<TasksFindByCriteriaResponse>({
      query: TASKS_FIND_BY_CRITERIA,
      variables: { input: { spaceId: input.spaceId, status: input.status }, pagination: input.pagination },
      fetchPolicy: 'network-only',
    });
    const conn = res.data?.tasksFindByCriteria;
    return {
      items: (conn?.items ?? []).map(toTask),
      total: conn?.total ?? 0,
      page: input.pagination.page,
      pageSize: input.pagination.pageSize,
    };
  }
  // ... getTask, listTaskRuns, scheduleTask, cancelTask, template ops
}

export const tasksGqlRepository = new TasksGqlRepository();
```

### Repository test pattern

`tasks.gql.repository.spec.ts` follows `spaces.gql.repository.spec.ts`: mock `@/shared/infrastructure/http/apollo.client`, assert each method calls `query`/`mutate` with the right document + variables, asserts mapper output (especially that `payload` string becomes a parsed object), and propagates errors. Add explicit cases:
- `payload` JSON string is parsed into an object on read.
- `payload` object is stringified into variables on `scheduleTask` / template create.
- empty/`null` payload yields `{}` without throwing.

---

## 5. Presentation Layer — Hooks

`src/core/tasks/presentation/hooks/<name>/<name>.hook.ts`

Each hook: instantiate concrete repo → use-case at module scope, wrap in React Query. Queries use `enabled: !!spaceId` guard (like `usePlants`). Mutations invalidate the relevant query keys.

### Query key scheme

```
['tasks', spaceId, page, pageSize, status]
['task', taskId]
['task-runs', taskId, page, pageSize]
['task-templates', spaceId, page, pageSize]
['task-template', templateId]
```

### Hook contracts

| Hook | File | Signature | React Query |
|------|------|-----------|-------------|
| `useTasks` | `use-tasks/` | `(spaceId: string \| null, pagination: PaginationInput, status?: TaskStatus)` | `useQuery` → `Paginated<ITask>`, `enabled: !!spaceId` |
| `useTask` | `use-task/` | `(taskId: string \| null)` | `useQuery` → `ITask`, `enabled: !!taskId` |
| `useTaskRuns` | `use-task-runs/` | `(taskId: string \| null, pagination: PaginationInput)` | `useQuery` → `Paginated<ITaskRun>`, `enabled: !!taskId` |
| `useScheduleTask` | `use-schedule-task/` | `(spaceId: string \| null)` | `useMutation(ScheduleTaskInput)`, invalidates `['tasks', spaceId]` |
| `useCancelTask` | `use-cancel-task/` | `(spaceId: string \| null)` | `useMutation(taskId)`, invalidates `['tasks', spaceId]` + `['task', taskId]` |
| `useTaskTemplates` | `use-task-templates/` | `(spaceId: string \| null, pagination: PaginationInput)` | `useQuery` → `Paginated<ITaskTemplate>`, `enabled: !!spaceId` |
| `useTaskTemplate` | `use-task-template/` | `(templateId: string \| null)` | `useQuery` → `ITaskTemplate`, `enabled: !!templateId` |
| `useCreateTaskTemplate` | `use-create-task-template/` | `(spaceId: string \| null)` | `useMutation(CreateTemplateInput)`, invalidates `['task-templates', spaceId]` |
| `useUpdateTaskTemplate` | `use-update-task-template/` | `(spaceId: string \| null)` | `useMutation(UpdateTemplateInput)`, invalidates `['task-templates', spaceId]` + `['task-template', id]` |
| `useDeleteTaskTemplate` | `use-delete-task-template/` | `(spaceId: string \| null)` | `useMutation(templateId)`, invalidates `['task-templates', spaceId]` |

Each hook gets a `.hook.spec.ts` mirroring `use-plants.hook.spec.ts`: mock the use-case and repo, wrap in a `QueryClientProvider`, assert success/loading/disabled/error states.

---

## 6. Presentation Layer — Screens & Component Trees

### Screen: Task List — `screens/tasks-list/tasks-list.screen.tsx`

Container owns `page` / `pageSize` / `status` filter state and `spaceId` (from `spaces.store`).

```
TasksListScreen (props: dict, lang, spaceId)
├─ PageHeader (eyebrow=count, title, actions=[ScheduleTaskButton])
├─ status filter Tabs (Tabs/TabsList/TabsTrigger)  — All / Scheduled / Running / Completed / ...
├─ DataTable<ITask>  (name, TaskStatusBadge, scheduledAt, runs link)  | skeleton while loading | Alert empty
│    row click → router.push(/[lang]/tasks/{id})
├─ Pagination (page, pageSize, total, onPageChange)            ← shared component
└─ ScheduleTaskModal (open, onClose)                           ← PR3
```

New presentational sub-component: `components/task-status-badge/task-status-badge.tsx` — maps `TaskStatus` → `Badge` variant (`scheduled→neutral`, `running→honey`, `completed→forest`, `cancelled→outline`, `failed→terra`).

### Screen: Task Detail — `screens/task-detail/task-detail.screen.tsx`

```
TaskDetailScreen (props: dict, lang, taskId)
├─ Breadcrumb (Tasks → task name)
├─ PageHeader (title=task.name, actions=[CancelTaskButton if cancellable])
├─ task summary card (status badge, scheduledAt, retries, backoff)
├─ Runs section
│   ├─ DataTable<ITaskRun> (attempt, TaskRunStatusBadge, startedAt, finishedAt, error)
│   └─ Pagination (runs)                                       ← shared component
└─ CancelTaskConfirm (ConfirmModal)                            ← PR3
```

New sub-component: `components/task-run-status-badge/`.

### Modal: Schedule Task — `components/schedule-task-modal/schedule-task-modal.tsx`

```
ScheduleTaskModal (open, onClose, spaceId)
├─ Dialog
├─ template picker: Select fed by useTaskTemplates(spaceId, {page:1,pageSize:50})
├─ on template select → prefill payload (defaultPayload) + name
├─ FormField name, payload editor (textarea JSON), scheduledAt input
├─ Zod validation via scheduleTaskSchema
└─ submit → useScheduleTask().mutate → toast + onClose
```

### Screen: Template List — `screens/templates-list/templates-list.screen.tsx`

```
TemplatesListScreen (props: dict, lang, spaceId)
├─ PageHeader (title, actions=[NewTemplateButton → /tasks/templates/new])
├─ DataTable<ITaskTemplate> (name, description, maxRetries, backoff, actions[edit, delete])
├─ Pagination                                                  ← shared component
└─ DeleteTemplateConfirm (ConfirmModal) → useDeleteTaskTemplate
```

### Form: Template Create/Update — `components/template-form/template-form.tsx`

Shared form used by both new + edit routes. Props: `dict`, `spaceId`, optional `template?: ITaskTemplate` (edit mode), `onSuccess`.

```
TemplateForm
├─ FormField name, textarea description
├─ payload editor (textarea JSON → parsed object on submit)
├─ Input maxRetries (number)
├─ Select backoffStrategy (TaskBackoffStrategy)
├─ Zod taskTemplateSchema
└─ submit → useCreateTaskTemplate | useUpdateTaskTemplate
```

### Zod schemas — `presentation/schemas/`

- `schedule-task.schema.ts` → `scheduleTaskSchema` (templateId required, name 1..100, scheduledAt ISO, payload valid JSON)
- `task-template.schema.ts` → `taskTemplateSchema` (name 1..100, maxRetries int ≥0, backoffStrategy enum, defaultPayload valid JSON)

Error messages are i18n KEYS (like `create-plant.schema.ts` returns `'nameRequired'`), resolved in the component against the dict.

---

## 7. Shared Pagination Component

`src/shared/presentation/components/ui/pagination/pagination.tsx` (+ `pagination.test.tsx`, optional `pagination.stories.tsx`).

### Design: controlled / presentational

Owns NO state. Parent screen owns `page` / `pageSize` and forwards them straight to the GraphQL `pagination` input. The component only renders controls and emits intent.

### Prop contract

```ts
export interface PaginationProps {
  page: number;                          // 1-based current page (controlled)
  pageSize: number;                      // controlled
  total: number;                         // total item count from Paginated<T>.total
  onPageChange: (page: number) => void;  // required
  onPageSizeChange?: (pageSize: number) => void;  // optional
  pageSizeOptions?: number[];            // optional, e.g. [10, 25, 50]; default [10, 25, 50]
  className?: string;
  labels?: { previous?: string; next?: string; pageOf?: (page: number, totalPages: number) => string };
}
```

Derived internally (not stored): `totalPages = Math.max(1, Math.ceil(total / pageSize))`, `canPrev = page > 1`, `canNext = page < totalPages`. Prev/Next call `onPageChange(page ± 1)` guarded by `canPrev`/`canNext`. If `onPageSizeChange` + `pageSizeOptions` provided, render a `Select` for page size.

### Integration with GraphQL `pagination` input

```
screen state { page, pageSize }
   │  (forwarded verbatim)
   ▼
useTasks(spaceId, { page, pageSize })  →  PaginationInput  →  GraphQL `pagination` variable
   │
   ▼
Paginated<ITask> { items, total, page, pageSize }
   │  (total wired back)
   ▼
<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
```

Stable, minimal props locked BEFORE wiring screens (mitigates the shared-infra churn risk).

### Tests

`pagination.test.tsx`: disables Prev on page 1, disables Next on last page, computes `totalPages` correctly for exact/partial divisions, calls `onPageChange` with the right value, never goes below 1 or above `totalPages`.

---

## 8. Routing

`app/[lang]/(protected)/`

| Route | File | Renders |
|-------|------|---------|
| `/tasks` | `tasks/page.tsx` | `TasksListScreen` |
| `/tasks/[id]` | `tasks/[id]/page.tsx` | `TaskDetailScreen` (param `id`) |
| `/tasks/templates` | `tasks/templates/page.tsx` | `TemplatesListScreen` |
| `/tasks/templates/new` | `tasks/templates/new/page.tsx` | `TemplateForm` (create mode) |
| `/tasks/templates/[id]` | `tasks/templates/[id]/page.tsx` | `TemplateForm` (edit mode, param `id`) |

Each `page.tsx` follows the existing server-component pattern (`plants/page.tsx`): await `params`, resolve locale via `isLocale`/`DEFAULT_LOCALE`, `getDictionary(locale)`, pass `dict.tasks` + `lang` (+ `id`) to the screen. `spaceId={null}` so the screen reads `currentSpaceId` from the store (same as plants).

---

## 9. Nav + i18n

### Nav entry — `src/shared/presentation/components/sidebar-nav-items/nav-items.ts`

`NavItemKey = keyof AppDict['shell']['nav']`. To add a `tasks` key WITHOUT TS errors, all three must change in one commit:

1. `src/shared/presentation/i18n/shell/en.ts` → add `tasks: 'Tasks'` to the `nav` object.
2. `src/shared/presentation/i18n/shell/es.ts` → add `tasks: 'Tareas'` to the `nav` object.
3. `nav-items.ts` → add entry. `NavItemKey` auto-widens because it's derived from the dict; no manual union edit needed.

```ts
// nav-items.ts
import { ..., ListChecks } from 'lucide-react';
export const NAV_ITEMS: NavItemConfig[] = [
  // ...
  { key: 'tasks', href: '/[lang]/tasks', icon: ListChecks },
];
```

> `ShellDict = typeof dict` is inferred, so adding the key to both shell locale files updates `ShellDict` → `AppDict['shell']['nav']` → `NavItemKey` automatically. The shell `i18n-parity.test.ts` enforces en/es key parity and will fail if only one locale is updated.

### Context i18n — `src/core/tasks/presentation/i18n/`

New `en.ts` / `es.ts` exporting `const dict = { ... } as const` and `type TasksDict = typeof dict`. Register in `get-dictionary.ts`:
- import `TasksDict` type + `enTasks` / `esTasks` defaults
- add `tasks: WidenStringLiterals<TasksDict>` to `AppDict`
- add `tasks: enTasks` / `tasks: esTasks` to the `en` / `es` dictionaries

Add `i18n-parity.test.ts` in the context i18n folder (copy from spaces/plants).

Key groups to author (en + es parity): `nav` (unused here but kept for symmetry), `list` (title, schedule, empty, columns, statuses), `detail` (breadcrumb, summary labels, runs columns, cancel), `schedule` (modal labels, validation messages), `templates` (list, form labels, delete confirm, validation), `status`/`runStatus`/`backoff` enum labels.

---

## 10. PR Slice Boundaries

Aligned to proposal slicing; each ≤ 400 lines, autonomous, verifiable.

### PR1 — Pagination + domain/infra core (read-only)
- `src/shared/presentation/components/ui/pagination/pagination.tsx` + `.test.tsx`
- `src/core/tasks/domain/interfaces/*` (all interfaces + 3 enums)
- `src/core/tasks/application/ports/tasks.repository.port.ts`
- `src/core/tasks/application/interfaces/*` (pagination + input DTOs)
- read-only use-cases: `list-tasks`, `get-task`, `list-task-runs`, `list-templates`, `get-template` (+ specs)
- infra: repository (read methods only), `queries/*`, `responses/*` for reads, `mappers/*`, repo spec
- **No screens, no routes** — pure foundation.

### PR2 — Task list + detail
- hooks: `useTasks`, `useTask`, `useTaskRuns` (+ specs)
- screens: `tasks-list`, `task-detail` (+ component trees, status badges)
- components: `task-status-badge`, `task-run-status-badge`
- routes: `tasks/page.tsx`, `tasks/[id]/page.tsx`
- nav entry + shell i18n (en/es) + tasks context i18n (list/detail/status keys) + parity tests
- wires `Pagination` into both screens.

### PR3 — Schedule + cancel
- infra: add `scheduleTask` + `cancelTask` (mutations, responses, repo methods, stringify boundary) + spec additions
- use-cases: `schedule-task`, `cancel-task` (+ specs)
- hooks: `useScheduleTask`, `useCancelTask` (+ specs)
- components: `schedule-task-modal` (template picker), cancel `ConfirmModal` wiring in detail
- schema: `schedule-task.schema.ts`
- i18n: `schedule` keys (en/es)

### PR4 — Templates list + CRUD
- infra: `createTemplate`/`updateTemplate`/`deleteTemplate` (mutations, responses, repo, stringify) + spec additions
- use-cases: `create-template`, `update-template`, `delete-template` (+ specs)
- hooks: `useTaskTemplates`, `useTaskTemplate`, `useCreateTaskTemplate`, `useUpdateTaskTemplate`, `useDeleteTaskTemplate` (+ specs)
- screens/components: `templates-list`, `template-form` (create+edit), delete confirm
- routes: `tasks/templates/page.tsx`, `tasks/templates/new/page.tsx`, `tasks/templates/[id]/page.tsx`
- schema: `task-template.schema.ts`
- i18n: `templates` keys (en/es)

> PR4 may split into 4a (read: templates list + read hooks/route) and 4b (CRUD mutations + form) if it exceeds the 400-line budget.

---

## 11. ADR-style Decisions

### ADR-1 — `I`-prefixed domain interfaces for tasks
**Decision**: Use `ITask` / `ITaskRun` / `ITaskTemplate`. **Context**: existing contexts use unprefixed names (`Plant`, `Space`); the brief explicitly requests the `I` prefix. **Rationale**: honor the brief; keep the deviation localized to the tasks context. **Rejected**: unprefixed names (would match plants/spaces but contradict the brief).

### ADR-2 — Apollo in infra, React Query in presentation
**Decision**: Repositories call `apolloClient.query/mutate`; hooks use `@tanstack/react-query`. **Rationale**: this is the established codebase pattern (`use-plants.hook.ts`). **Rejected**: Apollo `useQuery` hooks (would split the data-fetching convention and bypass the port/use-case seam — breaks hexagonal layering and TDD mockability).

### ADR-3 — `payload` JSON boundary centralized in mappers
**Decision**: `JSON.parse`/`stringify` only inside infra mappers; domain holds typed objects. **Rationale**: keeps the string/object impedance mismatch out of domain/application/presentation; single place to harden parsing. **Rejected**: parsing in hooks/components (would leak transport concerns and duplicate parsing logic).

### ADR-4 — Pagination is controlled & presentational
**Decision**: stateless component, parent owns `page`/`pageSize`, forwarded to GraphQL `pagination`. **Rationale**: single source of truth (screen state), trivially testable, reusable across tasks + templates. **Rejected**: self-stateful pagination (would desync from server query state and complicate invalidation).

### ADR-5 — `NavItemKey` extended via shell dict, not manual union
**Decision**: add `tasks` to both shell locale `nav` objects; `NavItemKey` widens automatically. **Rationale**: the type is derived; a manual union would drift from the dict. **Rejected**: hardcoding a union (redundant, error-prone, parity test wouldn't guard it).

---

## 12. Risks & Open Questions

| Item | Status | Resolution path |
|------|--------|-----------------|
| Exact GraphQL enum member names | Open | Verify against live schema during `sdd-apply`; enums are the single update point |
| Exact GraphQL query/mutation field names + `pagination` input shape | Open | Confirm in `apply` against schema; only `queries/`/`mutations/`/`responses/` change |
| Backend pagination semantics (1-based page vs offset/limit) | Open | Mapper translates; UI stays 1-based |
| `payload` editor UX (raw JSON textarea vs structured form) | Decided | Raw JSON textarea + Zod `JSON.parse` validation for v1; structured form deferred |
| PR4 size | Watch | Split into 4a/4b if > 400 lines |

## 13. Success Criteria Mapping

- Paginated task list + detail + run history → PR1 (foundation) + PR2
- Schedule from template + cancel → PR3
- Template list + CRUD → PR4
- Reusable `Pagination` → PR1, consumed in PR2/PR3/PR4
- en/es parity + nav without TS errors → PR2 nav/i18n + per-context parity tests
