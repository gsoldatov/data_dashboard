# Key Features
+ data etl:
    + run data fetching jobs on schedule;
    + log job execution results;

- dashboard backend;
    + user;  // view & edit user properties
    + sessions; // login & logout
    + page settings:    // additional page metadata stored in db (is published)
        + upsert;
        + view;     // default or saved settings
    + page data; // fetch page data, if permitted
    - view etl jobs' statuses (execution time);
    - view etl jobs' logs;

- dashboard frontend:
    - login page & logout funcitonality;
    - list available visualizations;
    - display a visualization;
    - user page (view / edit);
    - admin page:
        - edit visualization settings;
        - view ETL jobs statuses & logs;
        ? run ETL jobs;

- data sources / visualizations to implement:
    - Russia State budget (plan / fact, with drilldown by categories);
    - Russia Economic Indicators (GDP, Inflation, production & industrial indexes, etc.);
    ???


# Project Stack
+ data etl:
    + prefect for managing etl jobs;
    + pandas / json for storing data;
    + pytest for testing;
+ dashboard backend:
    + FastAPI for data fetching;
    + SQLite for storing admin data & dashboard settings;
    + pytest for testing;
- dashboard frontend:
    - React for rendering HTML;
    - tailwind for styling;
    - @mdx-js/react for rendering markdown with JSX support;
    - ??? for displaying charts;
    - RTL / Jest for testing;
- deployment:
    - Docker / Docker Compose for running containers;
    ???
    - 


# To-Do
+ setup main project & data etl subproject:
    + boilerplate;
    + configuration;

+ implement Russia state budget fetch (plan / fact):
    + etl:
        + https://minfin.gov.ru/ru/statistics/conbud/execute?id_57=93449-kratkaya_ezhegodnaya_informatsiya_ob_ispolnenii_konsolidirovannogo_byudzheta_rossiiskoi_federatsii_i_gosudarstvennykh_vnebyudzhetnykh_fondov_mlrd_rub.
        x fact budgets 2022-2025;
    + transform:
        + load page
    + configure scheduling & execution via Prefect;
    + configure logging;
    + add job & helper tests;


+ implement backend:
    + boilerplate:
        + dependencies;
        + project structure;
        + app setup & dependencies;
        + DB migrations & repository;
    
    + configure pre-commit & fix existing issues:
        + ruff;
        + mypy;
    
    + tests:
        + add tests boilerplate;
        + test cases:
            + DB migrations;
            + CORS;
            + concurrent DB access;
    
    + routes & tests for them:
        + user (CRUD);
        + auth (login, logout);
        + page settings;
        + page data;


- implement basic frontend:
    + generate and check scaffold:
        + stack used;
        + frontend configuraiton files;
        + parse & load config.env during build;
    
    - implement testing structure:
        - mock backend;
        - mock data;
        - tests directory;
        - update AGENTS.md with tests architecture & commands;
    
    - implement pages / functionality:
        - page layout & navbar:
            - layout should be used in each page-level component, rather than in router;
        - login page / logout:
            ? use RTK query for current user as well;
            - add invalidation of current user on 401 responses;
        - list available pages;
        - display an MDX page:
            - implement Russia state budget visualization;
        - user page (view / edit user settings);
        - admin page:
            - edit page settings (as admin);
            - view ETL jobs statuses & logs;
            ? run ETL jobs;
        
    - refactor scaffolded code:
        - remove unused functions & components;
        - remove hardcoded settings & use app config instead;
        - remove logout from user profile page;
        
    ? add zod for validation of backend data;

    - add pre-commit checks for frontend;

    - add Russia state budget page (mdx);
    - dashboard layout:
        - navbar;
        - main content (single column);
    
    - page feed;
    - template of a single page:
        - layout;
        - data fetching & placeholders;
        - display of page mdx;
    
    - admin page:
        - view ETL jobs' logs & statuses;
        ???
    
    - check if dependencies are used after project is implemented:
        - class-variance-authority;     // No shadcn/ui components exist (the common/shadcn-ui/ dir is empty), no cva() calls

- add readme files for project initialization & startup:
    - python:
        - install dependencies;
        - pre-commit initialize;
        - setup Prefect (profile -> server);

- update skills in skill repo;

# Additional
? add Prefect basic auth (configure PREFECT_SERVER_API_AUTH_STRING on server & add auth string when using clients);
