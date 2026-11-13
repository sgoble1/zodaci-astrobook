import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Cta, Layout, P } from './layout.tsx'
type Props = { trackingUrl?: string; trackingId?: string; carrier?: string; ordersUrl?: string }
const Email = ({ trackingUrl, trackingId, carrier, ordersUrl }: Props) => (
  <Layout preview="Your Zodaci order has shipped" title="Your order is on its way">
    <P>Your printed order has left the printer{carrier ? ` with ${carrier}` : ''}.</P>
    {trackingId ? <P>Tracking number: {trackingId}</P> : null}
    <Cta href={trackingUrl ?? ordersUrl ?? 'https://zodaci.com/orders'}>{trackingUrl ? 'Track my package' : 'See my orders'}</Cta>
  </Layout>
)
export const template = { component: Email, subject: 'Your Zodaci order has shipped', displayName: 'Order shipped', previewData: { trackingUrl: 'https://example.com/track', trackingId: '1Z999', carrier: 'UPS', ordersUrl: 'https://zodaci.com/orders' } } satisfies TemplateEntry
