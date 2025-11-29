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

interface PromotionEmailProps {
  userName?: string;
  title: string;
  subtitle: string;
  discount: string; // e.g., "-50%", "29€ → 14.50€"
  description: string;
  expiryDate: string; // e.g., "31 décembre 2025"
  ctaText: string;
  ctaUrl: string;
  promoCode?: string;
}

export const PromotionEmail = ({
  userName,
  title = 'Offre exceptionnelle !',
  subtitle = 'Profitez de -50% sur tous nos plans',
  discount = '-50%',
  description = 'Pour une durée limitée, bénéficiez de 50% de réduction sur tous nos plans payants. Une occasion unique de booster votre productivité avec Promptor.',
  expiryDate = '31 décembre 2025',
  ctaText = 'Profiter de l\'offre',
  ctaUrl = 'http://localhost:3000/pricing',
  promoCode,
}: PromotionEmailProps) => (
  <Html>
    <Head />
    <Preview>{title} - {subtitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={logo}>Promptor</Heading>
        </Section>

        {/* Hero Promo Badge */}
        <Section style={hero}>
          <div style={promoBadge}>{discount}</div>
          <Heading style={h1}>{title}</Heading>
          <Text style={heroText}>{subtitle}</Text>
        </Section>

        {/* Content */}
        <Section style={section}>
          {userName && (
            <Text style={text}>
              Bonjour {userName},
            </Text>
          )}
          <Text style={text}>{description}</Text>
        </Section>

        {/* Promo Code (if provided) */}
        {promoCode && (
          <Section style={section}>
            <div style={promoCodeBox}>
              <Text style={promoCodeLabel}>Code promo</Text>
              <Text style={promoCodeValue}>{promoCode}</Text>
              <Text style={promoCodeHint}>À copier lors du paiement</Text>
            </div>
          </Section>
        )}

        {/* CTA */}
        <Section style={section}>
          <Button style={button} href={ctaUrl}>
            {ctaText}
          </Button>
        </Section>

        {/* Urgency */}
        <Section style={urgencySection}>
          <Text style={urgencyText}>
            ⏰ Offre valable jusqu'au <strong>{expiryDate}</strong>
          </Text>
        </Section>

        {/* Benefits */}
        <Section style={section}>
          <Heading style={h2}>✨ Ce qui est inclus</Heading>
          <ul style={list}>
            <li style={listItem}>Prompts illimités (plan Pro)</li>
            <li style={listItem}>Accès à tous les modèles IA</li>
            <li style={listItem}>Historique complet</li>
            <li style={listItem}>Support prioritaire</li>
          </ul>
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
            <Link href="http://localhost:3000/pricing" style={footerLink}>
              Tarifs
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

export default PromotionEmail;

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
  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
};

const promoBadge = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  fontSize: '48px',
  fontWeight: 'bold',
  padding: '24px 48px',
  borderRadius: '12px',
  display: 'inline-block',
  margin: '0 0 24px',
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  padding: '0',
};

const heroText = {
  color: '#6b7280',
  fontSize: '20px',
  lineHeight: '28px',
  margin: '0',
  fontWeight: '600',
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

const promoCodeBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  border: '2px dashed #7c3aed',
  margin: '0 auto',
  maxWidth: '300px',
};

const promoCodeLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  fontWeight: '600',
};

const promoCodeValue = {
  color: '#7c3aed',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  fontFamily: 'monospace',
  letterSpacing: '2px',
};

const promoCodeHint = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '8px 0 0',
};

const button = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  margin: '24px auto',
  maxWidth: '300px',
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
};

const urgencySection = {
  padding: '16px 20px',
  backgroundColor: '#fef3c7',
  textAlign: 'center' as const,
};

const urgencyText = {
  color: '#92400e',
  fontSize: '16px',
  margin: '0',
  fontWeight: '600',
};

const list = {
  margin: '0 0 16px',
  padding: '0 0 0 20px',
};

const listItem = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '8px',
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
