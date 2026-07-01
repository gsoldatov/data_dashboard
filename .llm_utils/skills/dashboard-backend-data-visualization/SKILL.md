---
name: dashboard-backend-data-visualization
description: Provide data for dashboard_frontend via dashboard_backend. Use when backend needs an update to properly return
---

# Key Steps
- figure out, which dataset(-s) must be added or updated;
- figure out a slug, which will be used for returning these datasets;
- update visualization data service to return the datasets:
    - for JSON-backed datasets: add `JSONFileReader("rel/path.json").read` entries to `_REGISTRY` in `__init__.py`;
    - for custom datasets requiring non-JSON logic: write a  returning `VisualizationDataset` type and register it;
    - similar data-getters should be moved into common function or class, like `JSONFileReader`;
- update tests:
    - create mock data directories + JSON files under `dashboard_backend/tests/mocks/visualization_data/` mirroring the real data paths;
    - update `test_read_visualization_data.py`:
        - add expected data to `slug_expected`;
        - add directory names to the `copy_test_directories` call.

Update the skill with useful details and important steps, if needed, but keep it brief.
