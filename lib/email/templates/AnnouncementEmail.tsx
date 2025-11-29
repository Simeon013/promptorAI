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

interface AnnouncementEmailProps {
  title: string;
  subtitle: string;
  content: string;
  features?: {
    icon: string;
    title: string;
    description: string;
  }[];
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
}

export const AnnouncementEmail = ({
  title = 'Grandes nouveautés sur Promptor !',
  subtitle = 'Découvrez les dernières améliorations',
  content = 'Nous sommes ravis de vous annoncer de nouvelles fonctionnalités qui vont révolutionner votre expérience Promptor.',
  features = [
    {
      icon: '🚀',
      title: 'Performance améliorée',
      description: 'Génération de prompts 3x plus rapide',
    },
    {
      icon: '🎨',
      title: 'Nouvelle interface',
      description: 'Design moderne et intuitif',
    },
    {
      icon: '🤖',
      title: 'Nouveaux modèles IA',
      description: 'GPT-4, Claude 3, Gemini 2.0',
    },
  ],
  ctaText = 'Découvrir les nouveautés',
  ctaUrl = 'http://localhost:3000/dashboard',
  imageUrl,
}: AnnouncementEmailProps) => (
  <Html>
    <Head />
    <Preview>{title} - {subtitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={logo}>Promptor</Heading>
          <Text style={headerBadge}>🎉 NOUVEAUTÉ</Text>
        </Section>

        {/* Hero */}
        <Section style={hero}>
          <Heading style={h1}>{title}</Heading>
          <Text style={heroText}>{subtitle}</Text>
        </Section>

        {/* Image (optional) */}
        {imageUrl && (
          <Section style={imageSection}>
            <img
              src={imageUrl}
              alt={title}
              style={image}
            />
          </Section>
        )}

        {/* Content */}
        <Section style={section}>
          <Text style={text}>{content}</Text>
        </Section>

        {/* Features */}
        {features && features.length > 0 && (
          <Section style={section}>
            <Heading style={h2}>✨ Ce qui change</Heading>
            {features.map((feature, index) => (
              <div key={index} style={featureBox}>
                <div style={featureIcon}>{feature.icon}</div>
                <div style={featureContent}>
                  <Heading style={featureTitle}>{feature.title}</Heading>
                  <Text style={featureDescription}>{feature.description}</Text>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* CTA */}
        {ctaText && ctaUrl && (
          <Section style={section}>
            <Button style={button} href={ctaUrl}>
              {ctaText}
            </Button>
          </Section>
        )}

        {/* Quote */}
        <Section style={quoteSection}>
          <Text style={quoteText}>
            "Nous sommes constamment à l'écoute de vos retours pour améliorer Promptor.
            Ces nouvelles fonctionnalités sont le fruit de vos suggestions."
          </Text>
          <Text style={quoteAuthor}>— L'équipe Promptor</Text>
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

export default AnnouncementEmail;

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

const headerBadge = {
  color: '#ffffff',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  margin: '0',
  padding: '6px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '4px',
  display: 'inline-block',
};

const hero = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

const heroText = {
  color: '#6b7280',
  fontSize: '20px',
  lineHeight: '28px',
  margin: '0',
};

const h2 = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
};

const imageSection = {
  padding: '0',
};

const image = {
  width: '100%',
  maxWidth: '600px',
  height: 'auto',
  display: 'block',
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

const featureBox = {
  display: 'flex',
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const featureIcon = {
  fontSize: '32px',
  marginRight: '16px',
  flexShrink: 0,
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const featureContent = {
  flex: 1,
};

const featureTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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

const quoteSection = {
  padding: '24px 20px',
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #7c3aed',
};

const quoteText = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px',
  fontStyle: 'italic' as const,
};

const quoteAuthor = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0',
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
