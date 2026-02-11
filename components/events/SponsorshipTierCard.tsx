import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SponsorshipTier } from '@/types/sponsorship';

interface SponsorshipTierCardProps {
  tier: SponsorshipTier;
  isSelected: boolean;
  onSelect: () => void;
  isRecommended?: boolean;
}

export function SponsorshipTierCard({
  tier,
  isSelected,
  onSelect,
  isRecommended = false,
}: SponsorshipTierCardProps) {
  return (
    <div className={`${isRecommended ? 'pt-4' : ''}`}>
      <Card
        className={`relative transition-all duration-300 hover:shadow-xl ${
          isSelected
            ? 'border-[#009688] border-2 shadow-lg scale-105'
            : 'border-gray-200 hover:border-[#009688]/50'
        } ${isRecommended ? 'ring-2 ring-[#009688]/20' : ''}`}
      >
        {isRecommended && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-[#009688] text-white px-4 py-1.5 shadow-md font-semibold">
              Most Popular
            </Badge>
          </div>
        )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">
          {tier.tier_name}
        </CardTitle>
        {tier.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {tier.description}
          </p>
        )}
        <div className="mt-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-sm text-muted-foreground">KES</span>
            <span className="text-4xl font-bold text-[#009688]">
              {tier.price.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Benefits List */}
        {tier.benefits && tier.benefits.length > 0 && (
          <div className="space-y-3 mb-6">
            {tier.benefits
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map((benefit) => (
                <div key={benefit.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-[#009688]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#009688]" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground flex-1">
                    {benefit.benefit_text}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Select Button */}
        <Button
          onClick={onSelect}
          className={`w-full ${
            isSelected
              ? 'bg-[#009688] hover:bg-[#00796b] text-white'
              : 'bg-white hover:bg-gray-50 text-[#009688] border-2 border-[#009688]'
          }`}
          size="lg"
        >
          {isSelected ? 'Selected' : 'Select This Tier'}
        </Button>
      </CardContent>
    </Card>
    </div>
  );
}
