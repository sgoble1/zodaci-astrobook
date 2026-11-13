import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Layout, P } from './layout.tsx'
type Props = { name?: string; email?: string; topic?: string; message?: string }
const Email = ({ name, email, topic, message }: Props) => (
  <Layout preview={`New message from ${name ?? 'a visitor'}`} title="New contact message">
    <P>From: {name ?? 'Unknown'} ({email ?? 'no email'})</P>
    <P>Topic: {topic ?? 'General'}</P>
    <P>{message ?? ''}</P>
  </Layout>
)
export const template = { component: Email, subject: (d: Record<string, any>) => `Contact: ${d.topic ?? 'message'} from ${d.name ?? 'visitor'}`, displayName: 'Contact message (to Zodaci)', previewData: { name: 'Jane', email: 'jane@example.com', topic: 'Books', message: 'Hello!' } } satisfies TemplateEntry
