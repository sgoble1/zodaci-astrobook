# Apply the public-version database changes

The accepted draft added new storage for the public version of AstroBook. These changes still need to be saved to the database.

## What gets added
- **Personal profiles:** each member's birth details and saved chart. Only that member can see or change theirs.
- **Personal readings:** readings written from each member's own chart. Only the owner can see them.
- **Shared spaces with email invites:** a member can create a space and invite people by email. An invite only works for the account with the matching email. Only members can see a space.
- **Subscriptions:** each member can see their own plan and nothing else. Only the system can change it.
- **AI usage log:** each member can see their own AI feature use. Only the system can write to it.

April's private AstroBook data and the existing shared space for Shane and April stay as they are.

## Technical details
- Apply `.lovable/drafts/drft_01m4nz2pj5f0hbaq206am4njk8/migrations/0001_public_foundation.sql` as written, using the migration tool.
- Delete the staged file after it applies.
- Every table gets row-level security and grants. Only `profiles` references `auth.users`.
