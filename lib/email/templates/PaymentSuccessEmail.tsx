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

interface PaymentSuccessEmailProps {
  userName: string;
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  amount: string;
  quota: number;
  dashboardUrl?: string;
}

const planDetails = {
  STARTER: {
    name: 'Starter',
    color: '#06b6d4',
    features: [
      '100 prompts par mois',
      'Historique 30 jours',
      'Support prioritaire',
      'Accès API',
    ],
  },
  PRO: {
    name: 'Pro',
    color: '#8b5cf6',
    features: [
      'Prompts illimités',
      'Tous les modèles IA',
      '5 espaces de travail',
      'Support VIP',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    color: '#ec4899',
    features: [
      'Tout illimité',
      'Modèles IA personnalisés',
      'SSO',
      'Support dédié',
    ],
  },
};

export const PaymentSuccessEmail = ({
  userName = 'là',
  plan = 'PRO',
  amount = '29€',
  quota = 999999,
  dashboardUrl = 'http://localhost:3000/dashboard',
}: PaymentSuccessEmailProps) => {
  const planInfo = planDetails[plan];

  return (
    <Html>
      <Head />
      <Preview>Paiement confirmé - Votre plan {planInfo.name} est activé ! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Promptor</Heading>
          </Section>

          {/* Success Hero */}
          <Section style={hero}>
            <div style={successBadge}>✓</div>
            <Heading style={h1}>Paiement réussi !</Heading>
            <Text style={heroText}>
              Merci {userName}, votre abonnement <strong style={{ color: planInfo.color }}>{planInfo.name}</strong> est maintenant actif.
            </Text>
          </Section>

          {/* Payment Details */}
          <Section style={section}>
            <div style={paymentBox}>
              <Text style={paymentLabel}>Montant payé</Text>
              <Text style={paymentAmount}>{amount}</Text>
              <Text style={paymentPlan}>Plan {planInfo.name}</Text>
            </div>
          </Section>

          {/* Plan Features */}
          <Section style={section}>
            <Heading style={h2}>✨ Ce qui est inclus dans votre plan</Heading>
            <ul style={list}>
              {planInfo.features.map((feature, index) => (
                <li key={index} style={listItem}>
                  <span style={{ color: planInfo.color, marginRight: '8px' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </Section>

          {/* Quota Info */}
          <Section style={section}>
            <div style={quotaBox}>
              <Text style={quotaLabel}>Votre quota mensuel</Text>
              <Text style={quotaValue}>
                {quota === 999999 ? 'Illimité' : `${quota} prompts`}
              </Text>
              <Text style={quotaReset}>Réinitialisé chaque 1er du mois</Text>
            </div>
          </Section>

          {/* CTA */}
          <Section style={section}>
            <Button style={button} href={dashboardUrl}>
              Accéder au Dashboard
            </Button>
          </Section>

          {/* Invoice */}
          <Section style={section}>
            <Text style={text}>
              Une facture détaillée a été envoyée à votre adresse email. Vous pouvez également la retrouver dans votre{' '}
              <Link href={`${dashboardUrl}/subscription`} style={link}>
                espace d'abonnement
              </Link>
              .
            </Text>
          </Section>

          {/* Support */}
          <Section style={section}>
            <Heading style={h2}>💬 Questions ?</Heading>
            <Text style={text}>
              Notre équipe est là pour vous aider à tirer le meilleur parti de votre abonnement.
            </Text>
            <Link href="http://localhost:3000/contact" style={link}>
              Contacter le support
            </Link>
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
              <Link href={`${dashboardUrl}/subscription`} style={footerLink}>
                Gérer mon abonnement
              </Link>
              {' · '}
              <Link href="http://localhost:3000/contact" style={footerLink}>
                Contact
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentSuccessEmail;

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

const successBadge = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  borderRadius: '50%',
  width: '64px',
  height: '64px',
  lineHeight: '64px',
  fontSize: '40px',
  margin: '0 auto 24px',
  display: 'inline-block',
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

const paymentBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  border: '1px solid #e5e7eb',
};

const paymentLabel = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const paymentAmount = {
  color: '#1f2937',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0',
};

const paymentPlan = {
  color: '#7c3aed',
  fontSize: '16px',
  fontWeight: '600',
  margin: '8px 0 0',
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

const quotaBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  border: '1px solid #dbeafe',
};

const quotaLabel = {
  color: '#3b82f6',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  fontWeight: '600',
};

const quotaValue = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
};

const quotaReset = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0 0',
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
  margin: '24px 0',
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
