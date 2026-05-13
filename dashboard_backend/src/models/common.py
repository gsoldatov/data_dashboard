"""Shared Pydantic validation mixins."""

from pydantic import model_validator


class AtLeastOneFieldSetMixin:
    """Model validator: requires at least one (non-None) field on update."""

    @model_validator(mode="after")
    def _check_at_least_one_field_set(self) -> "AtLeastOneFieldSetMixin":
        if all(
            getattr(self, field_name) is None
            for field_name in self.model_fields # type: ignore
        ):
            raise ValueError("At least one field must be set")
        return self
