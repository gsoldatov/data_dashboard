# """
# Deploys data loading flows on a running Prefect server

# NOTE: currently not used, due to serving flows directly
# """
# import asyncio
# from datetime import timedelta
# from pathlib import Path

# from prefect.context import use_profile

# PROJECT_ROOT = Path(__file__).parents[4]
# if __name__ == "__main__":
#     import sys
#     sys.path.insert(0, str(PROJECT_ROOT))

# from data_loading.src.jobs import russia_state_budget
# from python_common.src import get_config


# async def main() -> None:
#     config = get_config()

#     with use_profile(config.prefect_profile):
#         deployments = [
#             await russia_state_budget.ato_deployment(
#                 "Russia state budget",
#                 # interval=timedelta(days=7),
#                 interval=timedelta(minutes=1),
#                 work_pool_name=config.prefect_worker_pool_name
#             )
#         ]

#         await asyncio.gather(
#             *(d.aapply() for d in deployments)
#         )
#     print(
#       f"Registered {len(deployments)} deployments "
#       "in profile '{config.prefect_profile}'."
#     )


# if __name__ == "__main__":
#     asyncio.run(main())   
