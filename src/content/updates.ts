/** Recent updates feed — newest first. Add an entry whenever content or features change. */
export type UpdateKind = 'Feature' | 'Content' | 'Change' | 'Fix';
export type Update = { date: string; kind: UpdateKind; title: string; body: string; to?: string };

export const UPDATES: Update[] = [
  { date: '2026-10-10', kind: 'Content', title: 'Two new Library topics', body: 'Thinking & Decisions and Creativity & Play connect April’s recorded placements with plain-language interpretations, reflection prompts, and original Birth Chart Book chapters.', to: '/topics/thinking-decisions' },
  { date: '2026-10-10', kind: 'Fix', title: 'Clearer messages when AI is unavailable', body: 'AI tools now explain credit-related failures rather than showing a generic error. Creating an answer or episode still requires available workspace credits.', to: '/podcasts' },
  { date: '2026-10-10', kind: 'Feature', title: 'Choose your podcast length', body: 'Generated episodes offer shorter and longer duration choices while keeping their source citations. Requested duration is a target, not an exact recording length.', to: '/podcasts' },
  { date: '2026-10-10', kind: 'Feature', title: 'Organize shared media into folders', body: 'Create and manage folders, drag files into them, move files, search captions, and sort the shared media library.', to: '/shared/media' },
  { date: '2026-10-10', kind: 'Content', title: 'Relationship needs and connections', body: 'Relationship pages now compare both people’s chart-based needs and saved birth facts, separating symbolic interpretations from factual coincidences.', to: '/relationships' },
  { date: '2026-10-10', kind: 'Fix', title: 'More readable tables and headings on phones', body: 'Wide tables scroll sideways instead of crushing their headings into vertical text, and workbook headings have more usable spacing.', to: '/workbook' },
  { date: '2026-10-10', kind: 'Content', title: 'Chart checks and verification references', body: 'Chart calculations include additional points and aspect checks. Chart and system pages link to sources for checking sky positions, history, and the limits of interpretation.', to: '/verify' },
  { date: '2026-10-10', kind: 'Change', title: 'Created pages shared with April and Shane', body: 'Both approved members can read and edit created pages and change their menu location. Deletion remains limited to the creator or an admin.', to: '/create' },
  { date: '2026-10-10', kind: 'Content', title: 'System histories and April-focused guidance', body: 'Other Systems includes origins, methods, cultural context, and limitations. Private counselors use the saved session’s context without claiming hidden learning across sessions.', to: '/other-systems' },
  { date: '2026-10-04', kind: 'Feature', title: 'Private shared dashboard and live chat', body: 'April and Shane can see shared posts, notes, future topics, contacts and live private messages together.', to: '/shared' },
  { date: '2026-10-04', kind: 'Content', title: 'Volume II mapped throughout the site', body: 'All 19 supplementary chapters now appear in their relevant timing, past-life, numerology, healing, relationship and practice sections.', to: '/volume-2' },
  { date: '2026-10-04', kind: 'Change', title: 'Protected Sources reading room', body: 'Every document, chapter and section is backed by the real Masterbook text and now opens after the site password.', to: '/read' },
  { date: '2026-10-04', kind: 'Content', title: 'Volume II and the Compendium in full', body: 'All 19 Volume II sections and all 29 Compendium chapters (chakras, Gene Keys, love languages, eclipses, Venus retrograde, journaling prompts and more) are now readable in the Masterbook and appear on matching topic pages.', to: '/masterbook' },
  { date: '2026-10-04', kind: 'Feature', title: 'Recent updates feed', body: 'See the latest content, features and changes on the home page and your dashboard.' },
  { date: '2026-10-04', kind: 'Feature', title: 'SmartChat', body: 'Have back-and-forth conversations with the sources. Follow-ups remember context, answers cite passages, and chats are saved to your account.', to: '/chat' },
  { date: '2026-10-04', kind: 'Feature', title: 'My Workspace for every account', body: 'Any signed-in user can upload Masterbook documents, edit sections with a live preview, and manage relationships.', to: '/admin' },
  { date: '2026-10-04', kind: 'Feature', title: 'Bookmark any chapter or section', body: 'Every full chapter on topic pages and every relationship source section now has its own Bookmark link.', to: '/dashboard' },
  { date: '2026-10-04', kind: 'Feature', title: 'Podcast mini player', body: 'Episodes keep playing in a small player while you browse other pages.', to: '/podcasts' },
  { date: '2026-10-04', kind: 'Change', title: 'Colour-coded side menu', body: 'Each menu category now has its own colour so groups are easier to tell apart.' },
  { date: '2026-10-04', kind: 'Content', title: 'Relationships in the Sources — full text', body: 'All 19 love and relationship sections shown in full with citations, summaries and Masterbook links.', to: '/guides/relationships' },
  { date: '2026-10-03', kind: 'Feature', title: 'Accounts, Google sign-in and dashboard', body: 'Create an account with email or Google, keep bookmarks with notes, and manage your own relationships.', to: '/dashboard' },
  { date: '2026-10-03', kind: 'Change', title: 'Site password', body: 'Visitors enter a password before viewing the site.' },
  { date: '2026-10-02', kind: 'Content', title: 'Full source chapters on topic pages', body: 'Retrogrades, Transits, Numerology, Past Lives, Chinese Ba Zi and more now include every matching chapter in full.', to: '/retrogrades' },
  { date: '2026-10-01', kind: 'Feature', title: 'Relationship reading & timeline', body: 'Combined charts, aspects, Ba Zi and Bagua in one reading, plus dated transits to each relationship.', to: '/relationships' },
  { date: '2026-09-30', kind: 'Change', title: 'New night-sky look', body: 'Dark glass theme with drifting particles, glowing orbs and page transitions.' },
];
