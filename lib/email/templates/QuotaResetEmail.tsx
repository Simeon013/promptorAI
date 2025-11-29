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

interface QuotaResetEmailProps {
  userName: string;
  plan: 'FREE' | 'STARTER' | 'PRO';
  newQuota: number;
  lastMonthUsage: number;
  dashboardUrl?: string;
}

export const QuotaResetEmail = ({
  userName = 'là',
  plan = 'FREE',
  newQuota = 10,
  lastMonthUsage = 8,
  dashboardUrl = 'http://localhost:3000/dashboard',
}: QuotaResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Votre quota mensuel a été réinitialisé 🔄</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>Promptor</Heading>
        </Section>

        <Section style={hero}>
          <div style={icon}>🔄</div>
          <Heading style={h1}>Quota réinitialisé !</Heading>
          <Text style={heroText}>
            Bonjour {userName}, votre quota mensuel a été réinitialisé avec succès.
          </Text>
        </Section>

        <Section style={section}>
          <div style={quotaBox}>
            <Text style={quotaLabel}>Nouveau quota disponible</Text>
            <Text style={quotaValue}>
              {newQuota === 999999 ? 'Illimité' : `${newQuota} prompts`}
            </Text>
          </div>
        </Section>

        <Section style={section}>
          <Heading style={h2}>📊 Mois dernier</Heading>
          <Text style={text}>
            Vous avez utilisé <strong>{lastMonthUsage}</strong> prompts le mois dernier.
            {lastMonthUsage >= (newQuota === 999999 ? 100 : newQuota * 0.8) && plan === 'FREE' && (
              <>
                {' '}
                Vous approchez de la limite ! Pensez à passer au plan{' '}
                <Link href="http://localhost:3000/pricing" style={link}>
                  Pro
                </Link>{' '}
                pour des prompts illimités.
              </>
            )}
          </Text>

          <Button style={button} href={dashboardUrl}>
            Voir mon dashboard
          </Button>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            © 2025 Promptor - Créez des prompts IA extraordinaires
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default QuotaResetEmail;

// Styles (réutilisés et simplifiés)
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
