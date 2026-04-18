# Overview
Current project implements a set of packages for fetching and visualizing data from various sources.


# Key Components
## data_loading
A set of ETL jobs, which load data.

Architecture overview:
- `data_loading/src/jobs`: class-based definitions of jobs, which are executed directly or via prefect;
- `data_loading/src/helpers` common functionality, which is shared among multiple jobs;


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
