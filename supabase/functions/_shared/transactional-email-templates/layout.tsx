import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'

export const Layout = ({ preview, title, children }: { preview: string; title: string; children: React.ReactNode }) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', margin: 0 }}>
      <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '24px' }}>
        <Section style={{ backgroundColor: '#1E1E5A', padding: '18px 24px', borderBottom: '4px solid #FFC61A' }}>
          <Text style={{ color: '#EFE3C8', fontSize: '22px', letterSpacing: '3px', margin: 0, fontWeight: 'bold' }}>ZODACI</Text>
          <Text style={{ color: '#FFC61A', fontSize: '11px', letterSpacing: '2px', margin: '4px 0 0' }}>ASTRAL RESEARCH AUTHORITY</Text>
        </Section>
        <Section style={{ backgroundColor: '#EFE3C8', padding: '24px' }}>
          <Heading style={{ color: '#1E1E5A', fontSize: '22px', margin: '0 0 12px' }}>{title}</Heading>
          {children}
        </Section>
        <Hr style={{ borderColor: '#EFE3C8' }} />
        <Text style={{ color: '#6b6b80', fontSize: '12px' }}>Zodaci · zodaci.com · Questions? Write to support@zodaci.com</Text>
      </Container>
    </Body>
  </Html>
)
export const P = ({ children }: { children: React.ReactNode }) => <Text style={{ color: '#2a2a3a', fontSize: '15px', lineHeight: '24px', margin: '0 0 12px' }}>{children}</Text>
export const Cta = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Button href={href} style={{ backgroundColor: '#E23B44', color: '#ffffff', padding: '12px 20px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none' }}>{children}</Button>
)
