import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Cta, Layout, P } from './layout.tsx'
type Props = { recipientName?: string; senderName?: string; edition?: string; digital?: boolean; message?: string; claimUrl?: string }
const Email = ({ recipientName, senderName, edition, digital, message, claimUrl }: Props) => (
  <Layout preview={`${senderName || 'Someone'} gave you an AstroBook`} title={`${recipientName ? `${recipientName}, ` : ''}a book about your sky`}>
    <P>{senderName || 'Someone'} has given you an AstroBook{edition ? ` (${edition})` : ''}, written from your own birth chart.</P>
    {message ? <P>Their note: “{message}”</P> : null}
    {claimUrl && /^https:\/\/zodaci\.com\/gift\/[a-f0-9]{64}$/.test(claimUrl)
      ? <><P>Sign in with this email address to claim your gift and review your birth details{digital ? '.' : ' and shipping address.'} Your details stay separate from the sender’s profile. You will not be asked to pay.</P><Cta href={claimUrl}>Claim my AstroBook</Cta></>
      : digital
      ? <><P>Sign in to Zodaci with this email address to download your PDF.</P><Cta href="https://zodaci.com/orders#gifts">Open my gift</Cta></>
      : <><P>Your printed copy is being made and will arrive at the address they gave. You will not be asked to pay anything.</P><Cta href="https://zodaci.com/astrobook">See what is inside an AstroBook</Cta></>}
  </Layout>
)
export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `${d.senderName || 'Someone'} gave you an AstroBook`,
  displayName: 'AstroBook gift notice',
  previewData: { recipientName: 'Jo', senderName: 'Sam', edition: 'Classic', digital: false, message: 'Happy birthday.' },
} satisfies TemplateEntry
