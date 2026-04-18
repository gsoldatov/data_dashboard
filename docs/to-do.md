# Key Features
+ data etl:
    + run data fetching jobs on schedule;
    + log job execution results;

- dashboard backend;
    - pages:    // additional page metadata stored in db (title, description, feed timestamp, is published, tags)
        - view page;
        - update page;
        - delete page;  // metadata only
        - paginated view of pages (sorted by title & feed / modification timestamp);
    - page data; // fetch page data, if permitted
    - sessions; // login & logout
    - user;  // view & edit user properties
    - view etl jobs' statuses (execution time);
    - view etl jobs' logs;

- dashboard frontend:
    - list available pages;
    - display pages;
    - login / logout pages;
    - user page (view / edit user settings);
    - edit page settings (as admin);

- data sources / visualizations to implement:
    - Russia State budget (plan / fact, with drilldown by categories);
    - Russia Economic Indicators (GDP, Inflation, production & industrial indexes, etc.);
    ???


# Project Stack
- data etl:
    + prefect for managing etl jobs;
    + pandas / json for storing data;
    - pytest for testing;
- dashboard backend:
    - FastAPI for data fetching;
    - SQLite for storing admin data & dashboard settings;
    - pytest for testing;
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

- implement Russia state budget fetch (plan / fact):
    + etl:
        + https://minfin.gov.ru/ru/statistics/conbud/execute?id_57=93449-kratkaya_ezhegodnaya_informatsiya_ob_ispolnenii_konsolidirovannogo_byudzheta_rossiiskoi_federatsii_i_gosudarstvennykh_vnebyudzhetnykh_fondov_mlrd_rub.
        x fact budgets 2022-2025;
    + transform:
        + load page
    + configure scheduling & execution via Prefect;
    + configure logging;
    - add job & helper tests;

- implement basic backend:
    - page routes;
    - page data fetching route;

- implement basic frontend:
    - add Russia state budget page (mdx);
    - dashboard layout:
        - navbar;
        - main content (single column);
    
    - page feed;
    - template of a single page:
        - layout;
        - data fetching & placeholders;
        - display of page mdx;


# Additional
? add Prefect basic auth (configure PREFECT_SERVER_API_AUTH_STRING on server & add auth string when using clients);
