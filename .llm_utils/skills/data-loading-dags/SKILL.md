---
name: data-loading-dags
description: Create or update a DAG in data_loading subproject. Use when you need to implementing or update ETL functionality for some specific dataset.
---


ETL jobs in the project are implemented as Airflow DAGs containing one or more linked tasks. Update the skill with edge cases an exapmles, if needed, but keep it brief. Add references to specific files, if needed.


# Key Steps
## Start
Figure out:
- snake case name for the DAG, if not provided;
- data source(-s):
  - should data source be static or dynamic (change dates in the URL, for example);
- task pipeline suitable for the ETL job; typically, for simple pipelines 2 tasks if enough (fetch data -> parse, transform and save);
- how DAG should be run (schedule, retries, etc.).


## Fetching Data
- File fetching should be done, using HTTPLoader helper;
- other types of data can be retrieved with ad-hoc code inside the task, but potentially reusable functionality should be extracted into other helper classes;
- save fetched data (unarchive, if needed).


## Parsing, Transformating and Saving data
Figure out:
- output format:
  - default option is a list of JSON objects with data ticks;
  - data ticks may be sorted, if applicable (e.g. for time series data, they should be in chronological order);
- how is data presented:
  - format;
  - where exactly data is located (e.g., tab(-s), rows and columns in an excel file);
  - which indicators and parts of data must be saved from raw file;
  - should data values be cleaned up;
  - can data values be partially empty.

Implementation:
- use pandas for data loading and transformation:
  - unless its a bad call for this specific task;
  - prefer using faster operations over row by row processing;
- add helper functions for parsing, cleaning up and transforming data, if necessary.


## Testing
- after implementing the DAG, run its tasks to make sure they work as intended;
- add or update test cases, so that they cover new logic:
  - for fetch -> parse, transform and save DAGs:
    - it's typically enough to add module tests for parse + transform logic;
    - these tests should use mock data, which reproduces orignial data source structure and its edge cases.


## General Patterns
- use project's config in the DAG and its tasks;
- tasks should use Airflow task logger and log main steps of tasks;
- files should be stored to `config.visualization_data_directory / <dag_name>`;
- DAGs and their tasks should be runnable as standalone scripts.


# Examples
Consider exploring existing DAGs and related code parts to better understand existing patterns.
- HTML fetching & parsing: `russia_state_budget`;
- CSV archive fetching & parsing: `russia_gdp_ppp_constant_prices`.
