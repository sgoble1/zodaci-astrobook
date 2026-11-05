/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Click
          the button below to choose a new password.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Libre Franklin, Arial, sans-serif' }
const container = { padding: '32px 25px', maxWidth: '560px', borderTop: '4px solid #E23B44' }
const h1 = {
  fontFamily: 'Alfa Slab One, Rockwell, Georgia, serif',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1E1E5A',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#484650',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: '#FFC61A',
  color: '#1E1E5A',
  fontSize: '14px',
  border: '1px solid #1E1E5A',
  borderRadius: '6px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#64616a', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #FFC61A !important; color: #1E1E5A !important; }
  }
  [data-ogsc] .dm-btn { background-color: #FFC61A !important; color: #1E1E5A !important; }
  [data-ogsb] .dm-btn { background-color: #FFC61A !important; color: #1E1E5A !important; }
`
