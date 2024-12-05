'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const steps = [
  { step: 1, text: "Sign up and complete your health profile" },
  { step: 2, text: "Receive your personalized nutrition plan" },
  { step: 3, text: "Track your meals and progress" },
  { step: 4, text: "Consult with experts as needed" },
  { step: 5, text: "Adjust your plan based on your progress" }
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(30deg,rgba(59,130,246,0.1)_12%,transparent_12.5%,transparent_87%,rgba(59,130,246,0.1)_87.5%,rgba(59,130,246,0.1))] dark:bg-[linear-gradient(30deg,rgba(59,130,246,0.05)_12%,transparent_12.5%,transparent_87%,rgba(59,130,246,0.05)_87.5%,rgba(59,130,246,0.05))] bg-[length:20px_35px]"></div>
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Follow these simple steps to start your journey towards better nutrition
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 blur-lg"></div>
              <div className="relative overflow-hidden rounded-2xl">
                <Image 
                  src="/placeholder.svg?height=400&width=600" 
                  alt="How It Works" 
                  width={600} 
                  height={400}
                  className="w-full h-auto object-cover rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="space-y-8">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {item.step}
                  </div>
                  <div className="flex-grow">
                    <p className="text-lg text-gray-700 dark:text-gray-200">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
