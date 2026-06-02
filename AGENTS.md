# Overview
Current project implements a set of packages for fetching and visualizing data from various sources.



# Subprojects in the repository
## data_loading
A set of ETL jobs, which load data.

### Subproject Structure
- `data_loading/src/jobs`: ETL jobs definitions;
- `data_loading/src/helpers`: common functionality, which is shared among multiple jobs;
- `data_loading/src/prefect`: collection of scripts for running & configuring Prefect;
- `data_loading/tests`: test cases & test utilities for `data_loading` subproject.

### Architecture Decisions
- Prefect uses a server & local process worker running on a single machine;
- a separate Prefect profile is used for the subproject;
- jobs can be executed by Prefect or as standalone scripts (without invoking Prefect worker);
- jobs are synchronous;
- data is stored in JSON and other formats;
- tests:
    - test cases are located in `data_loading/tests/tests` and follow the structure of `src` directory;
    - mocks reside in `data_loading/tests/mocks`;
    - each test case file is executable (see `data_loading/tests/tests/helpers/test_http_loader.py` for an example on how make them);
    - test cases are written as functions.


### CLI Commands
```bash
# Run ETL job (faster and preferred way, unless Prefect integration checks are needed)
uv run data_loading/src/jobs/russia_state_budget/fetch_page.py

# Configure Prefect profile for this project, if it's not done yet
uv run data_loading/src/prefect/configuration/profiles.py

# Start local Prefect server
uv run data_loading/src/prefect/local/server.py

# Start local Prefect worker
uv run data_loading/src/prefect/local/client.py
```


## dashboard_backend
REST API service, which:
- provides data to frontend to visualize;
- allows CRUD operations with dashboard visualizations' settings;
- manages dashboard users' data;
- handles user authentication & stores user sessions;
- provides administrative & monitoring capabilities.

### Key Definitions
- "user": dashboard user credentials, role and info;
- "session": token-based session of a user;
- "visualization settings": a collection of optional & configurable settings of a visualization (such as its publication status);
- "visualization data": data set(-s) prepared by data_loading subproject, displayed by frontend vizualizations and transferred by backend.

### Subproject Structure
- `dashboard_backend/src/db`:
    - Alembic configuration & migrations (`migrations` dir);
    - SQLAlchemy engine management (`connection.py`) and models (`models.py`);
    - database repository (`repository` dir):
        - accepts and returns Pydantic or other types (but not SQLAlchemy models);
        - uses `internal_validation` decorator for separating internal validation errors from invalid requests;
- `dashboard_backend/src/middleware`: app's middleware (DB repository, auth);
- `dashboard_backend/src/models`: Pydantic models used for request validation and data transfer;
- `dashboard_backend/src/routes`: FastAPI route handlers;
- `dashboard_backend/src/services`:
    - API authentication & session checks (`auth.py`);
    - visualization data retrieval (`visualization_data`);
- `dashboard_backend/src/util`: miscellaneous utility functions & objects (password hashing, exceptions, etc.);
- `dashboard_backend/tests`: test cases & test utilities for `dashboard_backend` subproject.

### Architecture Decisions
- asynchronous;
- all db interactions are performed by repository objects;
- tests:
    - test cases are located in `dashboard_backend/tests/tests` and follow the structure of `src` directory;
    - mocks (test data generators, test DB operations classes, etc.) reside in `dashboard_backend/tests/mocks`;
    - each test case file is executable (when adding a new test case file, check if it can be executed directly);
    - test cases are written as functions;
    - test case order (where applicable): validation errors, other errors (auth, incorrect data of valid format, etc.), correct execution.

### CLI Commands
```bash
# Run an Alembic command against backend DB
uv run alembic -c dashboard_backend/src/db/migrations/alembic.ini <alembic command & options>
```


## python_common
Shared functionlaity for Python subprojects:
- config validation;
- shared test fixtures;
- tests for shared functionality;


## dashboard_frontend
A single page app containing a set of data visualizations and related pages.

### Subproject Structure
- `dashboard_frontend/src/components` contain React components & MDX files:
    - `pages/`:
        - page-level components, which correspond to a URL in app's router (visualizations list, user profile, admin pages, etc.) and MDX visualizations;
        - components added here should top-level structure of the page (but may contain full structure for simple pages);
        - complex logic and UI should be decomposed and / or move to `page-parts` directory;
    - `page-parts/`: parts of page-level componentc, which are not shared with other pages;
    - `stateful/`: reusable components that access Redux store state (e.g., navbar and page layout);
    - `common/`: reusable components with no Redux dependency (shadcn/ui primitives, chart wrappers, other UI components, which do not rely on Redux state);
- `dashboard_frontend/src/store`:
    - RTK store (`index.ts` + slices in `slices/` subdirectory);
    - RTK Query API for dashboard backend (`backend-api.ts` + slices in `backend-api-slice` subdirectory);
- `dashboard_frontend/src/styles`: CSS styles and related utilities (e.g., `cn()` for Tailwind class merging);
- `dashboard_frontend/src/types`: shared TypeScript types mirroring backend Pydantic schemas;
- `dashboard_frontend/tests`: test cases mirroring `src/` structure;
- build & tooling configuration (`package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`) is at the repository root.

### Architecture Decisions
- SPA served as static assets (no SSR);
- TypeScript strict mode;

- app data:
    - Redux Toolkit + RTK Query are used for storing app data retrieved from backend;
    - number of exports from RTK-related files should be kept minimal:
        - state selection is done manually in consumer code;
        - reducers and RTK Query API hooks are exported from corresponding slices;
        - RTKQ fetches:
            - may validate request data with Zod schemas (if data was not validated earlier) and return validation errors in the format parseable by `parseRTKQError`;
            - should validate response data using Zod schemas, console.log validation errors and set a custom user-friendly error message to fetch result;
- auth:
    - cookie-based (httponly, same-origin);
    - frontend also fetches current user on app load via RTKQ slice and resets it, when it becomes stale (user != null and X-Is-Authenticated response header = false);
- navigation is done using `setRedirectOnRender` reducer or with React Router, where applicable;

- component usage and dependency rules:
    - top-level directories may depend on lower levels (`pages` → `page-parts` → `stateful` → `common`);
    - same-level components may import from each other;
    - no directory may depend on a higher-level directory;
    - component reuse should be preferred over creating new components, including cases, where existing components requires a reasonable, but not overcomplicated amount of refactoring;
    - shadcn/ui components should be preferred over basic JSX elements representing raw HTML;
- visualization display logic:
    - MDX files are compiled at build time as separate chunks and lazy-loaded at runtime;
    - key visualization components:
        - `<Visualization>` - page-level component, queries backend to check if a visualization can be displayed, then imports and renders corresponding MDX file;
        - `VisualizationDataLoader` - wrapper for loading visualization data;
        - MDX files - contain visualizations themselves, a single file per visualization;
- data validation and typing:
    - Zod schemas and other types are stored in `dashboard_frontend/src/types`;
    - schema names should with a small letter and type names with a capital one;


- global objects (app config, etc. are stored in `document.app` & accessed STRICTLY via functions from `dashboard_frontend/src/util/document-app.ts`);

- shadcn/ui design tokens via CSS variables (theming, dark mode support);

- tests:
    - test cases are located in `dashboard_frontend/tests/tests` and follow the structure of `src` directory;
    - key test mocks:
        - `MockBackend` (`dashboard_backend/tests/mocks/backend/mock-backend.ts`) - mocks `fetch` with test backend route handlers, using `vitest-fetch-mock`, set it up in `beforeEach()` for test cases, which imply interaction with backend;
        - `RouteDispatcher` (available via `MockBackend`) - provides route handlers of mock backend and allows to override them;
    - test cases are written as functions (one test file per component/slice);
    - test case order (where applicable): network errors,  validation & data errors, other errors, correct execution;
    - mock backend route handlers validate incoming request data using Zod;



# Technical Stack
## Python Subprojects
- python 3.13;
- uv for managing dependencies & environment;
- Prefect v3 for scheduling and executing data loading jobs;
- httpx for performing HTTP requests;
- BeautifulSoup v4 for parsing HTML files;
- Pydantic v2 & Pydantic Settings for validation;
- FastAPI as dashboard backend's API Framework; 
- SQLite as dashboard backend's database & SQLAlchemy 2 for accessing DB from Python;
- Alembic for managing DB migrations;
- Pytest for running tests.


## Typescript Subprojects
- TypeScript 5.7 with strict mode;
- Vite v6 for building & dev server;
- React 18 for UI rendering;
- React Router v7 for routing;
- Redux Toolkit + RTK Query for state management & data fetching;
- Zod for data validation;
- Tailwind CSS v4 + shadcn/ui for styling;
- @mdx-js/rollup for MDX compilation;
- Recharts for data visualizations;
- Vitest, React Testing Library, vitest-fetch-mock for tests.



# Common CLI Commands
## Python
```bash
# Add a Python dependency to the data_loading subproject
uv add <dependency-name> --package data_loading

# Add a Python dependency used by multiple subprojects
uv add <dependency-name>

# Run all tests for a subproject (data_loading in this case)
uv run pytest data_loading

# Run specific test case file directly (paths are relative to project root dir; note that uv is not used)
.venv/bin/python data_loading/tests/tests/helpers/test_http_loader.py

# Run pre-commit to verify the correctness of changes made (this includes Ruff & MyPy execution)
uv run pre-commit run --all-files
```

## Typescript / Node
```bash
# Install frontend dependencies
npm install

# Start Vite dev server (frontend at http://localhost:5173)
npm run dev

# Run frontend tests
npm test

# Build frontend for production
npm run build
```
