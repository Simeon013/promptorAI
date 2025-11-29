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

interface ReEngagementEmailProps {
  userName: string;
  lastActivityDate: string; // e.g., "15 novembre 2025"
  promptCount: number; // Nombre de prompts créés
  dashboardUrl?: string;
}

export const ReEngagementEmail = ({
  userName = 'là',
  lastActivityDate = 'il y a 30 jours',
  promptCount = 5,
  dashboardUrl = 'http://localhost:3000/dashboard',
}: ReEngagementEmailProps) => (
  <Html>
    <Head />
    <Preview>On vous a manqué ! Revenez créer des prompts IA 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={logo}>Promptor</Heading>
        </Section>

        {/* Hero */}
        <Section style={hero}>
          <div style={icon}>👋</div>
          <Heading style={h1}>Vous nous manquez {userName} !</Heading>
          <Text style={heroText}>
            Votre dernière visite remonte à {lastActivityDate}.
          </Text>
        </Section>

        {/* Stats */}
        <Section style={section}>
          <div style={statsBox}>
            <Text style={statsLabel}>Vous avez créé</Text>
            <Text style={statsValue}>{promptCount} prompts</Text>
            <Text style={statsHint}>avec Promptor</Text>
          </div>
        </Section>

        {/* What's New */}
        <Section style={section}>
          <Heading style={h2}>🎉 Nouveautés depuis votre départ</Heading>
          <ul style={list}>
            <li style={listItem}>
              <strong>Nouveaux modèles IA</strong> - Gemini 2.0, GPT-4, Claude 3
            </li>
            <li style={listItem}>
              <strong>Suggestions intelligentes</strong> - IA contextuelle
            </li>
            <li style={listItem}>
              <strong>Historique amélioré</strong> - Recherche et filtres
            </li>
            <li style={listItem}>
              <strong>Mode multilingue</strong> - 13 langues disponibles
            </li>
          </ul>
        </Section>

        {/* CTA */}
        <Section style={section}>
          <Button style={button} href={dashboardUrl}>
            Retourner sur Promptor
          </Button>
        </Section>

        {/* Inspiration */}
        <Section style={inspirationSection}>
          <Heading style={h2}>💡 Besoin d'inspiration ?</Heading>
          <Text style={text}>
            Voici quelques idées de prompts à créer :
          </Text>
          <div style={exampleBox}>
            <Text style={exampleText}>
              ✏️ "Créer un plan marketing pour lancer un produit SaaS"
            </Text>
            <Text style={exampleText}>
              🎨 "Générer des idées de logos pour une startup tech"
            </Text>
            <Text style={exampleText}>
              📧 "Rédiger un email de bienvenue engageant"
            </Text>
          </div>
        </Section>

        {/* Support */}
        <Section style={section}>
          <Heading style={h2}>💬 Besoin d'aide ?</Heading>
          <Text style={text}>
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous avez
            des questions ou des suggestions.
          </Text>
          <Link href="http://localhost:3000/contact" style={link}>
            Nous contacter
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
            <Link href={dashboardUrl} style={footerLink}>
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

export default ReEngagementEmail;

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

const statsBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  border: '1px solid #dbeafe',
};

const statsLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const statsValue = {
  color: '#3b82f6',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0',
};

const statsHint = {
  color: '#9ca3af',
  fontSize: '14px',
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
  marginBottom: '12px',
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

const inspirationSection = {
  padding: '24px 20px',
  backgroundColor: '#f9fafb',
};

const exampleBox = {
  margin: '16px 0',
};

const exampleText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
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
