import sys
from pathlib import Path
from loguru import logger

from python_common.src.config import get_config, Config


def get(job_name: str | None = None) -> None:
    """
    Configure logging according to the project's configuration.
    
    Args:
        job_name: Optional job name for file logging. If provided and 
                  DATA_LOADING_LOG_MODE is "file", logs will be written to 
                  a separate file for each job execution.
    """
    # Remove default logger
    logger.remove()
    
    # Read configuration
    settings: Config = get_config()
    
    # Configure logging based on mode
    if settings.data_loading_log_mode == "stderr":
        # Log to stderr
        logger.add(
            sys.stderr,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
            level="INFO"
        )
    elif settings.data_loading_log_mode == "file":
        # Ensure logs directory exists
        logs_dir = settings.logs_directory / "data_loading"
        logs_dir.mkdir(parents=True, exist_ok=True)
        
        if job_name:
            # Create separate log file for each job execution
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            log_file = logs_dir / f"{job_name}_{timestamp}.log"
        else:
            # General data loading log file
            log_file = logs_dir / "data_loading.log"
            
        logger.add(
            log_file,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level="INFO",
            rotation="10 MB",
            retention="1 week"
        )
    
    # Log initial message to confirm setup
    logger.info(f"Logging initialized in {settings.data_loading_log_mode} mode")
    if job_name and settings.data_loading_log_mode == "file":
        logger.info(f"Job-specific logging enabled for: {job_name}")