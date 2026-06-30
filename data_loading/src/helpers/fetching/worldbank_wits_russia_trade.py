"""
Shared fetching utilities for WITS World Bank Russia trade data.

Product categories
------------------
The WITS CountryProfile page offers 27+ product groupings across multiple
classification schemes (HS groups, SITC Rev2, Sector, Stages of Processing)
selectable via the "Product Group" filter.  The 16 HS-based categories
fetched by ``get_product_codes`` come from the "Quick links" section and
exclude overlapping entries from other schemes (e.g. "Chemical" / "Chemicals",
"Fuels" / "Fuel") as well as the "All Products" aggregate.

Yearly totals vs. by-country data
---------------------------------
For imports, by-category sums (World partner) differ from by-country yearly
totals, especially in early years (1996–1997: +26–33 %).  Exports show no
such discrepancy.  See the fetch task docstrings for details.
"""

from __future__ import annotations

import logging
import re

import httpx

_RE_PRODUCT_CODE = re.compile(r"Product/([^\"'&\s]+)")
_EXCLUDED_PRODUCTS: frozenset[str] = frozenset({"Total"})


def get_product_codes(logger: logging.Logger) -> list[str]:
    """Extract product category codes from the RUS country profile page."""
    rus_url = "https://wits.worldbank.org/CountryProfile/en/RUS"

    logger.info("Fetching RUS country profile to extract product codes")
    with httpx.Client() as client:
        response = client.get(rus_url)
        response.raise_for_status()
        html = response.text

    codes = sorted(set(_RE_PRODUCT_CODE.findall(html)) - _EXCLUDED_PRODUCTS)
    logger.debug("Product codes: %s", codes)
    return codes


def build_wits_by_country_url(
    trade_flow: str, indicator: str, *, end_year: int | None = None
) -> str:
    """Build a WITS CountryProfile by-country URL for Russia.

    Args:
        trade_flow: ``"Export"`` or ``"Import"``.
        indicator: ``"XPRT-TRD-VL"`` (exports) or ``"MPRT-TRD-VL"`` (imports).
        end_year: End year for the data range (defaults to current year).
    """
    if end_year is None:
        from datetime import datetime

        end_year = datetime.now().year

    return (
        "https://wits.worldbank.org/CountryProfile/en/Country/RUS"
        "/StartYear/1992/EndYear/"
        f"{end_year}"
        f"/TradeFlow/{trade_flow}/Partner/BY-COUNTRY/Indicator/{indicator}"
    )
