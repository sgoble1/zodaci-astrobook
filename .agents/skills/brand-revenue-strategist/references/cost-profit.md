# Cost & Profit Review

## Build a reconciled input ledger

Record amount, currency, period, source/date and whether measured, quoted, estimated or missing. Separate builder credits from runtime AI costs and from customer credit allowances; do not assume these units have a fixed exchange rate. Retrieve actual usage/billing and payment evidence when authorized and available. Source code reveals limits, not actual expense.

Include subscription/digital/print revenue, discounts, taxes, refunds, processing fees, chargebacks, AI generation and retries, cover images, TTS/audio, storage/egress, supplier printing, shipping, fulfillment labor and fixed operating costs. Separate live from test payments, recurring from one-off revenue, and fixed from marginal costs. Do not substitute estimated printing costs for a real supplier quote.

## Compute consistent unit economics

Use one currency and time basis; state any exchange rate/date. Explicitly state whether revenue excludes tax and whether refunds are already netted out, to avoid double subtraction.

- Net revenue = customer receipts − included/remitted tax − refunds − discounts not already deducted.
- Contribution = net revenue − payment fees − variable AI/media/storage costs − printing/shipping/variable fulfillment costs.
- Contribution margin = contribution / net revenue; report undefined when net revenue is zero.
- Monthly operating result = total monthly contribution − fixed monthly operating costs.
- CAC = attributable acquisition spend / attributable new paying customers; do not divide by signups or imply a causal cohort without evidence.
- Break-even customer count = fixed costs / weighted contribution per customer for a stated product mix; report no finite break-even when contribution is nonpositive.
- CAC payback months = CAC / monthly contribution per acquired subscriber; use a consistent subscriber cohort and report undefined when contribution is nonpositive.

Do not estimate subscription lifetime value from unmeasured churn. If churn is known, label contribution/churn as a simplified steady-state scenario and state its limitations. Show digital and printed books separately, including expanded-edition delivery costs; revenue alone is not profit.

## Stress-test generation economics

Measure new-account upfront work, reads on demand, preview use, paid heavy users, repeated retries, failed jobs and shared reuse permitted by privacy. Project scenarios from measured per-feature costs and invocation counts, not a single average reading. Show low/base/high usage, conversion and refund scenarios; bound uncertainty rather than asserting exact savings.

Prefer saved results, per-user on-demand work, deterministic chart calculations, capped retries and transparent allowances. Review quality, response time and chart accuracy alongside cost; cheaper output that needs repeated correction can cost more. Do not alter free/paid rules or reuse private text across accounts as a cost-saving shortcut.

## Recommend with guardrails

Report profitable and loss-making scenarios, the largest sensitivities, missing supplier/usage inputs and prioritized interventions. Give each intervention expected direction of effect, validation measurement, quality risk and owner decision required. Request authorization before buying credits, adjusting prices/allowances or spending on campaigns. Do not promise margins until actual fulfillment and costs are verified.