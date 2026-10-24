# Lumina Finance — Smart Financial Insights Engine

The Smart Financial Insights Engine is a deterministic, rule-based service embedded directly in Lumina Finance. It evaluates financial telemetry from transactions, categorical budgets, and savings goals to produce actionable, evidence-based observations.

## Design Principles
1. **Mathematical Grounding**: Every observation is backed by quantitative data (e.g., exact percentages, monetary thresholds).
2. **Deterministic & Transparent**: No black-box machine learning or external LLMs are invoked in Step 15. Rules are deterministic and fully auditable.
3. **Non-Judgmental Copy**: Wording focuses on positive reinforcement and objective statements of fact (e.g., "Total expenses rose by 14% compared with previous period" instead of "You are spending too much").
4. **Safety & Zero-Division Defense**: All ratios guard against zero denominators and missing historical baselines.

---

## Rule Registry & Thresholds

| Rule ID | Name | Trigger Condition | Severity | Copy Template |
|---|---|---|---|---|
| `insight-spending-increase` | Spending Acceleration | $\Delta_{\text{expense}} > +10\%$ vs. equivalent prior period | `warning` | "Total expenses rose by {delta}% compared with the previous equivalent period." |
| `insight-spending-decrease` | Expense Reduction | $\Delta_{\text{expense}} < -10\%$ vs. equivalent prior period | `success` | "Great job! Your spending decreased by {delta}% compared with the previous period." |
| `insight-spending-stable` | Spending Equilibrium | $-10\% \le \Delta_{\text{expense}} \le +10\%$ | `info` | "Your spending remained steady within {delta}% of the previous period." |
| `insight-category-concentration` | Category Dominance | Single category $\ge 35\%$ of period expenses | `info` | "{category} accounts for {percentage}% of your total expenses for this period." |
| `insight-over-budget-*` | Budget Exceeded | Spent $> \text{Limit}$ | `warning` | "Your {category} budget has been exceeded by ₹{excess}." |
| `insight-approaching-budget-*` | Budget Cap Alert | $80\% \le \text{Utilization} \le 100\%$ | `warning` | "You have used {pct}% of your {category} budget limit." |
| `insight-strong-savings` | Healthy Savings Rate | $\text{Savings Rate} \ge 20\%$ | `success` | "You achieved a {rate}% savings rate during this period." |
| `insight-negative-cashflow` | Cash Flow Deficit | $\text{Expenses} > \text{Income}$ | `warning` | "Expenses exceeded income by ₹{deficit} in this period." |
| `insight-goal-completed-*` | Goal Completed | Progress $\ge 100\%$ | `success` | "Congratulations! You reached 100% of your target for '{title}'! 🎉" |
| `insight-goal-progress-*` | Goal Milestone | Progress $\ge 50\%$ | `success` | "You are {pct}% of the way toward your '{title}' goal." |

---

## Integration Guide
The insights engine is exposed via `GET /api/analytics/insights` and mirrored on the client via `generateFinancialInsights(...)` for resilient offline calculation.
