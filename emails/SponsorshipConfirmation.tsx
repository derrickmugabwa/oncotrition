import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface SponsorshipConfirmationEmailProps {
  companyName: string;
  contactPerson: string;
  tierName: string;
  amount: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  registrationId: string;
}

export const SponsorshipConfirmationEmail = ({
  companyName = 'Your Company',
  contactPerson = 'John Doe',
  tierName = 'Gold Sponsor',
  amount = 100000,
  eventTitle = 'Event Name',
  eventDate = '2026-12-01',
  eventTime = '10:00 AM',
  location = 'Event Location',
  registrationId = 'REG-123',
}: SponsorshipConfirmationEmailProps) => {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>
        Sponsorship Confirmation for {eventTitle} - {tierName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Sponsorship Confirmed!</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={paragraph}>Dear {contactPerson},</Text>
            
            <Text style={paragraph}>
              Thank you for partnering with us! We're thrilled to confirm your sponsorship
              for <strong>{eventTitle}</strong>.
            </Text>

            {/* Sponsorship Details */}
            <Section style={detailsBox}>
              <Heading style={h2}>Sponsorship Details</Heading>
              
              <Text style={detailItem}>
                <strong>Company:</strong> {companyName}
              </Text>
              
              <Text style={detailItem}>
                <strong>Sponsorship Tier:</strong> {tierName}
              </Text>
              
              <Text style={detailItem}>
                <strong>Amount Paid:</strong> KES {amount.toLocaleString()}
              </Text>
              
              <Text style={detailItem}>
                <strong>Registration ID:</strong> {registrationId}
              </Text>
            </Section>

            {/* Event Details */}
            <Section style={detailsBox}>
              <Heading style={h2}>Event Details</Heading>
              
              <Text style={detailItem}>
                <strong>Event:</strong> {eventTitle}
              </Text>
              
              <Text style={detailItem}>
                <strong>Date:</strong> {formattedDate}
              </Text>
              
              <Text style={detailItem}>
                <strong>Time:</strong> {eventTime}
              </Text>
              
              <Text style={detailItem}>
                <strong>Location:</strong> {location}
              </Text>
            </Section>

            {/* Next Steps */}
            <Section style={nextStepsBox}>
              <Heading style={h2}>Next Steps</Heading>
              
              <Text style={paragraph}>
                1. <strong>Contract Signing:</strong> Our team will reach out to you within 24-48 hours
                with the sponsorship contract for your review and signature.
              </Text>
              
              <Text style={paragraph}>
                2. <strong>Branding Materials:</strong> Please send us your company logo and any
                branding materials you'd like us to use for promotional purposes.
              </Text>
              
              <Text style={paragraph}>
                3. <strong>Event Coordination:</strong> We'll be in touch to coordinate booth setup,
                promotional activities, and any special requirements you may have.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Contact Information */}
            <Text style={paragraph}>
              If you have any questions or need assistance, please don't hesitate to contact us:
            </Text>
            
            <Text style={contactInfo}>
              Email: <Link href="mailto:info@oncotritionhc.com" style={link}>info@oncotritionhc.com</Link><br />
              Phone: +254 XXX XXX XXX
            </Text>

            <Text style={paragraph}>
              We're excited to have you as a partner and look forward to a successful event!
            </Text>

            <Text style={signature}>
              Best regards,<br />
              <strong>The Oncotrition Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Oncotrition Healthcare. All rights reserved.
            </Text>
            <Text style={footerText}>
              This email was sent to confirm your sponsorship registration.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SponsorshipConfirmationEmail;

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
  backgroundColor: '#009688',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const h2 = {
  color: '#009688',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const content = {
  padding: '0 24px',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  marginBottom: '16px',
};

const detailsBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const nextStepsBox = {
  backgroundColor: '#e8f5e9',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const detailItem = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const contactInfo = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '22px',
  marginBottom: '24px',
};

const link = {
  color: '#009688',
  textDecoration: 'underline',
};

const signature = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginTop: '32px',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e6ebf1',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};
