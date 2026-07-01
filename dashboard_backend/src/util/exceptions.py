import inspect
from collections.abc import Awaitable, Callable
from functools import wraps
from typing import overload

from pydantic import ValidationError


class NotFoundException(Exception):
    """
    Raised, when an object is not found during a repository operation.
    """


class VisualizationDataNotFoundException(Exception):
    """Raised when a visualization's data file cannot be read."""


class ApplicationException(Exception):
    """Raised for unexpected server-side errors (maps to HTTP 500)."""


class DuplicateException(Exception):
    """Raised when a uniqueness constraint would be violated."""

    def __init__(self, entity: str, field: str, value: str) -> None:
        self.entity = entity
        self.field = field
        self.value = value


class InvalidCredentialsException(Exception):
    """Raised when provided credentials are invalid."""


class InternalValidationException(Exception):
    """
    Raised instead of Pydantic `ValidationError` for internal validation failures.
    """


@overload
def internal_validation[**P, R](
    func: Callable[P, Awaitable[R]]
) -> Callable[P, Awaitable[R]]: ...


@overload
def internal_validation[**P, R](func: Callable[P, R]) -> Callable[P, R]: ...


def internal_validation[**P, R](
    func: Callable[P, R]
) -> Callable[P, R] | Callable[P, Awaitable[R]]:
    """
    Decorator for raising `InternalValidationException` exceptions
    instead of Pydantic's `ValidationError`.
    """
    # Coroutines
    if inspect.iscoroutinefunction(func):
        @wraps(func)
        async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            try:
                return await func(*args, **kwargs)  # type: ignore[no-any-return]
            except ValidationError as e:
                raise InternalValidationException(str(e)) from e
        return async_wrapper

    # Sync functions
    else:
        @wraps(func)
        def sync_wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            try:
                return func(*args, **kwargs)
            except ValidationError as e:
                raise InternalValidationException(str(e)) from e
        return sync_wrapper
