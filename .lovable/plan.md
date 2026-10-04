# SmarChat, Wonderings, Private Masterbook, and Reliability Plan

## Goals
- Rename the saved AI conversation experience to **SmarChat** everywhere visitors see it, while keeping existing conversation history and links working.
- Add a private **Things I Was Wondering About You** area for April and Shane.
- Make the Reading Room’s Masterbook text genuinely private after password unlock, not merely hidden by the page interface.
- Confirm the shared dashboard, posts, and private chat work between both approved accounts.
- Close the mobile and reliability gaps found during the audit.

## What will change

### 1. SmarChat naming
- Rename the side-menu item, page title, dashboard shortcut, and update-feed wording to **SmarChat**.
- Keep the current `/chat` addresses and saved conversation records intact, so existing history and bookmarks do not break.
- Keep **Ask the Sources** as the separate one-question research experience.

### 2. “Things I Was Wondering About You”
- Add a dedicated shared-space section and menu destination.
- Let either person add a thought, question, or realization about the other person; because the space has exactly two members, the recipient will be identified automatically.
- Show author, recipient, date, content, and discussion state.
- Add emoji reactions/likes and threaded comments, with immediate updates for both accounts.
- Let authors edit or remove their own entries/comments and let either person mark an item discussed or reopen it.
- Surface recent wonderings and comment activity on the shared dashboard, with clear empty states and unread indicators.

### 3. Truly private Masterbook reading
- Move the extracted Masterbook index, chapter markdown, and extracted source text out of publicly addressable site files into private storage.
- Upgrade the password check to issue a short-lived, signed unlock token; store only that token in the browser, never the password.
- Add a protected content endpoint that validates the unlock token before returning an index, chapter, or source document.
- Route the Reading Room, full Masterbook document/chapter pages, source readers, citations, summaries, topic excerpts, and SmarChat retrieval through one protected content loader.
- Keep a complete document page with full text, search, chapter navigation, citations, and links from the Reading Room.
- Remove the old public text copies after the protected path is verified, preventing direct URL bypass.
- Handle expired access by returning to the password screen and then restoring the requested page after unlock.

### 4. Shared-space reliability and UX fixes
- Scope message attachment and reaction queries to the open conversation instead of loading every record.
- Replace unbounded unread-message scans with database-side unread counts.
- Show send, reaction, upload, edit, and delete failures clearly instead of failing silently.
- Replace browser prompt/confirm dialogs with accessible in-app edit and delete dialogs.
- Refresh expiring attachment links when needed.
- Centralize the April/Shane membership check for the interface while preserving database-enforced access as the authority.
- Add live updates for posts, notes, future topics, wonderings, comments, and reactions.

### 5. Mobile pass
- Change private chat to a phone-friendly list/detail flow with a clear back-to-conversations action and no fixed 620px panel height or competing scroll areas.
- Make message action/reaction rows wrap cleanly and keep the composer above phone safe areas.
- Add a compact mobile chapter contents control for long Masterbook pages.
- Replace hundreds of tiny page links in long source documents with a compact page selector/jump control.
- Check shared navigation, forms, attachments, long account links, Reading Room search, full-text pages, and SmarChat at phone and desktop widths.

### 6. Two-account end-to-end verification
- Sign in separately as Shane and April using isolated browser sessions.
- Create a temporary message and post as Shane; reload as April and verify both appear.
- Reply/react as April; reload as Shane and verify the reply/reaction appears.
- Create and comment on a temporary wondering from both sides and verify its unread/discussed behavior.
- Unlock the Reading Room with the real password, open a linked Masterbook document, verify full text and navigation, then confirm a direct unauthenticated text-file request is denied.
- Remove temporary verification content after the test.
- Run the project checks and inspect browser/runtime/network errors before completion.

## Technical details
- Add dedicated `shared_wonderings`, `shared_wondering_comments`, `shared_wondering_reactions`, and read-state records with explicit grants, row-level access rules, foreign keys, uniqueness rules, indexes, and live-update publication.
- Store private extracted documents in a non-public bucket and serve them through a validated edge function. Use a generated server-only signing key for expiring unlock tokens.
- Add one authenticated data layer for wonderings and one protected document loader so access and error handling are consistent across every caller.
- Preserve the existing account-specific SmarChat history and the database-enforced two-person shared-space boundary.

## Included enhancement recommendations
These are included because they directly close gaps found in the current experience:
- Activity badges for new wonderings/comments and unread conversations.
- Clear author labels and timestamps throughout shared dashboard cards.
- Optimistic states for messaging and reactions, with rollback on failure.
- Friendly loading, empty, expired-password, offline, and permission-denied states.
- A focused accessibility pass for keyboard focus, dialog controls, tap sizes, and screen-reader labels.

## Acceptance criteria
- Every visible “AI Chat with History” label reads **SmarChat**, and old `/chat` links/history still work.
- Only April and Shane can read or change wonderings, comments, reactions, posts, notes, messages, and attachments.
- Both accounts can create and see each other’s saved posts and messages after reload.
- The Reading Room opens a real full-text Masterbook document after password entry, while direct access without a valid unlock token fails.
- Core shared-space and reading workflows fit and remain usable on phone and desktop sizes.
- Build/type checks pass, and tested flows produce no relevant browser, runtime, or network errors.
