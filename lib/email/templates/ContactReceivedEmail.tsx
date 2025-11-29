import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ContactReceivedEmailProps {
  userName: string;
  subject: string;
  message: string;
}

export const ContactReceivedEmail = ({
  userName = 'là',
  subject = 'Demande de support',
  message = 'Votre message...',
}: ContactReceivedEmailProps) => (
  <Html>
    <Head />
    <Preview>Nous avons bien reçu votre message 📧</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>Promptor</Heading>
        </Section>

        <Section style={hero}>
          <div style={icon}>✅</div>
          <Heading style={h1}>Message bien reçu !</Heading>
          <Text style={heroText}>
            Bonjour {userName}, merci de nous avoir contactés.
          </Text>
        </Section>

        <Section style={section}>
          <Text style={text}>
            Nous avons bien reçu votre message concernant :{' '}
            <strong>{subject}</strong>
          </Text>

          <div style={messageBox}>
            <Text style={messageLabel}>Votre message :</Text>
            <Text style={messageContent}>&quot;{message}&quot;</Text>
          </div>

          <Text style={text}>
            Notre équipe vous répondra dans les plus brefs délais, généralement sous 24h.
          </Text>
        </Section>

        <Section style={section}>
          <Heading style={h2}>💬 En attendant</Heading>
          <Text style={text}>
            Vous pouvez consulter notre{' '}
            <Link href="http://localhost:3000/#faq" style={link}>
              FAQ
            </Link>
            , elle répond peut-être déjà à votre question.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            © 2025 Promptor - Créez des prompts IA extraordinaires
          </Text>
          <Text style={footerText}>
            <Link href="http://localhost:3000" style={footerLink}>
              Accueil
            </Link>
            {' · '}
            <Link href="http://localhost:3000/#faq" style={footerLink}>
              FAQ
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ContactReceivedEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#7c3aed',
};

const logo = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const hero = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const icon = {
  fontSize: '48px',
  marginBottom: '16px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

const heroText = {
  color: '#6b7280',
  fontSize: '18px',
  lineHeight: '24px',
  margin: '0',
};

const h2 = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

const section = {
  padding: '24px 20px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const messageBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid #e5e7eb',
  margin: '16px 0',
};

const messageLabel = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0 0 8px',
  fontWeight: '600',
};

const messageContent = {
  color: '#1f2937',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  fontStyle: 'italic' as const,
};

const link = {
  color: '#7c3aed',
  textDecoration: 'underline',
  fontSize: '16px',
};

const footer = {
  padding: '24px 20px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const footerLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
  fontSize: '14px',
};
