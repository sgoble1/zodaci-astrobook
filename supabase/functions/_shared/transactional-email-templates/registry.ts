import type { ComponentType } from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome.tsx'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as contactReceived } from './contact-received.tsx'
import { template as contactOwnerNotice } from './contact-owner-notice.tsx'
import { template as newsletterConfirm } from './newsletter-confirm.tsx'
import { template as bookShipped } from './book-shipped.tsx'
import { template as bookGift } from './book-gift.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-received': contactReceived,
  'contact-owner-notice': contactOwnerNotice,
  'newsletter-confirm': newsletterConfirm,
  'book-shipped': bookShipped,
  'book-gift': bookGift,
  // Add templates here as they are created, e.g.:
  // 'welcome': welcomeTemplate,
}
