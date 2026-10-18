/** Pure validation for a printed AstroBook order, shared by the Books page and its tests. */

export type ShippingAddress = { name: string; line1: string; line2: string; city: string; state: string; postal_code: string; country: string };
export type BookOrderDraft = { userId?: string | null; coverReady: boolean; manuscriptReady: boolean; extras: string[]; address: ShippingAddress };

/** Returns an error message, or null when the order is ready to save and pay. */
export function validateBookOrder(d: BookOrderDraft): string | null {
  if (!d.userId) return 'Sign in and save your birth details before ordering.';
  if (!d.coverReady) return 'Choose a finished cover first.';
  if (!d.manuscriptReady) return 'Compose your manuscript first.';
  if (d.extras.some(s => !s.trim())) return 'Every extra section needs a topic, or remove the empty one.';
  const a = d.address;
  if (!a.name.trim() || !a.line1.trim() || !a.city.trim() || !a.state.trim() || !a.postal_code.trim()) return 'Fill in your full shipping address.';
  if (a.country !== 'US') return 'AstroBook currently ships within the United States only.';
  if (!/^\d{5}(-\d{4})?$/.test(a.postal_code.trim())) return 'Enter a valid US ZIP code.';
  if (a.state.trim().length !== 2) return 'Use the two-letter state code (e.g. CA).';
  return null;
}
