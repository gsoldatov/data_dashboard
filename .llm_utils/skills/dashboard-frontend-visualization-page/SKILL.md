---
name: dashboard-frontend-visualization-page
description: Implement or update a dashboard_frontend visualization. Use when you need to change frontend, so it properly displays a visualization of a dataset.
---


# General
A visualization page is a route at `/visualizations/:slug` that displays data from a backend dataset.
The `:slug` maps to an MDX file in `dashboard_frontend/src/components/pages/visualizations/mdx/`.
MDX files are lazy-loaded via `import.meta.glob` and rendered inside `<Visualization>` (`visualization.tsx`),
which handles auth-gated publish-status checks and wraps the MDX content in `<VisualizationDataLoader>`.

Key architectural points:
- All visualizations are registered in `VISUALIZATIONS` (see `dashboard_frontend/src/util/constants.tsx`).
- Data is fetched via the RTK Query `getVisualizationData` endpoint (slug-based, no per-visualization route
  changes needed). Response validation is **mandatory** — every slug must have a Zod schema
  registered in `visualizationDataResponseValidatorMap`, or the fetch will fail with an error.
- The visualization page component (`visualization.tsx`) discovers MDX files automatically — no router
  changes needed when adding a new visualization.
- MDX files are thin: they import chart components from `page-parts/visualizations/mdx/<slug>/` and
  lay them out with Markdown headings. All data fetching and interaction logic lives in the page-part
  components.
- Each chart component calls `useGetVisualizationDataQuery(slug)` independently; RTK Query deduplicates
  identical cache keys into a single network request.
- Publish-status visibility is gated on `useGetCurrentUserQuery()` — admins see all visualizations,
  viewers see only published ones.


# Key Steps
## 1. Getting data from backend and validating it
- Identify the dataset(s) served by the backend at `GET /api/visualization-data/{slug}`.
  See `dashboard_backend/src/routes/visualization_data.py` and
  `dashboard_backend/src/services/visualization_data/__init__.py` for how getters are registered.
- Define Zod schemas in `dashboard_frontend/src/types/visualization-data/<slug>.ts` for each item type.
- Register the slug in `visualizationDataResponseValidatorMap` in
  `dashboard_frontend/src/types/visualization-data/visualization-data.ts`.
  **This is mandatory** — the RTKQ fetch will fail with a `CUSTOM_ERROR` if no validator
  is registered for the slug.
  Use `z.tuple([...])` for fixed-length arrays, `z.array(z.array(...))` for variable-length.


## 2. Creating an MDX page
Reference: `dashboard_frontend/src/components/pages/visualizations/mdx/russia_trade.mdx`,
`russia_inflation.mdx`, `russia_state_budget.mdx`.


### Page structure
- **Placeholder and errors:** handled automatically by `<VisualizationDataLoader>`
  (see `visualization-data-loader.tsx`). Shows `<LoadingPlaceholder>` while fetching,
  `<Error message="Failed to load the page." />` on fetch failure. Nothing extra needed
  in the MDX file.
- **Headers and page sections:** use Markdown headings (`#`, `##`) for the page title and
  section titles. The `<Visualization>` wrapper maps Markdown elements (`h1`, `h2`, `p`, `a`)
  to styled components.
- **Page layout and controls:**
  - `<ChartsContainer>` (see `charts-container.tsx`) — responsive flex row for side-by-side
    charts (stacks vertically on small screens). Accepts `dataTestID`.
  - Chart group components (e.g. `TradeChartGroup`, `CategoryChartGroup`) — parent components
    that hold shared selector state and compose child charts. See
    `trade-chart-group.tsx` and `category-chart-group.tsx`.
  - Selectors: `SingleValueSelector` for picking one value from a list,
    `AttributeDropdown` + `AttributeSelections` for multi-values selections,
    `HierarchyBreadcrumb` + `HierarchySelections` for hierarchical categories.
    All in `dashboard_frontend/src/components/common/visualizations/selectors/`.
- **Which charts to implement:**
  - LineChart, BarChart, Treemap — all from Recharts. See existing implementations for patterns.
  - For bar charts with many items, use a scrollable container (see `country-bar-chart.tsx`:
    `BAR_HEIGHT` constant, `maxHeight` wrapper with `overflow-y: auto`) rather than Recharts
    `<Brush>`, which does not work well with `layout="vertical"`.
  - For treemaps, use Recharts `<Treemap>` with a custom `<content>` cell component
    (see `category-treemap.tsx` for the `TradeTreemapCell` pattern). Use the existing
    `<ChartTooltip>` with a custom `formatter` — no separate tooltip component needed.
  - Data transformation (filtering by year, sorting, unit conversion) happens in `useMemo`
    inside each chart component.
  - Chart components should handle empty data by rendering `<ChartPlaceholder>`.
  - Chart components access data via `useGetVisualizationDataQuery(slug)` directly per the
    RTK Query injection pattern (see memory: RTK Query injection pattern).

## 3. Updating the index page
Add the new visualization to the `VISUALIZATIONS` array in
`dashboard_frontend/src/util/constants.tsx`. The index page (`index.tsx`) reads this array
to render visualization links — no further changes needed.


# Testing
Reference: `dashboard_frontend/tests/tests/components/pages/visualizations/russia-trade/`,
`russia-inflation/`, `russia-state-budget/`.


## Test files to create (one per concern)
- **`validation.test.tsx`** — synchronous Zod schema tests (wrong types, missing fields, wrong
  tuple length, empty arrays, valid data) plus one smoke render test that renders `<App />`
  and waits for the page title. Import the schema from `visualizationDataResponseValidatorMap`.
- **`placeholders-and-title.test.tsx`** — network error on the data endpoint (`addNetworkErrorOverride`),
  page title and section headings, chart containers (`.recharts-responsive-container`), selectors.
- **`charts.test.tsx`** (and `*-chart-group.test.tsx` for complex pages) — chart rendering
  (`.recharts-line-curve`, `.recharts-bar-rectangle`), selector interaction (default values,
  dropdowns), treemap category labels.


## Common test patterns
- Always pre-load the MDX module in `beforeAll`:
  `await import("@/components/pages/visualizations/mdx/<slug>.mdx")` — ensures the lazy chunk
  is cached before any test renders `<App />`.
- Set up `MockBackend` in `beforeEach`: `backend = new MockBackend(); backend.setup()`.
- Render `<App />` (not the visualization component in isolation) with
  `initialEntries: ["/visualizations/<slug>"]`.
- Use `waitFor` for async assertions; render results are async due to RTKQ + StrictMode.
- Use `within(screen.getByTestId(...))` to scope queries to specific chart groups.
- Override mock backend handlers with `backend.dispatcher.addHandlerOverride(...)` for custom
  data or error scenarios. Use `addNetworkErrorOverride` for fetch failures.
- Add mock data for the new slug in `dashboard_frontend/tests/mocks/mock-data/visualizations.ts`
  (in `slugToVisualizationData`).


## Test files to update when adding a new visualization
- **Index page test** (`index.test.tsx`):
  - "shows info message when no visualizations are published" — add the new slug to the override
    with `is_published: false`.
  - "renders published visualization links" — add an assertion for the new title.
  - "admins see unpublished visualizations" — add the new slug to the override and an assertion.
- **Admin page test** (`admin/visualizations.test.tsx`):
  - Update `switches.length` assertion to the new count.
  - Add the new title to all filter test assertions (prefix match, no match, clear filter).


# Implementation Patterns and Examples
## Common components and utilities
- **Chart styling constants:** `CHART_HEIGHT`, `CHART_MARGINS`, `GRID_STROKE_DASHARRAY`,
  `GRID_STROKE`, `CHART_COLORS`, `CHART_BRUSH_HEIGHT`, `Y_AXIS_LABEL_OFFSET` — import from
  `@/styles/charts`. Add new chart-wide constants there, not in component directories.
- **Formatting:** `formatValue(v, unit)` for fixed-unit labels, `formatScaledValue(v, unit)`
  for auto-scaling k/M/B tooltips, `numericTickFormatter(v)` for space-separated axis ticks.
  All in `@/styles/charts`.
- **`<ChartTitle>`** — styled `<h3>` for chart section headings.
- **`<ChartPlaceholder>`** — a placeholder component with a message displayed instead of a chart inside a `ResponsiveContainer`.
- **`<ChartTooltip>`** / `axisTooltipContent(dataKey, label)` — shared tooltip. For charts
  with an X-axis, use `axisTooltipContent("year", "Year")`. For charts without an X-axis
  (Treemap), use `content={ChartTooltip}` directly and omit `xAxisKey`.
- **`formatScaledValue`** — for tooltips that need dynamic unit scaling on raw values
  (see `country-bar-chart.tsx`: raw value stored in `_raw` field, formatter accesses
  `entry.payload._raw`).


## Chart types
- **LineChart** — see `trade-line-chart.tsx` (two-line combined chart) or
  `income-expenses-line-chart.tsx` (state budget).
- **BarChart (vertical)** — see `country-bar-chart.tsx` (scrollable with `layout="vertical"`).
- **BarChart (horizontal)** — see `cumulative-inflation-bar-chart.tsx` (with `<Brush>` for
  many X-axis ticks).
- **Treemap** — see `category-treemap.tsx` (custom cell with category name + value + % share;
  `ChartTooltip` with formatter; `_total` injected via closure for % calculation).
  Also see `category-treemap.tsx` in the state-budget chart group for a clickable variant.


## Selectors
- **`SingleValueSelector`** — single dropdown. Used for year selection in trade charts
  (see `trade-year-selector.tsx`). Props: `allValues: string[]`, `selectedValue`, `onSelect`,
  `title`.
- **`AttributeDropdown` + `AttributeSelections`** — multi-select for numeric values (years).
  See `category-chart-group.tsx` (state budget).
- **`HierarchyBreadcrumb` + `HierarchySelections`** — hierarchical category selection.
  See `category-chart-group.tsx` (state budget).


## Scrollable bar charts
When a bar chart has more items than can reasonably fit, use a scrollable container instead
of `<Brush>`. `<Brush>` is designed for horizontal-axis charts; on vertical bar charts
(`layout="vertical"`), the Y-axis carries category labels so Brush cannot scroll them.

Pattern (see `country-bar-chart.tsx`):
- Define `BAR_HEIGHT` (px per bar tick) and `VISIBLE_BARS` (how many bars visible at once).
- Compute chart height: `Math.max(CHART_HEIGHT, data.length * BAR_HEIGHT)`.
- Wrap `ResponsiveContainer` in a `<div>` with `maxHeight: VISIBLE_BARS * BAR_HEIGHT` and
  `overflow-y: auto`.


## Component decomposition
- Keep subcomponents in the same file unless shared across multiple consumers
  (see memory: component decomposition).
- When a chart group needs shared selector state, extract a parent component that holds
  state and passes it to child chart components via props (see `trade-chart-group.tsx`).
- Each chart component accesses RTKQ data independently via `useGetVisualizationDataQuery`.
