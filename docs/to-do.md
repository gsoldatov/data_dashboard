# Key Features
+ data etl:
    + run data fetching jobs on schedule;
    + log job execution results;

+ dashboard backend;
    + user;  // view & edit user properties
    + sessions; // login & logout
    + page settings:    // additional page metadata stored in db (is published)
        + upsert;
        + view;     // default or saved settings
    + page data; // fetch page data, if permitted
    + view etl jobs' statuses (execution time);
    x view etl jobs' logs;

+ dashboard frontend:
    + login page & logout funcitonality;
    + list available visualizations;
    + display a visualization;
    + user page (view / edit);
    + admin page:
        + edit visualization settings;
        + view ETL jobs statuses & logs;
        x view ETL run history & logs;
        x run ETL jobs;

- data sources / visualizations to implement:
    + Russia State budget (plan / fact, with drilldown by categories);
    - Russia Economic Indicators (GDP, Inflation, production & industrial indexes, etc.);
    ???



# Project Stack
+ data etl:
    + airflow for managing etl jobs;
    + pandas / json for storing data;
    + pytest for testing;
+ dashboard backend:
    + FastAPI for data fetching;
    + SQLite for storing admin data & dashboard settings;
    + pytest for testing;
+ dashboard frontend:
    + React for rendering HTML;
    + tailwind for styling;
    + @mdx-js/react for rendering markdown with JSX support;
    + Recharts.js for displaying charts;
    + vitest for testing;
+ deployment:
    + Docker / Docker Compose for running containers;



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


+ implement basic frontend functionality:
    + generate and check scaffold:
        + stack used;
        + frontend configuraiton files;
        + parse & load config.env during build;
    
    + implement testing structure:
        x mock backend:
            + route handler dispatching;
            + reuqest history;
            x mock data generation & overrides;
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

        + admin page:
            + edit visualization settings (as admin);
        
    + refactoring & fixes:
        + fix race conditions on feed & visualization pages;    // they depend on user data, yet don't wait for it or process its fetch errors
        + fix non-published visualization being invisible for admins after logging in; // logging in should reset state objects, except for user data;

        + remove unused functions & components;
        + remove hardcoded settings & use app config instead;
        + remove unused dependencies;
        + rename feed page to index everywhere;

        + ensure all fetches timeouts are are properly covered by error placeholders;
        + all RTKQ fetches validate response data with zod and propagate validation errors in a uniform way (console.error + undetailed error message to use in components)
        
+ handle absent data on backend gracefully;
+ add pre-commit checks for frontend;

+ add a scheduled job for removing expired sessions;

+ replace prefect with airflow:
    + move all files, produced by the project, into a single dir (databases, logs, etl data, etc.);
    + install & add automatic configuration:
        + default config => override with project settings;
        + configure auth:
            + user + password;
            + jwt secret;
            x configure login rate limiting;
        + optimize memory consumption:
            + webserver: 1 worker, periodic resets, sync worker class, worker refresh;
            + scheduler: decrease heartbeat & DAG scan intervals, reduce parallel tasks, dags & historic runs;
            + code: imports and calculations are done inside tasks;
    + update existing etl jobs:
        + use task logger;
        + rotate task logs;
        + remove separate logging dir;

+ implement Russia state budget visualization:
    + update parsed data formats in data loading:
        x refactor existing hierarchy in nested treemap format;
        x refactor existing hierarchy in flat treemap format;
        + add a flat table format;
            [{"year": ..., "number": ..., "name": ..., "value": ...}, ...]

    + layout:
        + row types:
            + 2 elements, each take 50% width when fullscreen / 100% when stacked (each element moves on its own row);

    + general:      // display all data
        + line chart, total income & total expenses;
        + barchart - yearly income vs expenses diff;

    + by category and year:    // separate chart groups for income & expenses
        + category selection:
            + if no categories are selected, then topmost level is considered active;
            + if a single bottom-most category is selected, consider all of its children (or itself, if leaf) active;
            + if multiple bottom-most categories are selected, consider them active;
            + drill down, if there are child categories for selections;
            + current selections are displayed as a list of items and can be deselected:
                + deselecting a parent also deselects all of its children;
            + selections are shared across the chart group;
        
        + years selector:
            + can select any amount, if none is selected, all years are displayed;
            + current selections are displayed as a list of items and can be deselected;
            + selections are shared across the chart group;
        
        + line chart with categories of current drilldown layer:
        + stacked bar chart, which displays selected categories shares & total values
        
        + when exactly one year is selected:    // or display a chart placeholder, if condition is not met
            + drillable categories treemap;     // display absolute values & share in total
            + categories diff vs prev year:
                + absolute values;
                + share in total %;
        
    + custom chart tooltip component with styling;

+ add a favicon;
+ add deployment via docker compose;
+ add readme files for project initialization, startup & deployment;

+ Russia Economy Indicators:
    + GDP:
        + data:
            + base prices (RUB / USD);  // https://rosstat.gov.ru/statistics/accounts       https://data.worldbank.org/indicator/NY.GDP.MKTP.KD?end=2024&locations=RU&start=1988&view=chart
            + PPP (USD);  // https://data.worldbank.org/indicator/NY.GDP.MKTP.PP.KD?end=2024&locations=RU&start=1988&view=chart
        
        + charts:
            + 1 line chart per each GDP dataset;
    
    + Labor Market:
        + data:
            + Average salaries;     // https://rosstat.gov.ru/storage/mediabank/tab1-zpl_03-2026.xlsx
            + Salaries by economy sector;
            + Work force & unemployment;   https://rosstat.gov.ru/labour_force
        
        + charts:
            + avegrage salary by year;
            + average salary by sector and year:
                + with sector filter;
            + total workforce;
            + workforce engagement (working / unemployed / not in workforce);
    
    + Inflation:
        + data:
            + Consumer Price Index / Inflation; // https://rosstat.gov.ru/statistics/price
            + Interest Rate;    // https://www.cbr.ru/hd_base/infl/?UniDbQuery.Posted=True&UniDbQuery.From=17.09.2013&UniDbQuery.To=26.06.2026

        + charts:
            + cumulative inflation bar chart:
                + from & to selectors for period limiting;
                + single value only selectors, default is YoY for the last period (last period + 11 previous months)
            + key rate line chart;
    
    + Exports / Imports:
        + data:
            + yearly exports / imports by country;  // https://wits.worldbank.org/CountryProfile/en/Country/RUS/StartYear/1992/EndYear/2026/TradeFlow/Import/Partner/BY-COUNTRY/Indicator/MPRT-TRD-VL
            + export / import structure;    // https://wits.worldbank.org/CountryProfile/en/Country/RUS/StartYear/1996/EndYear/2021/TradeFlow/Import/Indicator/MPRT-TRD-VL/Partner/WLD/Product/Chemical
        
        + charts:
            + total exports / imports by year line chart;
            + exports / imports chart group:
                + single value selector for years, last available year is selected by default
                + export by country bar chart;  // in bln USD for the selected year, sorted desc by export value
                + export by category treemap;   // in bln USD for the selected year
                + import by country bar chart;
                + import by category treemap;
    
    + refactor visualization data fetching (reuse already loaded datasets without refetching them):
        + backend accepts a list of dataset names, validates them and checks for non-admins, if each dataset has at least one published visualization, where it's used;
        + frontend checks, which datasets are cached, fetching missing and returns cached datasets after or instead the fetch;
        + charts access required datasets after they were loaded;
        
    + Russia Economy Dashboard:     // a set of tables displaying data for currently selected year
        + single value selector for year (find all years from used datasets);   // select previous year by default
        + gdp:
            + rub => absolute values + diff YoY in %;
            + usd ppp => absolute values + diff YoY in %;
        + inflation & unemployment:
            + inflation (last available month of selected year => YoY change + diff in pp);
            + keyrate (last available month of selected year + absolute diff YoY);
            + unemployment (last available month of selected year);
        + trade:
            + total yearly exports + diff YoY (absolute & in %);
            + total yearly imports + diff YoY (absolute & in %);
        + budget:
            + yearly income (absolute value + diff YoY in %);
            + yearly expenses (absolute value + diff YoY in %);
            + difference between income & expenses;
        
        + check styling when stacked;

    + common navigation component across Russia's Economy pages;    // also reorganize URL order on the index page;

+ admin page:
    + view DAGs statuses:
        + table;
        + pause / unpause DAGs;
        x trigger manual DAG run;

- revisit styling; colors, fonts, etc;
    - define all colors (except chart constants) in globals.css, rather than in components
    - merge color variables with similar of exact values and purpose (specifically, we want to reduce number of background and text color variables, hover 
    colors, border colors)
    - define font families in globals.css (suggest one or several fonts, that are suitable for a visualization dashboard)
    - define font default sizes (normal, small, etc.) in globals.css
    - define default margin / padding rules in globals.css
    - explore, which margin / padding rules are currently in place and generalize them, if possible
    - add default rules (cursor: pointer for buttons and links, hover text colors for inputs and links, hover background text colors)

- add/refactor default styles:
    + colors;
    + hover styles:
        + cursor: pointer;
        + hover colors;
    + fonts & font sizes;
    + margins;

    - check pages & refactor:
        - navbar:
            - increase size;
            - colors, hover colors (including brand);
        ? merge MDX markdown components & tailwind styles:
            - headers
            - links
            ???

        - index;
        - visualizations;
        - login;
        - user;
        - admin etl;
        - admin visualizations;

- Russia Economy by Sectors:
    - Finance
        https://rosstat.gov.ru/statistics/finance
    - Oil & Gas (production, exports)
    - Metallurgy
    - Agriculture
    - Energy
    ? Industry
    - Retail Sales & consumer spending
    - Construction
    - Transportation (Cars / Railway / Aircraft)
        - https://rosstat.gov.ru/statistics/transport
    - Technology
    ??? other sectors



# Additional
- add deployment data backup;
? split main AGENTS.md into skills / sub-files;
- add backend access & event logging to files:
    - add maintentance tasks for clearing log files;    // apscheduler

- i18n + l10n:	// ru + en
	- ui
	- datasets
- allow reloading configuration in data_loading & dashboard_backend;
? move visualizations list constant to backend and retrieve it where it's used;
- move wrappers & styles from main.tsx into APP;    // this would also require to update all test cases, so they properly await for all fetches to end

? refactor is_published checks for visualizations:
    - chunk should not be fetchable, if its not published (for non-admins);

? migrate airflow & backend to PostgreSQL;
? use Nginx as a reverse proxy for backend in Docker Compose deployment;
- add non tailwaind css classnames to components and use them in tests for more specific checks
    ? refactor app router:
        - history object is available in test cases after component rendering;
        - existing tests pass (render the wholee app or add support to rendering parts of it);
? refactor MDX page tests to be more precise on what they check (presence of charts, correct chart values, etc.);