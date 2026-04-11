# Overview
Current project implements a set of packages for fetching and visualizing data from various sources.


# Key Components
## data_loading
A set of ETL jobs, which load data.


## dashboard_backend
API service, which provides data for dashboard, admin features and CRUD funcitonality for dashboard page properties.



## dashboard_frontend
A single page app containing a set of data visualizations and related pages.


## python_common
Common functionlaity for Python parts of the project.


# Technical Overview
## data_loading, dashboard_backend & python_common
- python 3.13;
- uv for managine dependencies & env;
- prefect for scheduling and executing jobs;
- Pandas for storing data;
- Pydantic & Pydantic Settings for validation;
- FastAPI as dashboard backend's API Framework; 
- SQLite as dashboard backend's database;
- pytest for running tests;


TODO
- key etl libraries;
- key backend libraries

## dashboard_frontend
TODO
