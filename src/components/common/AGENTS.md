# src/components/common rules

- PublicWording rewrites the person April to "you" but never the month (dates, month lists, option/time/select), so birth dates stay correct.
- Shared mutations use usePendingAction for synchronous duplicate coalescing and owner/view lifetime fencing; confirmations cancel replaced or unmounted requests so callers cannot remain stuck.
