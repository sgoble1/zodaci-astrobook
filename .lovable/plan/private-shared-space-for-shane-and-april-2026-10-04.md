# Private shared space for Shane and April

## What will be built

- Add a clear **Sign in / Account** control beside the site heading on desktop and mobile. Signed-in users can open their dashboard or sign out from the same control.
- Add a **Shared Space** area that only `shanealecompte@gmail.com` and `babybluepuppet@gmail.com` can access.
- Give the space a main conversation plus optional named topic conversations, with live message delivery, unread indicators, and message timestamps.
- Let both people share images and files inside conversations, with previews or downloads from private storage.
- Add separate views for:
  - **Posts** — longer shared updates with attachments.
  - **Notes** — editable shared notes.
  - **Talk Later** — topics and questions to revisit, with open/done status.
  - **Shared Accounts** — service name, link, username, owner, and notes; passwords and recovery codes are explicitly excluded.
- Link the Shared Space from the sidebar and dashboard.

## Privacy and behavior

- Access is checked using the signed-in account on every database operation, not only by hiding the page.
- Only the two approved email addresses can read or change shared content.
- Files use a private storage location and short-lived access links.
- Existing public reading pages and the site password screen remain unchanged.
- Existing AI Chat remains separate; this new area is human-to-human messaging.

## Technical details

- Add shared-space tables for conversations, members, messages, posts, notes, future topics, account references, and attachments.
- Add explicit authenticated grants, row-level policies, validation, and live-update publication for messages and shared content.
- Use the existing account session and Google/email sign-in flow; no new public signup surface is introduced.
- Build focused React hooks/components for shared-space data, uploads, live subscriptions, and page sections.
- Verify access with an allowed account and signed-out visitor, then test messaging, uploads, posts, notes, and topic conversations at desktop and mobile sizes.
