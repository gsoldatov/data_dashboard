# """
# Runs a local Prefect process worker,
# which polls Prefect server for scheduled flow runs
# and executes them

# NOTE: this is WiP & additional configuration is required for workers to properly use
# the local project environment instead of creating a temporary one

# Also, running a process worker service requires configuring
# a worker pool and deployments via `../server.py` & `../flows.py`
# on a running Prefect server
# """
# import asyncio
# from pathlib import Path

# from prefect.context import use_profile
# from prefect.workers.process import ProcessWorker

# PROJECT_ROOT = Path(__file__).parents[4]
# if __name__ == "__main__":
#     import sys
#     sys.path.insert(0, str(PROJECT_ROOT))

# from python_common.src import get_config


# async def run_worker():
#     config = get_config()

#     with use_profile(config.prefect_profile):
#         async with ProcessWorker(
#             work_pool_name=config.prefect_worker_pool_name,
#             # pool is created manually in server configuration
#             create_pool_if_not_found=False
#         ) as worker:
#             await worker.start()

# if __name__ == "__main__":
#     asyncio.run(run_worker())
