# """
# Updates configuration of a running Prefect server

# NOTE: currently not used, since it only configures worker pools
# which aren't used, when serving deployments via `prefect.serve()`
# """
# import asyncio
# from pathlib import Path

# from prefect.client.orchestration import get_client
# from prefect.client.schemas.actions import WorkPoolCreate
# from prefect.context import use_profile

# PROJECT_ROOT = Path(__file__).parents[4]
# if __name__ == "__main__":
#     import sys
#     sys.path.insert(0, str(PROJECT_ROOT))

# from python_common.src import get_config


# async def main() -> None:
#     config = get_config()

#     with use_profile(config.prefect_profile):
#         # Update worker pool configuration
#         async with get_client() as client:
#             # # Delete other work pools from configuration
#             pool_exists = False
#             delete_tasks = []
#             for wp in await client.read_work_pools():
#                 if wp.name == config.prefect_worker_pool_name:
#                     pool_exists = True
#                 else:
#                     delete_tasks.append(client.delete_work_pool(wp.name))
            
#             if delete_tasks:
#                 await asyncio.gather(*delete_tasks)
#             print(f"Deleted {len(delete_tasks)} work pools.")

#             # # Create work pool, if it does not exist
#             if not pool_exists:
#                 await client.create_work_pool(
#                     work_pool=WorkPoolCreate(
#                         name=config.prefect_worker_pool_name,
#                         type="process"
#                     )
#                 )
#                 print(f"Created work pool '{config.prefect_worker_pool_name}'.")
#             print("Finished updating work pool configuration.")


# if __name__ == "__main__":
#     asyncio.run(main())   
