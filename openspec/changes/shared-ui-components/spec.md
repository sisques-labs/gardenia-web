# Shared UI Components Specification

**Change:** `shared-ui-components`
**Status:** spec
**Artifact store:** openspec

---

## Purpose

Specify the behavioral contracts for 46 new shared UI components and one card.tsx fix. All components live at `src/shared/presentation/components/ui/{name}.tsx` with co-located `{name}.test.tsx` written test-first (Strict TDD). Every component MUST use `React.forwardRef`, explicit props interface, `cn()`, and `cva()` where multi-variant.

---

## Global Conventions (apply to ALL 46 components)

- MUST use `React.forwardRef` with explicit named props interface.
- MUST use `cn()` from `@/shared/lib/utils` for className merging.
- MUST use `cva()` from `class-variance-authority` for any component with 2+ visual variants.
- MUST use CSS custom properties (`var(--forest)`, `var(--paper)`, `var(--ink)`, etc.) for design tokens — never hard-code color values.
- MUST use `lucide-react` for all icons; MUST NOT import from any other icon library.
- MUST NOT import any chart library; charts are pure SVG.
- MUST expose `className` prop merged with internal classes via `cn()`.
- SHOULD expose `data-testid` via spread props (no explicit `data-testid` prop required).
- Test files MUST be written before implementation (RED → GREEN, Strict TDD).

---

## Fix: card.tsx radius alignment

### Requirement: Card uses design-system radius token

The `Card` component (existing file `src/shared/presentation/components/ui/card.tsx`) MUST use the `.card` CSS utility class for border-radius instead of the `rounded-xl` Tailwind class, aligning with the Cloudé 6px radius token.

The updated className string MUST be `cn('card border bg-card text-card-foreground shadow', className)`.

#### Scenario: Card renders with correct radius class

- GIVEN the Card component is rendered
- WHEN the rendered element is inspected
- THEN it has the CSS class `card` and does NOT have class `rounded-xl`

#### Scenario: Consumer className override still works

- GIVEN a consumer renders `<Card className="p-4" />`
- WHEN the element is inspected
- THEN it has both the `card` class and `p-4`

#### Scenario: No regression in CardHeader, CardTitle, CardContent, CardFooter

- GIVEN the four sub-components are rendered
- WHEN inspected
- THEN their class strings are unchanged from before the fix

---

## Group 1 — Feedback Primitives

### Requirement: Spinner

The `Spinner` component MUST render an animated circular loading indicator. It MUST support `size` variants (`sm | md | lg`) and MUST carry `role="status"` with a screen-reader label.

**Props:** `size?: 'sm' | 'md' | 'lg'` (default `md`), `label?: string` (default `'Loading…'`), `className?`

#### Scenario: Default render

- GIVEN `<Spinner />` is rendered
- WHEN the DOM is inspected
- THEN an element with `role="status"` is present and contains a visually-hidden text "Loading…"

#### Scenario: Size variant applies correct class

- GIVEN `<Spinner size="lg" />` is rendered
- WHEN the element class list is read
- THEN it includes the CVA-generated class for the `lg` size variant

#### Scenario: Custom label

- GIVEN `<Spinner label="Saving changes" />`
- WHEN assistive text is queried
- THEN the screen-reader text reads "Saving changes"

---

### Requirement: Skeleton

The `Skeleton` component MUST render a rectangular placeholder with a shimmer wave animation. It MUST accept `width`, `height`, and `variant` (`line | circle | block`) props.

**Props:** `variant?: 'line' | 'circle' | 'block'` (default `block`), `width?: string | number`, `height?: string | number`, `className?`

#### Scenario: Default block variant renders

- GIVEN `<Skeleton />` is rendered
- WHEN inspected
- THEN a div with shimmer animation class is present

#### Scenario: Circle variant produces equal width/height

- GIVEN `<Skeleton variant="circle" width={40} height={40} />`
- WHEN inspected
- THEN the element has `rounded-full` class and explicit dimension styles

#### Scenario: Aria hidden

- GIVEN `<Skeleton />` is rendered
- WHEN screen reader accessibility is checked
- THEN the element has `aria-hidden="true"`

---

### Requirement: ProgressBar

The `ProgressBar` component MUST render a horizontal progress indicator. It MUST support `variant` (`determinate | indeterminate | stepped`), a numeric `value` (0–100) for determinate, and a `steps` count + `currentStep` for stepped variant. It MUST carry correct ARIA attributes.

**Props:** `variant?: 'determinate' | 'indeterminate' | 'stepped'` (default `determinate`), `value?: number` (0–100), `steps?: number`, `currentStep?: number`, `className?`

#### Scenario: Determinate fills to value

- GIVEN `<ProgressBar value={60} />`
- WHEN rendered
- THEN the fill element has width 60% and `aria-valuenow={60}`

#### Scenario: Indeterminate has no aria-valuenow

- GIVEN `<ProgressBar variant="indeterminate" />`
- WHEN rendered
- THEN `aria-valuenow` is absent and the bar carries an animation class

#### Scenario: Stepped renders correct segment count

- GIVEN `<ProgressBar variant="stepped" steps={4} currentStep={2} />`
- WHEN rendered
- THEN 4 segment elements exist and 2 are visually marked as completed

---

### Requirement: EmptyState

The `EmptyState` component MUST render a centered illustration area, a heading, optional body text, and an optional action button. It MUST accept an `icon` node, `title`, `description`, and `action` render prop.

**Props:** `icon?: React.ReactNode`, `title: string`, `description?: string`, `action?: React.ReactNode`, `className?`

#### Scenario: Renders title and description

- GIVEN `<EmptyState title="No plants yet" description="Add your first plant" />`
- WHEN rendered
- THEN elements with text "No plants yet" and "Add your first plant" are in the document

#### Scenario: Action renders inside component

- GIVEN `action={<button>Add plant</button>}` passed to EmptyState
- WHEN rendered
- THEN a button with text "Add plant" is present inside the EmptyState

#### Scenario: Icon is optional

- GIVEN `<EmptyState title="Empty" />` with no icon prop
- WHEN rendered
- THEN component renders without error and title is visible

---

## Group 2 — Avatar & User Patterns

### Requirement: InitialsAvatar

`InitialsAvatar` MUST render a circular element displaying 1–2 initials derived from a `name` prop. It MUST assign a deterministic background color from the design palette based on the name. It MUST NOT use or modify the existing Radix `Avatar` component. It MUST support `size` variants (`xs | sm | md | lg`).

**Props:** `name: string`, `size?: 'xs' | 'sm' | 'md' | 'lg'` (default `md`), `className?`

#### Scenario: Renders correct initials

- GIVEN `<InitialsAvatar name="John Doe" />`
- WHEN rendered
- THEN displayed text is "JD"

#### Scenario: Single name renders one initial

- GIVEN `<InitialsAvatar name="Ana" />`
- WHEN rendered
- THEN displayed text is "A"

#### Scenario: Background color is deterministic

- GIVEN the same `name` rendered twice in separate renders
- WHEN both background color classes are compared
- THEN they are identical

---

### Requirement: AvatarGroup

`AvatarGroup` MUST render a horizontally-overlapping stack of `InitialsAvatar` components. When the count exceeds `max`, it MUST show a `+N` overflow chip. It MUST accept an array of `items` with a `name` field.

**Props:** `items: Array<{ name: string }>`, `max?: number` (default `4`), `size?: 'xs' | 'sm' | 'md' | 'lg'`, `className?`

#### Scenario: Renders up to max avatars

- GIVEN `items` with 6 names and `max={4}`
- WHEN rendered
- THEN 4 InitialsAvatar components and a "+2" chip are visible

#### Scenario: No overflow when items ≤ max

- GIVEN `items` with 3 names and `max={4}`
- WHEN rendered
- THEN 3 InitialsAvatar components are visible and no overflow chip appears

#### Scenario: Each avatar has accessible name

- GIVEN `items={[{ name: "Maria" }]}`
- WHEN rendered
- THEN an element with `aria-label="Maria"` is present

---

### Requirement: NumericBadge

`NumericBadge` MUST render a small pill with a number. When `count` exceeds `max`, it MUST display `{max}+`. It MUST support `variant` (`default | primary | danger`).

**Props:** `count: number`, `max?: number` (default `99`), `variant?: 'default' | 'primary' | 'danger'` (default `default`), `className?`

#### Scenario: Renders count directly

- GIVEN `<NumericBadge count={5} />`
- WHEN rendered
- THEN text "5" is visible

#### Scenario: Caps at max

- GIVEN `<NumericBadge count={150} max={99} />`
- WHEN rendered
- THEN text "99+" is visible

#### Scenario: Danger variant applies correct class

- GIVEN `<NumericBadge count={3} variant="danger" />`
- WHEN class list inspected
- THEN CVA danger variant class is present

---

### Requirement: UserCard

`UserCard` MUST render a user representation combining `InitialsAvatar`, display name, and optional secondary line (role or email). It MUST support horizontal and vertical `orientation` variants.

**Props:** `name: string`, `secondary?: string`, `orientation?: 'horizontal' | 'vertical'` (default `horizontal`), `size?: 'sm' | 'md' | 'lg'`, `className?`

#### Scenario: Renders name and secondary

- GIVEN `<UserCard name="Ana García" secondary="admin" />`
- WHEN rendered
- THEN "Ana García" and "admin" are in the document

#### Scenario: Vertical orientation class applied

- GIVEN `<UserCard name="Bob" orientation="vertical" />`
- WHEN class inspected
- THEN container has flex-col class or equivalent CVA vertical variant class

#### Scenario: Missing secondary renders gracefully

- GIVEN `<UserCard name="Solo" />` with no secondary
- WHEN rendered
- THEN no empty element is added for the secondary slot

---

### Requirement: Pagination

`Pagination` MUST render page navigation controls (previous, page numbers, next). It MUST call `onPageChange(page)` when a page is selected. It MUST disable previous on page 1 and next on the last page.

**Props:** `page: number`, `totalPages: number`, `onPageChange: (page: number) => void`, `className?`

#### Scenario: Previous disabled on first page

- GIVEN `<Pagination page={1} totalPages={5} onPageChange={fn} />`
- WHEN rendered
- THEN the previous button has `disabled` or `aria-disabled="true"`

#### Scenario: Calls onPageChange with correct value

- GIVEN `<Pagination page={2} totalPages={5} onPageChange={fn} />`
- WHEN page 4 button is clicked
- THEN `fn` is called with argument `4`

#### Scenario: Next disabled on last page

- GIVEN `<Pagination page={5} totalPages={5} onPageChange={fn} />`
- WHEN rendered
- THEN the next button is disabled

---

## Group 3 — Form Extensions

### Requirement: SearchInput

`SearchInput` MUST compose the existing `Input` component (not fork it). It MUST render a search icon on the left and an optional clear button when the input has a value. It MUST forward `ref` to the underlying `<input>`.

**Props:** Extends `React.InputHTMLAttributes<HTMLInputElement>`. Additional: `onClear?: () => void`, `className?`

#### Scenario: Search icon is always visible

- GIVEN `<SearchInput placeholder="Search" />`
- WHEN rendered
- THEN a lucide Search icon element is in the document

#### Scenario: Clear button appears when value is present

- GIVEN `<SearchInput value="hello" onClear={fn} />`
- WHEN rendered
- THEN a clear button is visible and clicking it calls `fn`

#### Scenario: Ref forwarded to input

- GIVEN a ref is passed to `<SearchInput />`
- WHEN the ref is accessed after mount
- THEN it points to the `<input>` element

---

### Requirement: PasswordInput

`PasswordInput` MUST compose the existing `Input` component. It MUST render a toggle button to switch between `type="password"` and `type="text"`. The toggle MUST be keyboard-accessible with `aria-label` reflecting current state.

**Props:** Extends `React.InputHTMLAttributes<HTMLInputElement>`. Inherits `type` but overrides it internally. `className?`

#### Scenario: Default type is password

- GIVEN `<PasswordInput />`
- WHEN rendered
- THEN the underlying input has `type="password"`

#### Scenario: Toggle reveals password

- GIVEN `<PasswordInput />`
- WHEN the toggle button is clicked
- THEN the input type changes to `text`

#### Scenario: Toggle button has accessible label

- GIVEN `<PasswordInput />`
- WHEN toggle button is inspected
- THEN it has `aria-label` of "Show password" or "Hide password" based on current state

---

### Requirement: Slider

`Slider` MUST render a styled native `<input type="range">`. It MUST support `min`, `max`, `step`, and `value` / `defaultValue`. It MUST display the current value optionally via `showValue` prop.

**Props:** `min?: number`, `max?: number`, `step?: number`, `value?: number`, `defaultValue?: number`, `onChange?: (value: number) => void`, `showValue?: boolean`, `className?`

#### Scenario: Renders with correct range attributes

- GIVEN `<Slider min={0} max={100} step={5} defaultValue={50} />`
- WHEN rendered
- THEN `<input type="range">` has min=0, max=100, step=5

#### Scenario: Shows current value when showValue is true

- GIVEN `<Slider value={30} showValue />`
- WHEN rendered
- THEN text "30" is visible in the document

#### Scenario: onChange fires with numeric value

- GIVEN `<Slider onChange={fn} />`
- WHEN the range input fires a change event with value "75"
- THEN `fn` is called with the number `75`

---

### Requirement: TagsInput

`TagsInput` MUST render a text input that allows adding multiple string tags. Tags MUST be removable. Pressing Enter or comma MUST add the current input value as a tag. It MUST be controllable via `value` and `onChange`.

**Props:** `value?: string[]`, `defaultValue?: string[]`, `onChange?: (tags: string[]) => void`, `placeholder?: string`, `className?`

#### Scenario: Enter key adds a tag

- GIVEN `<TagsInput />`
- WHEN user types "tomato" and presses Enter
- THEN a tag chip with "tomato" appears and the input is cleared

#### Scenario: Tag can be removed

- GIVEN `<TagsInput value={['rose']} onChange={fn} />`
- WHEN the remove button on the "rose" chip is clicked
- THEN `onChange` is called with an empty array

#### Scenario: Duplicate tags are rejected

- GIVEN `<TagsInput value={['fern']} onChange={fn} />`
- WHEN user types "fern" and presses Enter
- THEN `onChange` is NOT called (tag already exists)

---

### Requirement: Combobox

`Combobox` MUST render a text input that filters a list of options and allows selecting one. It MUST be keyboard navigable (Arrow keys, Enter to select, Escape to close). The implementation backing (cmdk vs pure DOM) is decided in the design phase, but this behavior contract is fixed.

**Props:** `options: Array<{ value: string; label: string }>`, `value?: string`, `onChange?: (value: string) => void`, `placeholder?: string`, `className?`

#### Scenario: Options filtered by input

- GIVEN `options=[{value:'rose', label:'Rose'}, {value:'fern', label:'Fern'}]` and user types "ro"
- WHEN the listbox is open
- THEN only "Rose" is visible in the list

#### Scenario: Selecting an option calls onChange

- GIVEN the combobox is open with options
- WHEN user clicks or presses Enter on "Fern"
- THEN `onChange` is called with "fern"

#### Scenario: Escape closes the dropdown

- GIVEN the combobox is open
- WHEN Escape is pressed
- THEN the option list is no longer visible

---

### Requirement: FileUpload

`FileUpload` MUST render a drag-and-drop zone plus a file picker button. It MUST accept `accept`, `multiple`, and `maxSizeMB` props. It MUST display selected file names. It MUST reject files that exceed `maxSizeMB` and display an error.

**Props:** `accept?: string`, `multiple?: boolean`, `maxSizeMB?: number`, `onChange?: (files: File[]) => void`, `className?`

#### Scenario: File selection triggers onChange

- GIVEN `<FileUpload onChange={fn} />`
- WHEN a valid file is selected via the picker
- THEN `fn` is called with an array containing that file

#### Scenario: Oversized file shows error

- GIVEN `<FileUpload maxSizeMB={1} />`
- WHEN a 5 MB file is dropped
- THEN an error message about file size is visible

#### Scenario: Multiple accepts multiple files

- GIVEN `<FileUpload multiple onChange={fn} />`
- WHEN two files are selected
- THEN `fn` is called with an array of length 2

---

### Requirement: DatePicker

`DatePicker` MUST render a text input that opens a month-grid calendar. It MUST use no external date library (self-contained month-grid math). It MUST support controlled `value` (ISO date string) and `onChange`. It MUST close on date selection or Escape.

**Props:** `value?: string`, `onChange?: (isoDate: string) => void`, `minDate?: string`, `maxDate?: string`, `placeholder?: string`, `className?`

#### Scenario: Calendar opens on input focus

- GIVEN `<DatePicker />`
- WHEN the input receives focus
- THEN a calendar grid is rendered in the document

#### Scenario: Selecting a date closes calendar and calls onChange

- GIVEN the calendar is open
- WHEN user clicks on a valid date cell
- THEN the calendar closes and `onChange` is called with the ISO date string

#### Scenario: Dates before minDate are disabled

- GIVEN `<DatePicker minDate="2024-06-01" />`
- WHEN the calendar is open and showing May 2024
- THEN all date cells are disabled (not clickable)

---

## Group 4 — Data & Charts

### Requirement: PlantCard

`PlantCard` MUST render a plant entity card using the `.card` CSS class. It MUST display the plant `name`, optional `species`, a `status` chip (using the existing `Chip` component), and an optional thumbnail image.

**Props:** `name: string`, `species?: string`, `status?: string`, `imageUrl?: string`, `className?`

#### Scenario: Renders name and species

- GIVEN `<PlantCard name="Monstera" species="M. deliciosa" />`
- WHEN rendered
- THEN "Monstera" and "M. deliciosa" are visible

#### Scenario: Status chip renders

- GIVEN `<PlantCard name="Fern" status="healthy" />`
- WHEN rendered
- THEN a chip element with text "healthy" is present

#### Scenario: Missing imageUrl renders no broken img

- GIVEN `<PlantCard name="Rose" />` with no imageUrl
- WHEN rendered
- THEN no `<img>` element with an empty or undefined src is present

---

### Requirement: BarChart

`BarChart` MUST render a pure SVG bar chart from a `data` array of `{ label: string; value: number }`. It MUST render bars proportional to the maximum value. It MUST render axis labels. No chart library MUST be used.

**Props:** `data: Array<{ label: string; value: number }>`, `height?: number` (default `200`), `className?`

#### Scenario: Renders correct bar count

- GIVEN `data` with 5 entries
- WHEN rendered
- THEN 5 SVG rect elements are present

#### Scenario: Bar heights are proportional

- GIVEN `data=[{label:'A', value:100}, {label:'B', value:50}]`
- WHEN rendered
- THEN bar B's height attribute is half of bar A's

#### Scenario: Labels are rendered

- GIVEN `data=[{label:'Jan', value:10}]`
- WHEN rendered
- THEN a text element with "Jan" is present in the SVG

---

### Requirement: LineAreaChart

`LineAreaChart` MUST render a pure SVG line chart with filled area under the line. It MUST accept `data` of `{ x: number | string; y: number }[]`. It MUST use a `polyline` for the line and a `polygon` (or `path`) for the filled area.

**Props:** `data: Array<{ x: number | string; y: number }>`, `height?: number` (default `200`), `className?`

#### Scenario: Renders SVG polyline

- GIVEN `data` with 4 points
- WHEN rendered
- THEN an SVG `polyline` element is present

#### Scenario: Renders filled area element

- GIVEN `data` with 4 points
- WHEN rendered
- THEN a `polygon` or `path` element representing the filled area is present

#### Scenario: SVG has viewBox

- GIVEN any data input
- WHEN rendered
- THEN the root `<svg>` has a `viewBox` attribute set

---

### Requirement: DonutChart

`DonutChart` MUST render a pure SVG donut (ring) chart using `circle` elements with `strokeDasharray` / `strokeDashoffset`. It MUST accept `segments` of `{ label: string; value: number; color?: string }[]`. It MUST render an optional center label.

**Props:** `segments: Array<{ label: string; value: number; color?: string }>`, `centerLabel?: string`, `size?: number` (default `120`), `className?`

#### Scenario: Renders a circle per segment

- GIVEN `segments` with 3 entries
- WHEN rendered
- THEN 3 SVG `circle` elements are present

#### Scenario: Center label rendered

- GIVEN `<DonutChart segments={[...]} centerLabel="12 plants" />`
- WHEN rendered
- THEN text "12 plants" is in the SVG

#### Scenario: Segments cover full circumference

- GIVEN `segments=[{label:'A', value:75}, {label:'B', value:25}]`
- WHEN `strokeDasharray` values are summed
- THEN they equal the full circumference of the circle

---

### Requirement: Sparkline

`Sparkline` MUST render a compact inline SVG line chart with no axes or labels. It MUST accept a `data` array of numbers.

**Props:** `data: number[]`, `width?: number` (default `80`), `height?: number` (default `24`), `className?`

#### Scenario: Renders SVG polyline

- GIVEN `<Sparkline data={[1, 3, 2, 5, 4]} />`
- WHEN rendered
- THEN an SVG `polyline` element is in the document

#### Scenario: Accepts single-point data without error

- GIVEN `<Sparkline data={[5]} />`
- WHEN rendered
- THEN no error is thrown and an SVG is present

#### Scenario: Width and height applied to SVG

- GIVEN `<Sparkline data={[1,2]} width={100} height={30} />`
- WHEN SVG element is inspected
- THEN it has `width="100"` and `height="30"`

---

## Group 5 — Layout Patterns

### Requirement: Accordion

`Accordion` MUST render a list of collapsible panels. It MUST support `single` (one open at a time) and `multiple` (any number open) modes. Each panel MUST have a trigger button and animated content area. It MUST follow WAI-ARIA accordion pattern.

**Props:** `items: Array<{ id: string; title: string; content: React.ReactNode }>`, `mode?: 'single' | 'multiple'` (default `single`), `defaultOpen?: string[]`, `className?`

#### Scenario: Panel expands on click

- GIVEN an Accordion with 2 items, all collapsed
- WHEN the first item's trigger is clicked
- THEN the first item's content is visible

#### Scenario: Single mode closes previous

- GIVEN mode="single" and item 1 is open
- WHEN item 2's trigger is clicked
- THEN item 1's content is hidden and item 2's content is visible

#### Scenario: Trigger has correct ARIA attributes

- GIVEN any Accordion item
- WHEN the trigger button is inspected
- THEN it has `aria-expanded` reflecting open/closed state

---

### Requirement: Timeline

`Timeline` MUST render a vertical list of events, each with a timestamp, title, and optional description. Each event MUST have a dot connector on the timeline axis.

**Props:** `events: Array<{ id: string; timestamp: string; title: string; description?: string }>`, `className?`

#### Scenario: Renders all events

- GIVEN `events` with 3 entries
- WHEN rendered
- THEN 3 timeline event elements are visible

#### Scenario: Timestamp is displayed

- GIVEN an event with `timestamp="2024-01-15"`
- WHEN rendered
- THEN the text "2024-01-15" (or a formatted version of it) is in the document

#### Scenario: Description is optional

- GIVEN an event with no description field
- WHEN rendered
- THEN no empty description element is rendered

---

### Requirement: Stepper

`Stepper` MUST render a horizontal step indicator showing progress through a multi-step flow. It MUST support `completed`, `active`, and `upcoming` step states. Each step MUST have a label.

**Props:** `steps: Array<{ id: string; label: string }>`, `currentStep: number`, `className?`

#### Scenario: Active step is visually indicated

- GIVEN `<Stepper steps={[...]} currentStep={1} />` (0-indexed)
- WHEN rendered
- THEN the second step element has an active-state class or `aria-current="step"`

#### Scenario: Completed steps are marked

- GIVEN currentStep=2 with 4 steps
- WHEN rendered
- THEN steps 0 and 1 have a completed-state class or checkmark indicator

#### Scenario: Upcoming steps are visually distinct

- GIVEN currentStep=0 with 3 steps
- WHEN rendered
- THEN steps 1 and 2 have an upcoming-state class distinct from active

---

### Requirement: Divider

`Divider` MUST render a horizontal or vertical separator line. It MUST support an optional `label` centered in the line.

**Props:** `orientation?: 'horizontal' | 'vertical'` (default `horizontal`), `label?: string`, `className?`

#### Scenario: Renders horizontal separator by default

- GIVEN `<Divider />`
- WHEN rendered
- THEN an `<hr>` or div with `role="separator"` is present

#### Scenario: Label renders centered

- GIVEN `<Divider label="OR" />`
- WHEN rendered
- THEN text "OR" is in the document within the divider structure

#### Scenario: Vertical orientation applies correct class

- GIVEN `<Divider orientation="vertical" />`
- WHEN class list inspected
- THEN a CVA vertical-variant class is applied

---

### Requirement: FilterBar

`FilterBar` MUST compose `SearchInput`, `Select` (existing), and `DropdownMenu` (existing) to render a combined search + filter + sort bar. It MUST emit change events for each control independently. It MUST support a view-mode toggle (grid/list).

**Props:** `onSearch?: (q: string) => void`, `onFilterChange?: (filters: Record<string, string>) => void`, `onSortChange?: (sort: string) => void`, `onViewChange?: (view: 'grid' | 'list') => void`, `className?`

#### Scenario: Search change propagates

- GIVEN `<FilterBar onSearch={fn} />`
- WHEN user types in the search input
- THEN `fn` is called with the current input value

#### Scenario: View toggle calls onViewChange

- GIVEN `<FilterBar onViewChange={fn} />`
- WHEN the grid/list toggle is activated
- THEN `fn` is called with the new view mode

#### Scenario: All controls render

- GIVEN `<FilterBar />`
- WHEN rendered
- THEN a search input, a sort control, and a view toggle are present in the document

---

### Requirement: ActiveFilterChips

`ActiveFilterChips` MUST render a row of chips representing active filter values. Each chip MUST have a remove button that calls `onRemove(key)`. It MUST render nothing when `filters` is empty.

**Props:** `filters: Array<{ key: string; label: string }>`, `onRemove: (key: string) => void`, `className?`

#### Scenario: Renders chip per filter

- GIVEN `filters=[{key:'color', label:'Green'}]`
- WHEN rendered
- THEN one chip with "Green" is visible

#### Scenario: Remove button calls onRemove

- GIVEN a chip for key "color"
- WHEN its remove button is clicked
- THEN `onRemove` is called with "color"

#### Scenario: Empty filters renders nothing

- GIVEN `filters=[]`
- WHEN rendered
- THEN no chip element is present in the document

---

### Requirement: FacetPanel

`FacetPanel` MUST render a list of filter groups, each with a label and checkbox options. Checking a box MUST call `onChange(facetKey, selectedValues)`.

**Props:** `facets: Array<{ key: string; label: string; options: Array<{ value: string; label: string }> }>`, `selected?: Record<string, string[]>`, `onChange?: (key: string, values: string[]) => void`, `className?`

#### Scenario: Renders facet groups

- GIVEN `facets` with 2 groups
- WHEN rendered
- THEN 2 facet group headings are visible

#### Scenario: Checking an option calls onChange

- GIVEN a facet with option "red"
- WHEN the "red" checkbox is clicked
- THEN `onChange` is called with the facet key and `['red']`

#### Scenario: Pre-selected options are checked

- GIVEN `selected={{ color: ['green'] }}`
- WHEN the "green" checkbox is inspected
- THEN it is in checked state

---

### Requirement: SortPills

`SortPills` MUST render a row of pill buttons representing sort options. The active sort MUST be visually distinguished. Clicking a pill MUST call `onSort(value)`.

**Props:** `options: Array<{ value: string; label: string }>`, `value?: string`, `onSort?: (value: string) => void`, `className?`

#### Scenario: Active pill is visually distinct

- GIVEN `<SortPills options={[...]} value="name" />`
- WHEN rendered
- THEN the "name" pill has an active-variant class

#### Scenario: Clicking inactive pill calls onSort

- GIVEN `value="name"` and user clicks the "date" pill
- WHEN clicked
- THEN `onSort` is called with "date"

#### Scenario: Renders all option pills

- GIVEN 3 sort options
- WHEN rendered
- THEN 3 button elements are present

---

### Requirement: CalendarMonth

`CalendarMonth` MUST render a full month grid (7 columns × ~5 rows). It MUST accept a `year` and `month` (1-indexed). It MUST highlight today. It MUST NOT use any external date library. It MAY accept `onDateClick(isoDate)`.

**Props:** `year: number`, `month: number`, `onDateClick?: (isoDate: string) => void`, `className?`

#### Scenario: Renders 7 day-of-week headers

- GIVEN `<CalendarMonth year={2024} month={6} />`
- WHEN rendered
- THEN 7 column header elements are present

#### Scenario: Correct number of day cells rendered

- GIVEN June 2024 (30 days)
- WHEN rendered
- THEN 30 day cells with the correct dates are present (plus leading/trailing placeholders)

#### Scenario: Clicking a date calls onDateClick with ISO string

- GIVEN `<CalendarMonth year={2024} month={6} onDateClick={fn} />`
- WHEN day cell "15" is clicked
- THEN `fn` is called with "2024-06-15"

---

### Requirement: WeekStrip

`WeekStrip` MUST render a horizontal 7-day strip for a given ISO week start date. It MUST highlight today. It MUST support an `activeDate` prop and call `onDateClick(isoDate)` on cell click.

**Props:** `weekStartDate: string`, `activeDate?: string`, `onDateClick?: (isoDate: string) => void`, `className?`

#### Scenario: Renders 7 day cells

- GIVEN `<WeekStrip weekStartDate="2024-06-10" />`
- WHEN rendered
- THEN exactly 7 day cell elements are present

#### Scenario: Active date is highlighted

- GIVEN `<WeekStrip weekStartDate="2024-06-10" activeDate="2024-06-12" />`
- WHEN rendered
- THEN the cell for June 12 has an active-state class

#### Scenario: Click propagates to onDateClick

- GIVEN `<WeekStrip weekStartDate="2024-06-10" onDateClick={fn} />`
- WHEN the cell for "2024-06-11" is clicked
- THEN `fn` is called with "2024-06-11"

---

### Requirement: EventCard

`EventCard` MUST render a card for a calendar event with `title`, `time`, optional `location`, and a color `accent`. It MUST use the `.card` CSS class.

**Props:** `title: string`, `time: string`, `location?: string`, `accent?: string`, `className?`

#### Scenario: Renders title and time

- GIVEN `<EventCard title="Water plants" time="09:00" />`
- WHEN rendered
- THEN "Water plants" and "09:00" are visible

#### Scenario: Location is optional

- GIVEN `<EventCard title="Prune" time="10:00" />` with no location
- WHEN rendered
- THEN no empty location element is present

#### Scenario: Accent color applies inline style or class

- GIVEN `<EventCard title="E" time="T" accent="#4CAF50" />`
- WHEN rendered
- THEN the accent element has the color applied via inline style or class

---

## Group 6 — Media

### Requirement: PhotoGrid

`PhotoGrid` MUST render a responsive CSS grid of image thumbnails. It MUST support `columns` count and emit `onPhotoClick(index)` when a thumbnail is clicked.

**Props:** `photos: Array<{ src: string; alt: string }>`, `columns?: number` (default `3`), `onPhotoClick?: (index: number) => void`, `className?`

#### Scenario: Renders correct number of images

- GIVEN `photos` with 6 items
- WHEN rendered
- THEN 6 `<img>` elements are present

#### Scenario: Click emits correct index

- GIVEN `photos` with 3 items and `onPhotoClick={fn}`
- WHEN the second photo is clicked
- THEN `fn` is called with index `1`

#### Scenario: Alt text applied to images

- GIVEN `photos=[{src:'/a.jpg', alt:'Monstera'}]`
- WHEN rendered
- THEN `<img>` has `alt="Monstera"`

---

### Requirement: MediaCard

`MediaCard` MUST render an image with overlay title and optional actions. It MUST support `horizontal` and `vertical` layout variants via CVA.

**Props:** `src: string`, `alt: string`, `title: string`, `description?: string`, `variant?: 'horizontal' | 'vertical'` (default `vertical`), `actions?: React.ReactNode`, `className?`

#### Scenario: Renders image with alt

- GIVEN `<MediaCard src="/p.jpg" alt="Plant" title="Fern" />`
- WHEN rendered
- THEN `<img>` with `alt="Plant"` is present

#### Scenario: Horizontal variant class applied

- GIVEN `<MediaCard variant="horizontal" src="/p.jpg" alt="A" title="B" />`
- WHEN class list inspected
- THEN CVA horizontal variant class is present

#### Scenario: Actions slot renders children

- GIVEN `actions={<button>Delete</button>}` passed to MediaCard
- WHEN rendered
- THEN a button with text "Delete" is present

---

### Requirement: PhotoPicker

`PhotoPicker` MUST render a grid of selectable thumbnails. Selected photos MUST have a visual selection indicator. It MUST emit `onSelectionChange(selectedIndexes)` when selection changes. It MUST support single and multiple selection modes.

**Props:** `photos: Array<{ src: string; alt: string }>`, `mode?: 'single' | 'multiple'` (default `single`), `selected?: number[]`, `onSelectionChange?: (indexes: number[]) => void`, `className?`

#### Scenario: Clicking selects a photo

- GIVEN `<PhotoPicker photos={[...]} onSelectionChange={fn} />`
- WHEN the first photo is clicked
- THEN `fn` is called with `[0]`

#### Scenario: Single mode deselects previous on new click

- GIVEN mode="single" and photo 0 is selected
- WHEN photo 1 is clicked
- THEN `onSelectionChange` is called with `[1]` (not `[0,1]`)

#### Scenario: Selected photo has selection indicator

- GIVEN `<PhotoPicker photos={[{src:'/a.jpg',alt:'A'}]} selected={[0]} />`
- WHEN rendered
- THEN the first thumbnail has a selection indicator (checkmark or border class)

---

### Requirement: Lightbox

`Lightbox` MUST render a full-screen overlay displaying a photo at full size. It MUST support next/previous navigation if multiple photos are provided. It MUST close on Escape key or clicking outside the image. It MUST trap focus while open.

**Props:** `photos: Array<{ src: string; alt: string }>`, `initialIndex?: number` (default `0`), `open: boolean`, `onClose: () => void`, `className?`

#### Scenario: Renders current photo

- GIVEN `<Lightbox photos={[{src:'/a.jpg',alt:'A'}]} open initialIndex={0} onClose={fn} />`
- WHEN rendered
- THEN an `<img>` with `alt="A"` is present

#### Scenario: Escape calls onClose

- GIVEN Lightbox is open
- WHEN Escape key is pressed
- THEN `onClose` is called

#### Scenario: Next button advances photo

- GIVEN Lightbox with 3 photos open at index 0
- WHEN the next button is clicked
- THEN the image src changes to the second photo's src

---

## Group 7 — Rich Content

### Requirement: Callout

`Callout` MUST render an editorial content block with `variant` styles (`info | warning | success | danger | note`). It MUST differ visually and semantically from the functional `Alert` component. It MUST support an icon and body text/children.

**Props:** `variant?: 'info' | 'warning' | 'success' | 'danger' | 'note'` (default `note`), `icon?: React.ReactNode`, `title?: string`, `children: React.ReactNode`, `className?`

#### Scenario: Renders children content

- GIVEN `<Callout>Remember to water daily</Callout>`
- WHEN rendered
- THEN "Remember to water daily" is in the document

#### Scenario: Variant class applied

- GIVEN `<Callout variant="warning">Watch out</Callout>`
- WHEN class list inspected
- THEN CVA warning variant class is present

#### Scenario: Title renders above content

- GIVEN `<Callout title="Tip" variant="info">Content</Callout>`
- WHEN rendered
- THEN "Tip" appears before "Content" in the DOM

---

### Requirement: StarRating

`StarRating` MUST render 1–5 star icons. In interactive mode it MUST update `value` on click and call `onChange(value)`. In read-only mode it MUST render filled/empty stars purely from `value`. Stars MUST be keyboard-accessible in interactive mode.

**Props:** `value?: number` (0–5), `onChange?: (value: number) => void`, `readOnly?: boolean` (default `false`), `max?: number` (default `5`), `className?`

#### Scenario: Renders correct filled stars

- GIVEN `<StarRating value={3} readOnly />`
- WHEN rendered
- THEN 3 filled star elements and 2 empty star elements are present

#### Scenario: Click changes value in interactive mode

- GIVEN `<StarRating value={2} onChange={fn} />`
- WHEN the 4th star is clicked
- THEN `onChange` is called with `4`

#### Scenario: Read-only mode has no interactive affordance

- GIVEN `<StarRating value={3} readOnly />`
- WHEN rendered
- THEN star elements are not buttons and have no `onClick` handlers

---

### Requirement: HealthDots

`HealthDots` MUST render a row of colored dot indicators representing a health/status scale. It MUST map numeric `value` (1–5) to dot fill states.

**Props:** `value: number` (1–5), `max?: number` (default `5`), `className?`

#### Scenario: Renders correct dot count

- GIVEN `<HealthDots value={3} max={5} />`
- WHEN rendered
- THEN 5 dot elements are present

#### Scenario: Filled dots match value

- GIVEN `<HealthDots value={2} max={5} />`
- WHEN rendered
- THEN 2 dots have a filled/active class and 3 do not

#### Scenario: Value 0 renders all empty dots

- GIVEN `<HealthDots value={0} max={5} />`
- WHEN rendered
- THEN 0 dots have a filled/active class

---

### Requirement: KbdShortcut

`KbdShortcut` MUST render one or more keyboard key symbols inside `<kbd>` elements. It MUST accept a `keys` array of strings. It MUST render a separator between keys.

**Props:** `keys: string[]`, `separator?: string` (default `+`), `className?`

#### Scenario: Renders one kbd element per key

- GIVEN `<KbdShortcut keys={['⌘', 'K']} />`
- WHEN rendered
- THEN two `<kbd>` elements are present

#### Scenario: Separator renders between keys

- GIVEN `<KbdShortcut keys={['Ctrl', 'S']} separator="+" />`
- WHEN rendered
- THEN a "+" separator text is between the two kbd elements

#### Scenario: Single key renders without separator

- GIVEN `<KbdShortcut keys={['Escape']} />`
- WHEN rendered
- THEN one `<kbd>` element and no separator are present

---

### Requirement: Blockquote

`Blockquote` MUST render a styled block quote with `variant` styles (`pullquote | diary-note | stat-highlight`). It MUST accept `children` as the quote body and optional `cite` for attribution.

**Props:** `variant?: 'pullquote' | 'diary-note' | 'stat-highlight'` (default `pullquote`), `cite?: string`, `children: React.ReactNode`, `className?`

#### Scenario: Renders as blockquote element

- GIVEN `<Blockquote>Text</Blockquote>`
- WHEN rendered
- THEN a `<blockquote>` element or element with `role="blockquote"` is present

#### Scenario: Cite attribution renders

- GIVEN `<Blockquote cite="Journal">Note</Blockquote>`
- WHEN rendered
- THEN "Journal" is present in the document (as `<cite>` or similar)

#### Scenario: Variant class applied

- GIVEN `<Blockquote variant="stat-highlight">42</Blockquote>`
- WHEN class list inspected
- THEN CVA stat-highlight variant class is present

---

## Group 8 — Overlays

> All overlay components use Radix UI primitives for accessibility. `@radix-ui/react-tooltip`, `@radix-ui/react-popover`, `@radix-ui/react-context-menu` MUST be installed before implementation.

### Requirement: Tooltip

`Tooltip` MUST render an accessible tooltip using `@radix-ui/react-tooltip`. It MUST support 4 side positions (`top | right | bottom | left`). It MUST show on focus and hover. It MUST have `role="tooltip"` via Radix.

**Props:** `content: React.ReactNode`, `side?: 'top' | 'right' | 'bottom' | 'left'` (default `top`), `children: React.ReactElement`, `className?`

#### Scenario: Tooltip content renders on hover

- GIVEN `<Tooltip content="Add plant"><button>+</button></Tooltip>`
- WHEN the button is hovered (or focused in test)
- THEN text "Add plant" is visible in the document

#### Scenario: Tooltip has role="tooltip"

- GIVEN Tooltip is open
- WHEN the content element is inspected
- THEN it has `role="tooltip"`

#### Scenario: Side prop passes to Radix

- GIVEN `<Tooltip content="Info" side="bottom"><button>i</button></Tooltip>`
- WHEN tooltip is open
- THEN the tooltip element is positioned below the trigger (via Radix data attribute)

---

### Requirement: ContextMenu

`ContextMenu` MUST render a right-click context menu using `@radix-ui/react-context-menu`. It MUST accept `items` with label, action, and optional icon. Each item MUST call its `action` handler when clicked.

**Props:** `items: Array<{ label: string; action: () => void; icon?: React.ReactNode; disabled?: boolean }>`, `children: React.ReactElement`, `className?`

#### Scenario: Menu opens on right-click

- GIVEN `<ContextMenu items={[...]}><div>Right click me</div></ContextMenu>`
- WHEN the child element receives a contextmenu event
- THEN menu items are visible in the document

#### Scenario: Clicking item calls action

- GIVEN a menu item with label "Delete" and `action={fn}`
- WHEN "Delete" menu item is clicked
- THEN `fn` is called

#### Scenario: Disabled item is not interactive

- GIVEN an item with `disabled={true}`
- WHEN rendered
- THEN the menu item has `aria-disabled="true"` and clicking it does NOT call action

---

### Requirement: Popover

`Popover` MUST render an anchored floating panel using `@radix-ui/react-popover`. It MUST support controlled (`open` / `onOpenChange`) and uncontrolled modes. It MUST close on outside click and Escape. It MUST trap focus.

**Props:** `trigger: React.ReactElement`, `children: React.ReactNode`, `open?: boolean`, `onOpenChange?: (open: boolean) => void`, `className?`

#### Scenario: Opens on trigger click

- GIVEN `<Popover trigger={<button>Open</button>}>Content</Popover>` (uncontrolled)
- WHEN trigger is clicked
- THEN "Content" is visible

#### Scenario: Escape closes popover

- GIVEN popover is open
- WHEN Escape key is pressed
- THEN popover content is no longer visible

#### Scenario: Outside click closes popover

- GIVEN popover is open
- WHEN user clicks outside the popover panel
- THEN popover content is no longer visible

---

### Requirement: Drawer

`Drawer` MUST render a slide-in panel using `@radix-ui/react-dialog` with a CSS slide animation. It MUST support `side` variants (`left | right | bottom`). It MUST trap focus, have `role="dialog"`, and close on Escape. It MUST NOT use the `vaul` package.

**Props:** `open: boolean`, `onClose: () => void`, `side?: 'left' | 'right' | 'bottom'` (default `right`), `title: string`, `children: React.ReactNode`, `className?`

#### Scenario: Renders children when open

- GIVEN `<Drawer open title="Settings" onClose={fn}>Content</Drawer>`
- WHEN rendered
- THEN "Content" is visible in the document

#### Scenario: Escape calls onClose

- GIVEN Drawer is open
- WHEN Escape key is pressed
- THEN `onClose` is called

#### Scenario: Role dialog present

- GIVEN Drawer is open
- WHEN dialog element is inspected
- THEN it has `role="dialog"` (provided by Radix Dialog)

---

### Requirement: CommandPalette

`CommandPalette` MUST render a modal search overlay activated by ⌘K (or configurable shortcut). It MUST filter commands from a `commands` list by typed query. It MUST support keyboard navigation (Arrow keys, Enter). It MUST close on Escape. The implementation backing (cmdk vs pure DOM) is decided in the design phase; this spec fixes the behavioral contract.

**Props:** `commands: Array<{ id: string; label: string; action: () => void; group?: string }>`, `open: boolean`, `onClose: () => void`, `placeholder?: string`, `className?`

#### Scenario: Renders search input when open

- GIVEN `<CommandPalette commands={[...]} open onClose={fn} />`
- WHEN rendered
- THEN a search input is present in the document

#### Scenario: Filtering narrows visible commands

- GIVEN `commands=[{id:'1',label:'Add plant',...},{id:'2',label:'Delete space',...}]`
- WHEN user types "add"
- THEN only "Add plant" is visible in the list

#### Scenario: Enter on selected item calls action and closes

- GIVEN the first command is keyboard-focused
- WHEN Enter is pressed
- THEN the command's `action` is called and `onClose` is called

---

## Acceptance Criteria Summary

| # | Criterion | Verifiable by |
|---|-----------|---------------|
| 1 | 46 components exist at `src/shared/presentation/components/ui/{name}.tsx` | file presence check |
| 2 | 46 co-located `{name}.test.tsx` files exist | file presence check |
| 3 | `vitest run` passes with zero failures | `pnpm test` |
| 4 | Every component uses `forwardRef` | code review / AST check |
| 5 | Every multi-variant component uses `cva()` | code review |
| 6 | No chart library imported anywhere in new files | `rg 'recharts\|visx\|chartjs'` |
| 7 | `card.tsx` has `card` class and not `rounded-xl` | unit test + grep |
| 8 | 3 Radix packages added (`tooltip`, `popover`, `context-menu`) | package.json diff |
| 9 | No `vaul` in package.json | package.json check |
| 10 | No regressions in existing 23 components | `pnpm test` |
