# Contact Form Email Notification Setup

This document explains how to set up email notifications for the contact form submissions.

## Overview

When someone submits the contact form on your website, the system will:
1. Save the submission to the Supabase database (`form_submissions` table)
2. Send an email notification to `info@oncotritionhc.com` with the submission details
3. Allow direct reply to the sender's email address

## Setup Instructions

### 1. Create a Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2. Add and Verify Your Domain

1. In the Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `oncotritionhc.com`
4. Follow the DNS verification steps:
   - Add the provided DNS records to your domain registrar
   - Wait for DNS propagation (can take up to 48 hours)
   - Click **Verify** in Resend dashboard

### 3. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Oncotrition Contact Form")
4. Select permissions: **Sending access**
5. Copy the API key (starts with `re_`)

### 4. Add Environment Variable

Add the following to your `.env.local` file:

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

**Important:** Never commit this file to version control!

### 5. Update Email Sender (if needed)

If you want to use a different sender email, edit the API route:

File: `app/api/contact/submit/route.ts`

```typescript
from: 'Oncotrition Contact Form <noreply@oncotritionhc.com>',
```

Change `noreply@oncotritionhc.com` to your preferred sender address.

### 6. Update Recipient Email (if needed)

To change where notifications are sent, edit:

File: `app/api/contact/submit/route.ts`

```typescript
to: ['info@oncotritionhc.com'],
```

You can add multiple recipients:

```typescript
to: ['info@oncotritionhc.com', 'support@oncotritionhc.com'],
```

## Testing

### Before Domain Verification

While your domain is being verified, you can test with Resend's test email:

1. Change the `from` address to: `onboarding@resend.dev`
2. Submit a test form
3. Check the recipient email

### After Domain Verification

1. Revert the `from` address to your domain email
2. Submit a test form through your website
3. Check `info@oncotritionhc.com` for the notification

## Email Template

The email notification includes:
- Sender's name
- Sender's email address (with reply-to enabled)
- Subject line
- Full message content
- Submission timestamp

## Troubleshooting

### Email not received?

1. **Check spam folder** - First-time emails might be filtered
2. **Verify API key** - Ensure `RESEND_API_KEY` is set correctly
3. **Check domain verification** - Domain must be verified in Resend
4. **Review logs** - Check your server logs for error messages
5. **Check Resend dashboard** - View email logs and delivery status

### Common Issues

**"Domain not verified"**
- Complete DNS verification in Resend dashboard
- Wait up to 48 hours for DNS propagation

**"API key invalid"**
- Ensure the key starts with `re_`
- Check for extra spaces or quotes in `.env.local`
- Generate a new API key if needed

**"Rate limit exceeded"**
- Free tier: 100 emails/day
- Upgrade your Resend plan if needed

## Features

✅ Automatic email notifications to info@oncotritionhc.com
✅ Reply-to functionality (replies go directly to the sender)
✅ Professional HTML email template
✅ Submission saved to database even if email fails
✅ Error handling and logging
✅ Mobile-responsive email design

## Cost

- **Resend Free Tier**: 100 emails/day, 3,000/month
- **Paid Plans**: Start at $20/month for 50,000 emails

For a contact form, the free tier should be sufficient unless you receive more than 100 submissions per day.

## Security Notes

- Never commit `.env.local` to version control
- Keep your Resend API key secret
- The API route validates all input before processing
- Email addresses are validated with regex
- Database submissions are protected by Supabase RLS policies

## Support

For issues with:
- **Resend**: [Resend Documentation](https://resend.com/docs)
- **Email Template**: Check `emails/ContactFormNotification.tsx`
- **API Route**: Check `app/api/contact/submit/route.ts`
- **Contact Form**: Check `components/contact/ContactForm.tsx`
