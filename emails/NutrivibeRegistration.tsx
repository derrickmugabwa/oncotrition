// NutriVibe Registration Confirmation Email Template

import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Hr,
  Link,
  Heading,
} from '@react-email/components';

interface NutrivibeRegistrationEmailProps {
  fullName: string;
  registrationId: string;
  qrCodeUrl: string;
  eventDetails: {
    event_date: string;
    event_time: string;
    location: string;
    venue_details: string | null;
  };
  participationType: string;
  amount: number;
}

export function NutrivibeRegistrationEmail({
  fullName,
  registrationId,
  qrCodeUrl,
  eventDetails,
  participationType,
  amount,
}: NutrivibeRegistrationEmailProps) {
  const formattedDate = new Date(eventDetails.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const participationTypeLabels: { [key: string]: string } = {
    nutrition_student: 'Nutrition Student',
    professional: 'Nutrition/Dietician/Nutritionist',
    healthcare_professional: 'Healthcare Professional/Allied Guest',
    institutional_representative: 'Institutional Representative/Partner/Sponsor',
    online_attendee: 'Online Attendee',
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://oncotrition.com/logo.png"
              width="150"
              height="auto"
              alt="Oncotrition"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to NutriVibe! 🎉</Heading>
            
            <Text style={text}>Dear {fullName},</Text>
            
            <Text style={text}>
              Thank you for registering for <strong>The NutriVibe Session</strong>! We're excited to have you join us for this networking and professional development event.
            </Text>

            {/* Event Details Box */}
            <Section style={eventBox}>
              <Heading style={h2}>Event Details</Heading>
              <Text style={eventDetail}>
                <strong>Date:</strong> {formattedDate}
              </Text>
              <Text style={eventDetail}>
                <strong>Time:</strong> {eventDetails.event_time}
              </Text>
              <Text style={eventDetail}>
                <strong>Location:</strong> {eventDetails.location}
              </Text>
              {eventDetails.venue_details && (
                <Text style={eventDetail}>
                  <strong>Venue:</strong> {eventDetails.venue_details}
                </Text>
              )}
            </Section>

            {/* Registration Details */}
            <Section style={registrationBox}>
              <Heading style={h2}>Your Registration</Heading>
              <Text style={eventDetail}>
                <strong>Registration ID:</strong> {registrationId}
              </Text>
              <Text style={eventDetail}>
                <strong>Participation Type:</strong> {participationTypeLabels[participationType] || participationType}
              </Text>
              <Text style={eventDetail}>
                <strong>Amount Paid:</strong> KES {amount.toLocaleString()}
              </Text>
            </Section>

            {/* QR Code Section */}
            <Section style={qrSection}>
              <Heading style={h2}>Your Entry QR Code</Heading>
              <Text style={text}>
                Please present this QR code at the event entrance for check-in:
              </Text>
              <Img
                src={qrCodeUrl}
                width="300"
                height="300"
                alt="Registration QR Code"
                style={qrCode}
              />
              <Text style={smallText}>
                Save this email or take a screenshot of the QR code for easy access at the event.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Important Information */}
            <Section>
              <Heading style={h2}>Important Information</Heading>
              <Text style={text}>
                • Please arrive 15 minutes before the event starts for registration<br />
                • Bring a valid ID for verification<br />
                • The QR code is unique to your registration and should not be shared<br />
                • For any questions, contact us at nitrivibe@oncotritionhc.com or info@oncotritionhc.com
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={text}>
              We look forward to seeing you at NutriVibe!
            </Text>
            
            <Text style={signature}>
              Best regards,<br />
              <strong>The Oncotrition Team</strong>
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Oncotrition | Nutrition & Wellness Innovation<br />
              <Link href="https://oncotritionhc.com" style={link}>
                www.oncotritionhc.com
              </Link>
              {' | '}
              <Link href="mailto:nutrivibe@oncotritionhc.com" style={link}>
                nutrivibe@oncotritionhc.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NutrivibeRegistrationEmail;

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
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#009688',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#009688',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const eventBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #009688',
};

const registrationBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #0ea5e9',
};

const eventDetail = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const qrSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const qrCode = {
  margin: '20px auto',
  border: '4px solid #009688',
  borderRadius: '8px',
  padding: '16px',
  backgroundColor: '#ffffff',
};

const smallText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '32px 0 0',
};

const link = {
  color: '#009688',
  textDecoration: 'underline',
};
