import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  userName = 'là',
  dashboardUrl = 'http://localhost:3000/dashboard',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue sur Promptor - Créez des prompts IA extraordinaires 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header avec logo */}
        <Section style={header}>
          <Heading style={logo}>Promptor</Heading>
        </Section>

        {/* Hero Section */}
        <Section style={hero}>
          <Heading style={h1}>Bienvenue {userName} ! 🎉</Heading>
          <Text style={text}>
            Nous sommes ravis de vous accueillir dans la communauté Promptor. Vous êtes maintenant
            prêt à transformer vos idées en prompts IA professionnels.
          </Text>
        </Section>

        {/* Quick Start */}
        <Section style={section}>
          <Heading style={h2}>🚀 Premiers pas</Heading>
          <Text style={text}>Voici comment démarrer :</Text>

          <div style={stepContainer}>
            <div style={step}>
              <Text style={stepNumber}>1</Text>
              <Text style={stepText}>
                <strong>Accédez à votre dashboard</strong>
                <br />
                Consultez vos statistiques et quota gratuit (10 prompts/mois)
              </Text>
            </div>

            <div style={step}>
              <Text style={stepNumber}>2</Text>
              <Text style={stepText}>
                <strong>Créez votre premier prompt</strong>
                <br />
                Décrivez simplement votre idée, notre IA fait le reste
              </Text>
            </div>

            <div style={step}>
              <Text style={stepNumber}>3</Text>
              <Text style={stepText}>
                <strong>Utilisez-le avec ChatGPT, Claude, Midjourney</strong>
                <br />
                Copiez-collez votre prompt optimisé dans votre outil favori
              </Text>
            </div>
          </div>

          <Button style={button} href={dashboardUrl}>
            Accéder au Dashboard
          </Button>
        </Section>

        {/* Features */}
        <Section style={section}>
          <Heading style={h2}>✨ Ce que vous pouvez faire</Heading>
          <ul style={list}>
            <li style={listItem}>
              <strong>Générer des prompts</strong> - Transformez vos idées en prompts structurés
            </li>
            <li style={listItem}>
              <strong>Améliorer vos prompts</strong> - Optimisez vos prompts existants
            </li>
            <li style={listItem}>
              <strong>Multilingue</strong> - Créez des prompts en 13 langues différentes
            </li>
            <li style={listItem}>
              <strong>Historique</strong> - Retrouvez tous vos prompts en un clic
            </li>
          </ul>
        </Section>

        {/* Support */}
        <Section style={section}>
          <Heading style={h2}>💬 Besoin d'aide ?</Heading>
          <Text style={text}>
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous avez des
            questions.
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
            <Link href="http://localhost:3000/pricing" style={footerLink}>
              Tarifs
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

export default WelcomeEmail;

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

const section = {
  padding: '24px 20px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const stepContainer = {
  margin: '24px 0',
};

const step = {
  display: 'flex' as const,
  marginBottom: '16px',
};

const stepNumber = {
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  lineHeight: '32px',
  textAlign: 'center' as const,
  fontWeight: 'bold',
  fontSize: '16px',
  marginRight: '16px',
  flexShrink: 0,
};

const stepText = {
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
  margin: '24px 0',
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
