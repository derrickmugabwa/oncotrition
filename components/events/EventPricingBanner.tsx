'use client';

import { motion } from 'framer-motion';
import { Tag, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NutrivibePricing } from '@/types/nutrivibe';

interface EventPricingBannerProps {
  pricing: NutrivibePricing[];
  showDoorPrices?: boolean; // Toggle to show door prices
}

export default function EventPricingBanner({ pricing, showDoorPrices = false }: EventPricingBannerProps) {
  // Filter and sort active pricing options
  const activePricing = pricing
    .filter(p => p.is_active)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Debug logging
  console.log('EventPricingBanner - All pricing:', pricing);
  console.log('EventPricingBanner - Active pricing:', activePricing);
  console.log('EventPricingBanner - Door prices:', activePricing.map(p => ({ type: p.participation_type, door_price: p.door_price })));

  if (activePricing.length === 0) {
    return null;
  }

  // Check if any pricing has door prices
  const hasDoorPrices = activePricing.some(p => p.door_price !== null && p.door_price !== undefined && p.door_price > 0);

  // Format participation type for display
  const formatType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="border-2 border-[#009688]/20 bg-gradient-to-br from-[#009688]/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#009688]" />
            Event Pricing
          </CardTitle>
          {hasDoorPrices && showDoorPrices && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <TrendingUp className="w-3 h-3 mr-1" />
              Door Prices Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Door Price Alert */}
        {hasDoorPrices && showDoorPrices && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">
              Last call pricing is now in effect. Register early to save!
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activePricing.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#009688] transition-all duration-300 bg-white hover:shadow-md">
                {/* Participation Type */}
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                  {formatType(option.participation_type)}
                </h3>

                {/* Description */}
                {option.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {option.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="space-y-2">
                  {/* Regular/Early Bird Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {option.door_price ? 'Early Bird' : 'Price'}
                    </span>
                    <span className={`font-bold ${showDoorPrices && option.door_price
                        ? 'text-sm text-gray-500 line-through'
                        : 'text-lg text-[#009688]'
                      }`}>
                      KES {option.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Door Price */}
                  {option.door_price && option.door_price > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs font-medium text-orange-600">
                        {showDoorPrices ? 'Current Price' : 'Last Call Price'}
                      </span>
                      <span className={`font-bold ${showDoorPrices
                          ? 'text-lg text-orange-600'
                          : 'text-base text-gray-700'
                        }`}>
                        KES {option.door_price.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Savings Badge */}
                {option.door_price && option.door_price > 0 && !showDoorPrices && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Save KES {(option.door_price - option.price).toLocaleString()}
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            {hasDoorPrices && !showDoorPrices && (
              <>Prices shown are early bird rates. Door prices apply for late registrations.</>
            )}
            {hasDoorPrices && showDoorPrices && (
              <>Door pricing is now active. Limited spots remaining!</>
            )}
            {!hasDoorPrices && (
              <>All prices are inclusive of applicable fees.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
