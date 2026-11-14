import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Cta, Layout, P } from './layout.tsx'
type Props = { recipientName?: string; senderName?: string; edition?: string; digital?: boolean; message?: string }
const Email = ({ recipientName, senderName, edition, digital, message }: Props) => (
  <Layout preview={`${senderName || 'Someone'} gave you an AstroBook`} title={`${recipientName ? `${recipientName}, ` : ''}a book about your sky`}>
    <P>{senderName || 'Someone'} has given you an AstroBook{edition ? ` (${edition})` : ''}, written from your own birth chart.</P>
    {message ? <P>Their note: “{message}”</P> : null}
    {digital
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
