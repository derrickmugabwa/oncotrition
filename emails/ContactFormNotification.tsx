// Contact Form Notification Email Template

import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Heading,
} from '@react-email/components';

interface ContactFormNotificationProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export function ContactFormNotification({
  name,
  email,
  subject,
  message,
  submittedAt,
}: ContactFormNotificationProps) {
  const formattedDate = new Date(submittedAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>New Contact Form Submission</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              You have received a new message from the Oncotrition website contact form.
            </Text>

            <Hr style={hr} />

            <Section style={infoSection}>
              <Text style={label}>From:</Text>
              <Text style={value}>{name}</Text>
            </Section>

            <Section style={infoSection}>
              <Text style={label}>Email:</Text>
              <Text style={value}>{email}</Text>
            </Section>

            <Section style={infoSection}>
              <Text style={label}>Subject:</Text>
              <Text style={value}>{subject}</Text>
            </Section>

            <Section style={infoSection}>
              <Text style={label}>Message:</Text>
              <Text style={messageValue}>{message}</Text>
            </Section>

            <Hr style={hr} />

            <Text style={timestamp}>
              Submitted on: {formattedDate}
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification from the Oncotrition website contact form.
            </Text>
            <Text style={footerText}>
              Please respond directly to the sender at: {email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 40px',
  backgroundColor: '#10b981',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const content = {
  padding: '0 40px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525f7f',
  marginTop: '24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const infoSection = {
  marginBottom: '16px',
};

const label = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#32325d',
  margin: '0 0 4px 0',
};

const value = {
  fontSize: '16px',
  color: '#525f7f',
  margin: '0 0 16px 0',
};

const messageValue = {
  fontSize: '16px',
  color: '#525f7f',
  margin: '0 0 16px 0',
  whiteSpace: 'pre-wrap' as const,
  lineHeight: '24px',
};

const timestamp = {
  fontSize: '14px',
  color: '#8898aa',
  fontStyle: 'italic',
  marginTop: '16px',
};

const footer = {
  padding: '0 40px',
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#8898aa',
  lineHeight: '16px',
  margin: '4px 0',
};

export default ContactFormNotification;
