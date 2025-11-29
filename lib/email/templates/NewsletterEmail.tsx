import {
  Body,
  Button,
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

interface NewsletterEmailProps {
  title: string;
  content: {
    heading: string;
    text: string;
    link?: {
      url: string;
      label: string;
    };
  }[];
  ctaText?: string;
  ctaUrl?: string;
}

export const NewsletterEmail = ({
  title = 'Newsletter Promptor - Nouveautés du mois',
  content = [
    {
      heading: '🚀 Nouvelle fonctionnalité',
      text: 'Découvrez notre dernière innovation...',
    },
  ],
  ctaText = 'Découvrir les nouveautés',
  ctaUrl = 'http://localhost:3000/dashboard',
}: NewsletterEmailProps) => (
  <Html>
    <Head />
    <Preview>{title}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={logo}>Promptor</Heading>
          <Text style={headerSubtitle}>Newsletter</Text>
        </Section>

        {/* Hero */}
        <Section style={hero}>
          <Heading style={h1}>{title}</Heading>
        </Section>

        {/* Content Sections */}
        {content.map((section, index) => (
          <Section key={index} style={sectionStyle}>
            <Heading style={h2}>{section.heading}</Heading>
            <Text style={text}>{section.text}</Text>
            {section.link && (
              <Link href={section.link.url} style={link}>
                {section.link.label} →
              </Link>
            )}
          </Section>
        ))}

        {/* CTA */}
        {ctaText && ctaUrl && (
          <Section style={sectionStyle}>
            <Button style={button} href={ctaUrl}>
              {ctaText}
            </Button>
          </Section>
        )}

        {/* Social */}
        <Section style={social}>
          <Text style={socialText}>Suivez-nous</Text>
          <div style={socialLinks}>
            <Link href="https://twitter.com/promptor" style={socialLink}>
              Twitter
            </Link>
            {' · '}
            <Link href="https://linkedin.com/company/promptor" style={socialLink}>
              LinkedIn
            </Link>
          </div>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            © 2025 Promptor - Créez des prompts IA extraordinaires
          </Text>
          <Text style={footerText}>
            <Link href="http://localhost:3000" style={footerLink}>
              Accueil
            </Link>
            {' · '}
            <Link href="http://localhost:3000/dashboard" style={footerLink}>
              Dashboard
            </Link>
            {' · '}
            <Link href="{{unsubscribe_url}}" style={footerLink}>
              Se désabonner
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewsletterEmail;

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
  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
};

const logo = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  margin: '0',
};

const hero = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

const h2 = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

const sectionStyle = {
  padding: '24px 20px',
  borderBottom: '1px solid #e5e7eb',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const link = {
  color: '#7c3aed',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px auto',
  maxWidth: '300px',
};

const social = {
  padding: '24px 20px',
  textAlign: 'center' as const,
};

const socialText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 12px',
};

const socialLinks = {
  textAlign: 'center' as const,
};

const socialLink = {
  color: '#7c3aed',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
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
