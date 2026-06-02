# Overview
A set of packages for fetching and visualizing data from various sources. Currently in early stage of WiP.

Includes the following subpackages:
- `data_loading`:
    - a set of ETL jobs with orchestration:
    - Python / Prefect / httpx / BeautifulSoup / Pytest;

- `dashboard_backend`:
    - REST API for serving visualization data, managing visualization settings and monitoring ETL jobs;
    - Python / FastAPI / SQLite / SQLAlchemy / Pytest;

- `dashboard_frontend`:
    - a single page app containing a set of data visualizations and related pages;
    - TypeScript / React / MDX / Recharts / Tailwind CSS / vitest/
