import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Cta, Layout, P } from './layout.tsx'
const Email = ({ name }: { name?: string }) => (
  <Layout preview="We got your message" title="We got your message">
    <P>{name ? `Hi ${name},` : 'Hi there,'}</P>
    <P>Thanks for writing to Zodaci. A real person reads every message, and we usually reply within two working days.</P>
    <Cta href="https://zodaci.com">Back to Zodaci</Cta>
  </Layout>
)
export const template = { component: Email, subject: 'We got your message', displayName: 'Contact form confirmation', previewData: { name: 'Jane' } } satisfies TemplateEntry
