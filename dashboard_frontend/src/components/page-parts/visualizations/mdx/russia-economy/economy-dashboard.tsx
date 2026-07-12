import { useState, useEffect, useMemo } from "react";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import { SingleValueSelector } from "@/components/common/visualizations/selectors/single-value-selector";
import {
    IndicatorTable,
    IndicatorHeaderRow,
    IndicatorValueRow,
    HeaderCell,
    ValueCell,
} from "@/components/common/visualizations/indicator-table";
import { FLOW_SPACING } from "@/styles/constants";

import type { RussiaGdpItem } from "@/types/visualization-data/russia-gdp";
import type { RussiaCpiItem } from "@/types/visualization-data/russia-inflation";
import type { RussiaKeyRateItem } from "@/types/visualization-data/russia-inflation";
import type { RussiaLaborMarketWorkforceItem } from "@/types/visualization-data/russia-labor-market";
import type { TradeYearlyTotalItem } from "@/types/visualization-data/russia-trade";
import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

const BLN = 1_000_000_000;

/** Extract the year (first 4 characters) from a "YYYY-MM" string. */
function yearFromMonth(ym: string): number {
    return Number(ym.slice(0, 4));
}

/** Return the last "YYYY-MM" value lexicographically (latest month). */
function lastMonth(items: { year_month: string }[]): string | undefined {
    if (items.length === 0) return undefined;
    return [...items].sort((a, b) => b.year_month.localeCompare(a.year_month))[0]
        .year_month;
}

/** Build a Map<year, value> for a yearly dataset keyed by year. */
function yearlyMap<T extends { year: number; value: number }>(
    items: T[],
): Map<number, number> {
    const map = new Map<number, number>();
    for (const item of items) {
        map.set(item.year, item.value);
    }
    return map;
}

/** Format a number as integer with spaces and a unit suffix. */
function fmt(value: number, unit: string): string {
    const rounded = Math.round(value * 10) / 10;
    return `${rounded.toLocaleString("en-US")} ${unit}`;
}

/** Format a percentage change, e.g. "+5.2%" or "−3.1%". */
function fmtPct(pct: number): string {
    const sign = pct >= 0 ? "+" : "−";
    return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

/** Format an absolute difference, e.g. "+12.3" or "−5.0". */
function fmtDiff(diff: number, unit: string): string {
    const sign = diff >= 0 ? "+" : "−";
    return `${sign}${fmt(Math.abs(diff), unit)}`;
}

function yoyPct(curr: number, prev: number): number {
    return prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
}

function yoyAbs(curr: number, prev: number): number {
    return curr - prev;
}

/**
 * Compute 12-month cumulative inflation ending at `endMonth` (inclusive).
 * The CPI `value` is a monthly multiplier where 100 = no change, so
 * ratio = value / 100.  Returns `undefined` when fewer than 12 months of
 * data precede `endMonth`.
 */
function calcCumulativeInflation(
    sorted: RussiaCpiItem[],
    endMonth: string,
): number | undefined {
    const endIdx = sorted.findIndex((d) => d.year_month === endMonth);
    if (endIdx < 11) return undefined;
    const months = sorted.slice(endIdx - 11, endIdx + 1);
    let product = 1;
    for (const m of months) {
        product *= m.value / 100;
    }
    return (product - 1) * 100;
}

export const EconomyDashboard = () => {
    // ── Fetch all 8 datasets ──────────────────────────────────────────

    const { data: gdpRubData } = useGetVisualizationDatasetQuery(
        "russia_gdp_constant_prices_rub",
    );
    const { data: gdpPppData } = useGetVisualizationDatasetQuery(
        "russia_gdp_ppp_constant_prices",
    );
    const { data: cpiData } = useGetVisualizationDatasetQuery(
        "russia_consumer_price_index",
    );
    const { data: keyRateData } = useGetVisualizationDatasetQuery(
        "russia_key_rate",
    );
    const { data: workforceData } = useGetVisualizationDatasetQuery(
        "russia_labor_workforce",
    );
    const { data: exportsData } = useGetVisualizationDatasetQuery(
        "russia_trade_exports_yearly_totals",
    );
    const { data: importsData } = useGetVisualizationDatasetQuery(
        "russia_trade_imports_yearly_totals",
    );
    const { data: budgetData } = useGetVisualizationDatasetQuery(
        "russia_state_budget",
    );

    const gdpRub = (gdpRubData ?? []) as RussiaGdpItem[];
    const gdpPpp = (gdpPppData ?? []) as RussiaGdpItem[];
    const cpi = (cpiData ?? []) as RussiaCpiItem[];
    const keyRate = (keyRateData ?? []) as RussiaKeyRateItem[];
    const workforce = (workforceData ?? []) as RussiaLaborMarketWorkforceItem[];
    const exports = (exportsData ?? []) as TradeYearlyTotalItem[];
    const imports = (importsData ?? []) as TradeYearlyTotalItem[];
    const budget = (budgetData ?? []) as RussiaStateBudgetItem[];

    // ── All available years ───────────────────────────────────────────

    const allYears = useMemo(() => {
        const years = new Set<number>();
        for (const d of gdpRub) years.add(d.year);
        for (const d of gdpPpp) years.add(d.year);
        for (const d of cpi) years.add(yearFromMonth(d.year_month));
        for (const d of keyRate) years.add(yearFromMonth(d.year_month));
        for (const d of workforce) years.add(yearFromMonth(d.year_month));
        for (const d of exports) years.add(d.year);
        for (const d of imports) years.add(d.year);
        for (const d of budget) years.add(d.year);
        return [...years].filter((y) => !isNaN(y)).sort((a, b) => a - b);
    }, [gdpRub, gdpPpp, cpi, keyRate, workforce, exports, imports, budget]);

    // Default to the year before the current one, falling back to the
    // most recent year in the data when the current year isn't represented.
    const defaultYear = useMemo(() => {
        if (allYears.length === 0) return 0;
        const prevCalendarYear = new Date().getFullYear() - 1;
        return allYears.includes(prevCalendarYear)
            ? prevCalendarYear
            : allYears[allYears.length - 1];
    }, [allYears]);

    const [selectedYear, setSelectedYear] = useState<string>(
        () => String(defaultYear),
    );

    // Sync selectedYear when data arrives (initial render may have had an
    // empty allYears, leaving selectedYear stale at "0").
    useEffect(() => {
        if (allYears.length === 0) return;
        if (!allYears.includes(Number(selectedYear))) {
            setSelectedYear(String(defaultYear));
        }
    }, [allYears, defaultYear, selectedYear]);

    const year = Number(selectedYear);
    const prevYear = year - 1;

    // ── Pre-compute maps and values ────────────────────────────────────

    const gdpRubMap = useMemo(() => yearlyMap(gdpRub), [gdpRub]);
    const gdpPppMap = useMemo(() => yearlyMap(gdpPpp), [gdpPpp]);
    const exportsMap = useMemo(() => yearlyMap(exports), [exports]);
    const importsMap = useMemo(() => yearlyMap(imports), [imports]);

    // Budget: income (number="1"), expenses ("2"), balance ("3")
    const budgetIncome = useMemo(
        () => yearlyMap(budget.filter((d) => d.number === "1")),
        [budget],
    );
    const budgetExpenses = useMemo(
        () => yearlyMap(budget.filter((d) => d.number === "2")),
        [budget],
    );
    const budgetBalance = useMemo(
        () => yearlyMap(budget.filter((d) => d.number === "3")),
        [budget],
    );

    // Monthly datasets: last available month for selected / previous year
    const sortedCpi = useMemo(
        () => [...cpi].sort((a, b) => a.year_month.localeCompare(b.year_month)),
        [cpi],
    );
    const cpiLast = useMemo(
        () =>
            lastMonth(cpi.filter((d) => yearFromMonth(d.year_month) === year)),
        [cpi, year],
    );
    const cpiPrevLast = useMemo(
        () =>
            lastMonth(
                cpi.filter((d) => yearFromMonth(d.year_month) === prevYear),
            ),
        [cpi, prevYear],
    );

    const krPrevVal = useMemo(() => {
        const sorted = [...keyRate]
            .filter((d) => d.key_rate != null)
            .sort((a, b) => a.year_month.localeCompare(b.year_month));
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (yearFromMonth(sorted[i].year_month) <= prevYear) {
                return sorted[i].key_rate;
            }
        }
        return undefined;
    }, [keyRate, prevYear]);

    const wfLast = useMemo(
        () =>
            lastMonth(
                workforce.filter(
                    (d) => yearFromMonth(d.year_month) === year,
                ),
            ),
        [workforce, year],
    );
    const wfPrevLast = useMemo(
        () =>
            lastMonth(
                workforce.filter(
                    (d) => yearFromMonth(d.year_month) === prevYear,
                ),
            ),
        [workforce, prevYear],
    );

    // ── Compute display values ─────────────────────────────────────────

    // GDP RUB — already in billions
    const gdpRubCurr = gdpRubMap.get(year);
    const gdpRubPrev = gdpRubMap.get(prevYear);

    // GDP PPP — divide by 1e9
    const gdpPppCurr = gdpPppMap.has(year)
        ? gdpPppMap.get(year)! / BLN
        : undefined;
    const gdpPppPrev = gdpPppMap.has(prevYear)
        ? gdpPppMap.get(prevYear)! / BLN
        : undefined;

    // CPI — 12-month cumulative inflation
    const inflationCurr =
        cpiLast != null
            ? calcCumulativeInflation(sortedCpi, cpiLast)
            : undefined;
    const inflationPrev =
        cpiPrevLast != null
            ? calcCumulativeInflation(sortedCpi, cpiPrevLast)
            : undefined;
    const inflationDiff =
        inflationCurr != null && inflationPrev != null
            ? inflationCurr - inflationPrev
            : undefined;

    // Key rate — if no entry exists for the selected year (rate was constant),
    // fall back to the most recent value at or before the selected year.
    const krCurr = useMemo(() => {
        const sorted = [...keyRate]
            .filter((d) => d.key_rate != null)
            .sort((a, b) => a.year_month.localeCompare(b.year_month));
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (yearFromMonth(sorted[i].year_month) <= year) {
                return sorted[i].key_rate;
            }
        }
        return undefined;
    }, [keyRate, year]);
    const krDiff =
        krCurr != null && krPrevVal != null ? yoyAbs(krCurr, krPrevVal) : undefined;

    // Unemployment
    const wfCurr = workforce.find((d) => d.year_month === wfLast)
        ?.unemployed_share_in_workforce;
    const wfPrev = workforce.find((d) => d.year_month === wfPrevLast)
        ?.unemployed_share_in_workforce;
    const wfDiff =
        wfCurr != null && wfPrev != null ? wfCurr - wfPrev : undefined;

    // Trade — divide by 1e9
    const exportsCurr = exportsMap.has(year)
        ? exportsMap.get(year)! / BLN
        : undefined;
    const exportsPrev = exportsMap.has(prevYear)
        ? exportsMap.get(prevYear)! / BLN
        : undefined;
    const importsCurr = importsMap.has(year)
        ? importsMap.get(year)! / BLN
        : undefined;
    const importsPrev = importsMap.has(prevYear)
        ? importsMap.get(prevYear)! / BLN
        : undefined;

    // Budget — already in billions
    const incomeCurr = budgetIncome.get(year);
    const incomePrev = budgetIncome.get(prevYear);
    const expensesCurr = budgetExpenses.get(year);
    const expensesPrev = budgetExpenses.get(prevYear);
    const balanceCurr = budgetBalance.get(year);

    // ── Rendering ──────────────────────────────────────────────────────

    return (
        <div className={FLOW_SPACING}>
            <div className="mb-6">
                <SingleValueSelector
                    title="Year"
                    allValues={allYears.map(String)}
                    selectedValue={selectedYear}
                    onSelect={setSelectedYear}
                />
            </div>

            {/* GDP */}
            <h2 className="font-bold text-xl mt-6">GDP</h2>
            <IndicatorTable data-testid="gdp-table">
                <IndicatorHeaderRow>
                    <HeaderCell>GDP (RUB bln)</HeaderCell>
                    <HeaderCell>GDP PPP (USD bln)</HeaderCell>
                </IndicatorHeaderRow>
                <IndicatorValueRow>
                    <ValueCell
                        color={
                            gdpRubCurr != null && gdpRubPrev != null
                                ? gdpRubCurr >= gdpRubPrev
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {gdpRubCurr != null
                            ? gdpRubPrev != null
                                ? `${fmt(gdpRubCurr, "bln RUB")} (${fmtPct(yoyPct(gdpRubCurr, gdpRubPrev))})`
                                : `${fmt(gdpRubCurr, "bln RUB")}`
                            : "—"}
                    </ValueCell>
                    <ValueCell
                        color={
                            gdpPppCurr != null && gdpPppPrev != null
                                ? gdpPppCurr >= gdpPppPrev
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {gdpPppCurr != null
                            ? gdpPppPrev != null
                                ? `${fmt(gdpPppCurr, "bln USD")} (${fmtPct(yoyPct(gdpPppCurr, gdpPppPrev))})`
                                : `${fmt(gdpPppCurr, "bln USD")}`
                            : "—"}
                    </ValueCell>
                </IndicatorValueRow>
            </IndicatorTable>

            {/* Inflation & Unemployment */}
            <h2 className="font-bold text-xl mt-6">
                Inflation &amp; Unemployment
            </h2>
            <IndicatorTable data-testid="inflation-table">
                <IndicatorHeaderRow>
                    <HeaderCell>Inflation (YoY)</HeaderCell>
                    <HeaderCell>Key Rate</HeaderCell>
                    <HeaderCell>Unemployment</HeaderCell>
                </IndicatorHeaderRow>
                <IndicatorValueRow>
                    <ValueCell
                        color={
                            inflationDiff != null
                                ? inflationDiff <= 0
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {inflationCurr != null
                            ? inflationDiff != null
                                ? `${inflationCurr.toFixed(2)}% (${fmtDiff(inflationDiff, "pp")})`
                                : `${inflationCurr.toFixed(2)}%`
                            : "—"}
                    </ValueCell>
                    <ValueCell
                        color={
                            krDiff != null
                                ? krDiff <= 0
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {krCurr != null
                            ? krDiff != null
                                ? `${krCurr}% (${fmtDiff(krDiff, "pp")})`
                                : `${krCurr}%`
                            : "—"}
                    </ValueCell>
                    <ValueCell
                        color={
                            wfDiff != null
                                ? wfDiff <= 0
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {wfCurr != null
                            ? wfDiff != null
                                ? `${wfCurr.toFixed(1)}% (${fmtDiff(wfDiff, "pp")})`
                                : `${wfCurr.toFixed(1)}%`
                            : "—"}
                    </ValueCell>
                </IndicatorValueRow>
            </IndicatorTable>

            {/* Trade */}
            <h2 className="font-bold text-xl mt-6">Trade</h2>
            <IndicatorTable data-testid="trade-table">
                <IndicatorHeaderRow>
                    <HeaderCell>Exports</HeaderCell>
                    <HeaderCell>Imports</HeaderCell>
                </IndicatorHeaderRow>
                <IndicatorValueRow>
                    <ValueCell
                        color={
                            exportsCurr != null && exportsPrev != null
                                ? exportsCurr >= exportsPrev
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {exportsCurr != null
                            ? exportsPrev != null
                                ? `${fmt(exportsCurr, "bln USD")} (${fmtDiff(yoyAbs(exportsCurr, exportsPrev), "bln USD")}, ${fmtPct(yoyPct(exportsCurr, exportsPrev))})`
                                : `${fmt(exportsCurr, "bln USD")}`
                            : "—"}
                    </ValueCell>
                    <ValueCell
                        color={
                            importsCurr != null && importsPrev != null
                                ? importsCurr >= importsPrev
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {importsCurr != null
                            ? importsPrev != null
                                ? `${fmt(importsCurr, "bln USD")} (${fmtDiff(yoyAbs(importsCurr, importsPrev), "bln USD")}, ${fmtPct(yoyPct(importsCurr, importsPrev))})`
                                : `${fmt(importsCurr, "bln USD")}`
                            : "—"}
                    </ValueCell>
                </IndicatorValueRow>
            </IndicatorTable>

            {/* Budget */}
            <h2 className="font-bold text-xl mt-6">Budget</h2>
            <IndicatorTable data-testid="budget-table">
                <IndicatorHeaderRow>
                    <HeaderCell>Income</HeaderCell>
                    <HeaderCell>Expenses</HeaderCell>
                    <HeaderCell>Balance</HeaderCell>
                </IndicatorHeaderRow>
                <IndicatorValueRow>
                    <ValueCell
                        color={
                            incomeCurr != null && incomePrev != null
                                ? incomeCurr >= incomePrev
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {incomeCurr != null
                            ? incomePrev != null
                                ? `${fmt(incomeCurr, "bln RUB")} (${fmtPct(yoyPct(incomeCurr, incomePrev))})`
                                : `${fmt(incomeCurr, "bln RUB")}`
                            : "—"}
                    </ValueCell>
                    <ValueCell
                        color={
                            expensesCurr != null && expensesPrev != null
                                ? expensesCurr >= expensesPrev
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {expensesCurr != null
                            ? expensesPrev != null
                                ? `${fmt(expensesCurr, "bln RUB")} (${fmtPct(yoyPct(expensesCurr, expensesPrev))})`
                                : `${fmt(expensesCurr, "bln RUB")}`
                            : "—"}
                    </ValueCell>
                    <ValueCell
                        color={
                            balanceCurr != null
                                ? balanceCurr >= 0
                                    ? "positive"
                                    : "negative"
                                : undefined
                        }
                    >
                        {balanceCurr != null
                            ? fmt(balanceCurr, "bln RUB")
                            : "—"}
                    </ValueCell>
                </IndicatorValueRow>
            </IndicatorTable>
        </div>
    );
};
