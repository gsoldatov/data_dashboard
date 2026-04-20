# Overview
Current project implements a set of packages for fetching and visualizing data from various sources.


# Key Components
## data_loading
A set of ETL jobs, which load data.

### Architecture Overview
- `data_loading/src/jobs`: class-based definitions of jobs, which are executed directly or via prefect;
- `data_loading/src/helpers`: common functionality, which is shared among multiple jobs;
- `data_loading/src/prefect`: collection of scripts for running & configuring Prefect;
- `data_loading/tests`:
    - test cases & test utilities for `data_loading` sub-project;
    - test cases are located in `data_loading/tests/tests` and follow the structure of `src` directory;
    - each test case file is executable (see `data_loading/tests/tests/helpers/test_http_loader.py` for an example on how make them);
    - test cases are written as functions;

### Key Commands
```bash
# Run all tests
uv run pytest data_loading

# Run specific test case file directly (paths are relative to project root dir
# note that uv is not used, because it changes __name__ variable of the test case file)
.venv/bin/python data_loading/tests/tests/helpers/test_http_loader.py
```


## dashboard_backend
API service, which provides data for dashboard, admin features and CRUD funcitonality for dashboard page properties.


## dashboard_frontend
A single page app containing a set of data visualizations and related pages.


## python_common
Common functionlaity for Python parts of the project.


# Technical Overview
## data_loading, dashboard_backend & python_common
- python 3.13;
- uv for managine dependencies & environment;
- Prefect v3 for scheduling and executing data loading jobs;
- httpx for performing HTTP requests;
- BeautifulSoup v4 for parsing HTML files;
- Pydantic v2 & Pydantic Settings for validation;
- FastAPI as dashboard backend's API Framework; 
- SQLite as dashboard backend's database;
- Pytest for running tests;


## dashboard_frontend
TODO
