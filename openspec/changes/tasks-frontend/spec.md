# Tasks Frontend — Specification

## Purpose

Define the behavioral requirements for introducing the `tasks` bounded context in `gardenia-web`: task list, task detail with run history, schedule + cancel flows, task template CRUD, a shared `Pagination` component, and full i18n parity.

All three capabilities (`tasks-management`, `task-templates-management`, `shared-pagination`) are new — no existing spec is modified.

---

## PR1 — Shared Pagination + Domain/Infra Core

### Requirement: R1.1 Pagination Component

The system MUST provide a controlled `Pagination` component under `src/shared/presentation/components/ui/pagination/`. It MUST accept `page`, `pageSize`, `total`, and `onPageChange` as props and MUST NOT own its own state.

#### Scenario: Renders correct page count

- GIVEN `total=25` and `pageSize=10`
- WHEN `Pagination` renders
- THEN it displays 3 total pages and marks page 1 as active

#### Scenario: Calls onPageChange on navigation

- GIVEN `page=1`, `total=25`, `pageSize=10`
- WHEN the user clicks the "next page" control
- THEN `onPageChange` is called with `2`

#### Scenario: Disables previous on first page

- GIVEN `page=1`
- WHEN `Pagination` renders
- THEN the "previous" control is disabled

#### Scenario: Disables next on last page

- GIVEN `page=3`, `total=25`, `pageSize=10`
- WHEN `Pagination` renders
- THEN the "next" control is disabled

### Requirement: R1.2 GraphQL Payload Boundary

The infrastructure mapper MUST parse the `payload` JSON string returned by GraphQL into a typed object before it reaches the domain. On mutations, the mapper MUST serialize the domain object back to a JSON string. No domain layer code SHALL receive or emit raw JSON strings.

#### Scenario: Payload parsed on query response

- GIVEN the GraphQL `taskFindById` returns `payload: '{"cron":"0 * * * *"}'`
- WHEN the repository maps the response
- THEN the domain `Task` object contains `payload: { cron: "0 * * * *" }` as an object

#### Scenario: Payload serialized on mutation input

- GIVEN a domain `Task` with `payload: { cron: "0 * * * *" }`
- WHEN `scheduleTask` is called
- THEN the mutation receives `payload: '{"cron":"0 * * * *"}'` as a string

---

## PR2 — Task List + Detail + Run History

### Requirement: R2.1 Task List Screen with Server-Side Pagination

The task list screen MUST display tasks fetched via `taskFindByCriteria` with `pagination` input forwarded from screen state. Each task row MUST show name, status badge, and scheduled date.

#### Scenario: List renders paginated results

- GIVEN the API returns 12 tasks and `pageSize=10`
- WHEN the task list screen mounts
- THEN 10 task rows are visible and the `Pagination` component shows 2 pages

#### Scenario: Navigating to page 2 refetches

- GIVEN the task list is on page 1
- WHEN the user clicks page 2 in the `Pagination` component
- THEN `taskFindByCriteria` is called with `pagination: { page: 2, pageSize: 10 }`

### Requirement: R2.2 Task Status Badge Mapping

Each task status MUST map to a distinct `Badge` color variant: `pending` → neutral, `active` → info, `completed` → success, `failed` → destructive, `cancelled` → secondary.

#### Scenario: Completed task badge

- GIVEN a task with `status: "completed"`
- WHEN the task row renders
- THEN `data-testid="task-status-badge"` has the success variant

#### Scenario: Failed task badge

- GIVEN a task with `status: "failed"`
- WHEN the task row renders
- THEN `data-testid="task-status-badge"` has the destructive variant

### Requirement: R2.3 Task Detail Screen

The task detail screen MUST display task metadata (name, status, payload fields) and a run history list fetched via `taskRunsFindByTaskId`.

#### Scenario: Run history renders

- GIVEN a task with 3 associated runs
- WHEN the task detail screen mounts
- THEN `data-testid="task-run-list"` contains 3 run entries each with a status and timestamp

#### Scenario: Empty run history

- GIVEN a task with no runs
- WHEN the task detail screen mounts
- THEN `data-testid="task-run-list-empty"` is visible

### Requirement: R2.4 Navigation Entry

A `tasks` entry MUST be added to the sidebar nav. `NavItemKey` union, `ShellDict` type, and both `en.ts` and `es.ts` locale files MUST be updated atomically in the same commit.

#### Scenario: Nav item renders without TypeScript errors

- GIVEN `NavItemKey` includes `"tasks"`
- WHEN the sidebar nav renders
- THEN `data-testid="nav-item-tasks"` is present in the document

---

## PR3 — Schedule + Cancel Flows

### Requirement: R3.1 Schedule Task Modal with Template Picker

The schedule modal MUST load available templates via `taskTemplateFindByCriteria` and render them in a picker. Selecting a template MUST pre-fill the payload fields. Submitting MUST call `scheduleTask`.

#### Scenario: Templates load in picker

- GIVEN 3 templates exist in the API
- WHEN the schedule modal opens
- THEN `data-testid="template-picker"` lists all 3 templates

#### Scenario: Selecting template pre-fills payload

- GIVEN a template with `payload: { cron: "0 8 * * *" }`
- WHEN the user selects that template
- THEN the payload fields in the form reflect `cron = "0 8 * * *"`

#### Scenario: Submit calls scheduleTask

- GIVEN a template is selected and the form is valid
- WHEN the user submits the modal
- THEN `scheduleTask` mutation is called with the serialized payload string

### Requirement: R3.2 Cancel Task Confirm Flow

Cancel MUST only be available for tasks with `status: "pending"`. A `ConfirmModal` MUST be shown before calling `cancelTask`. If the task is not pending the cancel action MUST NOT be rendered.

#### Scenario: Cancel available for pending task

- GIVEN a task with `status: "pending"`
- WHEN the task detail screen renders
- THEN `data-testid="cancel-task-btn"` is present

#### Scenario: Cancel absent for non-pending task

- GIVEN a task with `status: "active"`
- WHEN the task detail screen renders
- THEN `data-testid="cancel-task-btn"` is NOT in the document

#### Scenario: Confirm modal gates cancellation

- GIVEN the user clicks the cancel button
- WHEN the `ConfirmModal` is shown and the user confirms
- THEN `cancelTask` mutation is called with the task id

---

## PR4 — Task Templates List + CRUD

### Requirement: R4.1 Templates List with Pagination

The templates list screen MUST fetch templates via `taskTemplateFindByCriteria` with server-side pagination. Each row MUST show template name and a link to the edit screen.

#### Scenario: Templates list renders paginated

- GIVEN 15 templates exist and `pageSize=10`
- WHEN the templates list mounts
- THEN 10 rows are visible and `Pagination` shows 2 pages

### Requirement: R4.2 Create Template

The create screen MUST validate inputs via a Zod schema before calling `createTaskTemplate`. On success the user MUST be redirected to the templates list.

#### Scenario: Valid form submits mutation

- GIVEN all required fields are filled and pass Zod validation
- WHEN the user submits the create form
- THEN `createTaskTemplate` is called and the user is redirected to the templates list

#### Scenario: Invalid form does not submit

- GIVEN a required field is empty
- WHEN the user submits the create form
- THEN `createTaskTemplate` is NOT called and a validation error is shown

### Requirement: R4.3 Update Template

The update screen MUST pre-populate fields from `taskTemplateFindById` and call `updateTaskTemplate` on submit.

#### Scenario: Form pre-populated on load

- GIVEN a template with `name = "Daily sync"`
- WHEN the update screen mounts
- THEN the name field value is "Daily sync"

### Requirement: R4.4 Delete Template

Delete MUST be guarded by a `ConfirmModal`. On confirm it MUST call `deleteTaskTemplate` and redirect to the templates list.

#### Scenario: Delete confirmed triggers mutation and redirect

- GIVEN the user confirms deletion in the modal
- WHEN the modal confirm action fires
- THEN `deleteTaskTemplate` is called and the user is redirected to the templates list

---

## Cross-Cutting Requirements

### Requirement: CC1 i18n Parity

Every i18n key added to `en.ts` MUST have an equivalent in `es.ts`. The `i18n-parity.test.ts` check MUST pass after each PR that introduces new keys.

#### Scenario: Parity check passes after PR2

- GIVEN task-related keys are added to `en.ts`
- WHEN `i18n-parity.test.ts` runs
- THEN all keys in `en.ts` have a match in `es.ts`

### Requirement: CC2 DDD Layer Isolation

Domain types (`Task`, `TaskRun`, `TaskTemplate`) MUST NOT import from infrastructure or presentation layers. Infrastructure mappers are the ONLY layer that handles raw GraphQL response types.

### Requirement: CC3 Payload Isolation

JSON string serialization/deserialization of `payload` MUST be confined to the infra mapper. It MUST NOT appear in domain interfaces, application use-cases, or presentation hooks.
