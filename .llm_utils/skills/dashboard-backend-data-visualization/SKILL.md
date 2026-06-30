---
name: dashboard-backend-data-visualization
description: Provide data for dashboard_frontend via dashboard_backend. Use when backend needs an update to properly return
---

# Key Steps
- figure out, which dataset(-s) must be added or updated;
- figure out a slug, which will be used for returning these datasets;
- update visualization data service to return the datasets (update handlers and make sure they're used by the service);
- update existing visualization data service tests to check, if new datasets are correctly returned.

Update the skill with useful details and important steps, if needed, but keep it brief.
