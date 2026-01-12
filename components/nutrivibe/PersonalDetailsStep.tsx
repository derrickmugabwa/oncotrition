'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RegistrationFormData } from '@/types/nutrivibe';

interface PersonalDetailsStepProps {
  data: RegistrationFormData;
  updateData: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
}

export function PersonalDetailsStep({ data, updateData, onNext }: PersonalDetailsStepProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[0-9+\s()-]{10,}$/;
    return re.test(phone);
  };

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(data.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please provide your personal information to complete the registration.
      </p>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-base">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          className={errors.fullName ? 'border-destructive' : ''}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName}</p>
        )}
      </div>

      {/* Organization */}
      <div className="space-y-2">
        <Label htmlFor="organization" className="text-base">
          Organization / Institution
        </Label>
        <Input
          id="organization"
          type="text"
          placeholder="Enter your organization name"
          value={data.organization}
          onChange={(e) => updateData({ organization: e.target.value })}
        />
      </div>

      {/* Designation */}
      <div className="space-y-2">
        <Label htmlFor="designation" className="text-base">
          Designation / Role
        </Label>
        <Input
          id="designation"
          type="text"
          placeholder="e.g., Nutritionist, Student, etc."
          value={data.designation}
          onChange={(e) => updateData({ designation: e.target.value })}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-base">
          Phone Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+254 700 000 000"
          value={data.phoneNumber}
          onChange={(e) => updateData({ phoneNumber: e.target.value })}
          className={errors.phoneNumber ? 'border-destructive' : ''}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          className="bg-[#009688] hover:bg-[#00796b] text-white"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
