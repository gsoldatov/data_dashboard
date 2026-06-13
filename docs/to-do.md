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


- implement basic frontend functionality:
    + generate and check scaffold:
        + stack used;
        + frontend configuraiton files;
        + parse & load config.env during build;
    
    + implement testing structure:
        - mock backend:
            + route handler dispatching;
            + reuqest history;
            - mock data generation & overrides;
        + tests directory;
        + update AGENTS.md with tests architecture, patterns & commands;
    
    + implement pages / functionality:
        + login page:
            + use RTK query for current user as well;
            + credentials are validated with zod before sent to backend;
            + validation errors are displayed in form;
            + fetch errors are displayed;   // reuse <ErrorPlaceholder>, when other things are done
            x response validation error is properly displayed;
            + can have an optional URL param, which stores the page to redirect to;
            + refactor login form to use shadcn components;
            + add remaining tests tests:
                + fetch errors are properly displayed;
        
        + not found page;

        + add protected routes:
            + admin;
            + anonymous;

        + page layout & navbar:
            + layout should be used in each page-level component, rather than in router;
            + expired & invalid tokens (401 backend responses) should result in cookie removal & redirect to /auth/login;
            + decompose into smaller components;
            x refactor with shadcn;
            + add stacked style & toggle
            + add tests;

        + list available pages;
        + display an MDX page;
        
        + user page (view / edit user settings);
        
    - refactoring & fixes:
        - remove unused functions & components;
        - remove hardcoded settings & use app config instead;
        ? remove logout from user profile page;     // allow clearing all existing sessions

        - ensure all fetches timeouts are are properly covered by error placeholders;
        - all RTKQ fetches validate response data with zod and propagate validation errors in a uniform way (console.error + undetailed error message to use in components)
    
        - check if dependencies are used after project is implemented:
            - class-variance-authority;     // No shadcn/ui components exist (the common/shadcn-ui/ dir is empty), no cva() calls

        - add non tailwaind css classnames to components and use them in tests for more specific checks
        ? refactor app router:
            - history object is available in test cases after component rendering;
            - existing tests pass (render the wholee app or add support to rendering parts of it);
        
        - handle absent data on backend gracefully;
        - add a scheduled job for removing expired sessions;
    


- add pre-commit checks for frontend;

- implement Russia state budget visualization;

- utility:
    + add a rebase script (one-liner to rebase wt1 / wt2 on main - and switch branches to do that)
    ? move to llm skills;
    - update skills in skill repo;

- replace prefect with airflow:
    ? configure authentication;

- admin page:   // add corresponding backend routes
    - edit page settings (as admin);
    - view ETL jobs statuses & logs;
    ? run ETL jobs;

- add readme files for project initialization & startup:
    - python:
        - install dependencies;
        - pre-commit initialize;
        - setup Prefect (profile -> server);
    ? split main AGENTS.md into skills / sub-files;
