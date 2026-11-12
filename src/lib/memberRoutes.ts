/**
 * Pages every signed-in account opens as themselves. Anything not listed here is an April-edition page: other
 * accounts get their own chart or readings in its place (PublicChartFallback), so new member pages must be listed.
 */
export const MEMBER_PAGES = ['/shane', '/zac', '/official-astrobook', '/investors', '/credits', '/developer', '/admin', '/shared', '/dispatch', '/creator', '/', '/explore', '/start', '/my-chart', '/my-readings', '/my-astrobook', '/auth', '/instructions', '/pricing', '/checkout', '/my-masterbook', '/podcasts', '/dashboard', '/books', '/orders', '/blog', '/personal-context', '/workspaces', '/wonderings', '/shared/wonderings', '/chat', '/create', '/verify', '/relationships', '/p', '/about', '/counselors', '/workbook/companion', '/workbook/social-integration', '/retrogood', '/findings', '/results', '/our-charts', '/siblings', '/referrals', '/my-comic', '/shared-with-me', '/content-center', '/observation-log', '/observatory', '/reading-history', '/reset-password', '/investigations', '/museum', '/archive'];
export const isPublicPath = (p: string) => MEMBER_PAGES.some(x => p === x || (x !== '/' && p.startsWith(`${x}/`)));
