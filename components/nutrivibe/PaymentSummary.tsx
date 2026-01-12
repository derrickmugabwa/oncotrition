'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RegistrationFormData, NutrivibePricing } from '@/types/nutrivibe';
import { Event } from '@/types/events';
import { Loader2, User, Mail, Phone, Building, Briefcase, Tag, Target } from 'lucide-react';

interface PaymentSummaryProps {
  data: RegistrationFormData;
  pricing: NutrivibePricing[];
  event: Event;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PaymentSummary({
  data,
  pricing,
  event,
  onBack,
  onSubmit,
  isSubmitting,
}: PaymentSummaryProps) {
  const selectedPrice = pricing.find((p) => p.participation_type === data.participationType);
  const amount = selectedPrice?.price || 0;

  const participationTypeLabels: { [key: string]: string } = {
    nutrition_student: 'Nutrition Student',
    professional: 'Nutrition/Dietician/Nutritionist',
    healthcare_professional: 'Healthcare Professional/Allied Guest',
    institutional_representative: 'Institutional Representative/Partner/Sponsor',
    online_attendee: 'Online Attendee',
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please review your information before proceeding to payment.
      </p>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{data.fullName}</p>
            </div>
          </div>
          
          {data.organization && (
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-medium">{data.organization}</p>
              </div>
            </div>
          )}
          
          {data.designation && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="font-medium">{data.designation}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{data.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{data.phoneNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Participation Type</p>
              <p className="font-medium">
                {participationTypeLabels[data.participationType] || data.participationType}
              </p>
              {data.participationTypeOther && (
                <p className="text-sm text-muted-foreground mt-1">
                  {data.participationTypeOther}
                </p>
              )}
            </div>
          </div>
          
          {data.interestAreas && data.interestAreas.length > 0 && (
            <div className="flex items-start gap-3">
              <Target className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Interest Areas</p>
                <ul className="list-disc list-inside font-medium">
                  {data.interestAreas.map((area, index) => (
                    <li key={index} className="text-sm">{area}</li>
                  ))}
                </ul>
                {data.interestAreasOther && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Other: {data.interestAreasOther}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {data.networkingPurpose && (
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Networking Purpose</p>
                <p className="font-medium capitalize">
                  {data.networkingPurpose.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="border-[#009688] border-2">
        <CardHeader className="bg-teal-50 dark:bg-teal-950">
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Registration Fee</span>
            <span className="font-semibold">KES {amount.toLocaleString()}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-2xl font-bold">
            <span>Total Amount</span>
            <span className="text-[#009688]">KES {amount.toLocaleString()}</span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Payment Method:</strong> You will be redirected to Paystack to complete your payment securely using card or mobile money.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      {event?.terms_and_conditions && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {event.terms_and_conditions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" size="lg" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-[#009688] hover:bg-[#00796b] text-white"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </div>
    </div>
  );
}
