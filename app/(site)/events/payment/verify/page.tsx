'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function EventPaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [registration, setRegistration] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('failed');
      setError('No payment reference found');
      return;
    }

    verifyPayment(reference);
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch('/api/events/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setStatus('success');
      setRegistration(data.registration);
      setEvent(data.event);
      setQrCodeUrl(data.qrCodeUrl);
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16 font-outfit">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {status === 'verifying' && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-6 text-[#009688] animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </CardContent>
          </Card>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="border-green-500 border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
                <h2 className="text-3xl font-bold mb-2 text-green-600">
                  Registration Successful! 🎉
                </h2>
                <p className="text-muted-foreground text-lg">
                  Your payment has been confirmed and your registration is complete.
                </p>
              </CardContent>
            </Card>

            {/* Event Info */}
            {event && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <p className="text-muted-foreground mt-2">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at {event.event_time}
                    </p>
                    <p className="text-muted-foreground">{event.location}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code */}
            {qrCodeUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Your Entry QR Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-lg inline-block border-4 border-[#009688]">
                    <Image
                      src={qrCodeUrl}
                      alt="Registration QR Code"
                      width={300}
                      height={300}
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Save this QR code or check your email for a copy. You'll need it for event check-in.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Email Confirmation */}
            <Alert>
              <AlertDescription>
                <strong>Confirmation email sent!</strong> We've sent a confirmation email to{' '}
                <strong>{registration?.email}</strong> with your QR code and event details.
              </AlertDescription>
            </Alert>

            {/* Registration Details */}
            {registration && (
              <Card>
                <CardHeader>
                  <CardTitle>Registration Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration ID</span>
                    <span className="font-mono text-sm">{registration.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{registration.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold text-[#009688]">
                      KES {registration.price_amount.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push('/events')}
                className="w-full bg-[#009688] hover:bg-[#00796b] text-white"
                size="lg"
              >
                View All Events
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
            <Card className="border-destructive border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <XCircle className="w-16 h-16 mx-auto mb-6 text-destructive" />
                <h2 className="text-3xl font-bold mb-2 text-destructive">
                  Payment Verification Failed
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {error || 'We could not verify your payment. Please try again.'}
                </p>
              </CardContent>
            </Card>

            <Alert variant="destructive">
              <AlertDescription>
                If you believe this is an error or if your payment was deducted, please contact us at{' '}
                <a href="mailto:events@oncotrition.com" className="underline font-semibold">
                  events@oncotrition.com
                </a>{' '}
                with your payment reference.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push('/events')}
                className="w-full bg-[#009688] hover:bg-[#00796b] text-white"
                size="lg"
              >
                View Events
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
