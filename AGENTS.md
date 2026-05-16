# Overview
Current project implements a set of packages for fetching and visualizing data from various sources.



# Subprojects in the repository
## data_loading
A set of ETL jobs, which load data.

### Subproject Structure
- `data_loading/src/jobs`: ETL jobs definitions;
- `data_loading/src/helpers`: common functionality, which is shared among multiple jobs;
- `data_loading/src/prefect`: collection of scripts for running & configuring Prefect;
- `data_loading/tests`:
    - test cases & test utilities for `data_loading` subproject;
    - test cases are located in `data_loading/tests/tests` and follow the structure of `src` directory;
    - each test case file is executable (see `data_loading/tests/tests/helpers/test_http_loader.py` for an example on how make them);
    - test cases are written as functions.

### Architecture Decisions
- Prefect uses a server & local process worker running on a single machine;
- a separate Prefect profile is used for the subproject;
- jobs can be executed by Prefect or as standalone scripts (without invoking Prefect worker);
- jobs are synchronous;
- data is stored in JSON and other formats;

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
- allows CRUD operations with dashboard pages' settings;
- manages dashboard users' data;
- handles user authentication & stores user sessions;
- provides administrative & monitoring capabilities.

### Key Definitions
- "user": dashboard user credentials, role and info;
- "session": token-based session of a user;
- "page settings": a collection of optional & configurable settings of a frontend page (such as its publication status);
- "page data": data set(-s) prepared by data_loading subproject, displayed by frontend vizualizations and transferred by backend.

### Subproject Structure
- `dashboard_backend/src/db`:
    - Alembic configuration & migrations (`migrations` dir);
    - SQLAlchemy engine management (`connection.py`) and models (`models.py`);
    - database repository (`repository` dir):
        - accepts and returns Pydantic or other types (but not SQLAlchemy models);
        - uses `internal_validation` decorator for separating internal validation errors from invalid requests;
- `dashboard_backend/src/models`: Pydantic models used for request validation and data transfer;
- `dashboard_backend/src/routes`: FastAPI route handlers;
- `dashboard_backend/src/services`:
    - API authentication & session checks (`auth.py`);
    - page data retrieval (`page_data`);
- `dashboard_backend/src/util`: miscellaneous utility functions & objects (password hashing, exceptions, etc.).

### Architecture Decisions
- asynchronous;
- all db interactions are performed by repository objects;

### CLI Commands
```bash
# Run an Alembic command against backend DB
uv run alembic -c dashboard_backend/src/db/migrations/alembic.ini <alembic command & options>
```


## python_common
Shared functionlaity for Python subprojects:
- config validation.


## dashboard_frontend
A single page app containing a set of data visualizations and related pages.



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
TODO



# Common CLI Commands
## Python
```bash
# Run all tests for a subproject (data_loading in this case)
uv run pytest data_loading

# Run specific test case file directly (paths are relative to project root dir; note that uv is not used)
.venv/bin/python data_loading/tests/tests/helpers/test_http_loader.py

# Add a Python dependency to the data_loading subproject
uv add <dependency-name> --package data_loading

# Add a Python dependency used by multiple subprojects
uv add <dependency-name>
```
