import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Cta, Layout, P } from './layout.tsx'
const Email = ({ confirmUrl }: { confirmUrl?: string }) => (
  <Layout preview="Confirm your Sky Notes signup" title="Confirm your Sky Notes signup">
    <P>Someone asked to send Sky Notes to this address. If that was you, confirm below. If not, ignore this email and nothing will be sent.</P>
    <Cta href={confirmUrl ?? 'https://zodaci.com'}>Confirm my signup</Cta>
  </Layout>
)
export const template = { component: Email, subject: 'Confirm your Sky Notes signup', displayName: 'Sky Notes confirmation', previewData: { confirmUrl: 'https://zodaci.com/newsletter/confirm?token=example' } } satisfies TemplateEntry
