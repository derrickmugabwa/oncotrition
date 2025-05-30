'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const plans = [
  {
    name: "Basic",
    price: "9.99",
    features: [
      "Personalized meal plans",
      "Basic nutrition tracking",
      "Weekly progress reports",
      "Email support",
      "Mobile app access"
    ],
    recommended: false,
    gradient: "from-blue-400/20 to-indigo-400/20"
  },
  {
    name: "Pro",
    price: "19.99",
    features: [
      "Everything in Basic",
      "Advanced nutrition analytics",
      "Custom recipe suggestions",
      "Priority email support",
      "Meal plan customization",
      "Progress tracking dashboard"
    ],
    recommended: true,
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  {
    name: "Enterprise",
    price: "39.99",
    features: [
      "Everything in Pro",
      "1-on-1 nutrition coaching",
      "Video consultations",
      "24/7 priority support",
      "Custom meal planning",
      "Advanced health metrics",
      "Team collaboration tools"
    ],
    recommended: false,
    gradient: "from-blue-600/20 to-indigo-600/20"
  }
];

export default function PricingCards() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_70%)]"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`h-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl overflow-hidden
                  ${plan.recommended ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                  shadow-lg hover:shadow-2xl transition-all duration-300`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`}></div>
                
                {/* Popular badge */}
                {plan.recommended && (
                  <div className="absolute top-0 right-0 mt-4 mr-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium px-3 py-1 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="relative p-8">
                  {/* Plan name and price */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                  </div>
                  
                  {/* Features list */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <Link
                      href="/signup"
                      className={`block w-full py-3 px-6 text-center rounded-xl font-medium transition-all duration-300
                        ${plan.recommended
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                          : 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-white hover:shadow-lg dark:hover:shadow-gray-900/25'
                        }`}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
