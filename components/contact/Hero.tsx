'use client';

export default function Hero() {
  return (
    <section className="relative py-12 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Get in Touch</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Contact
            </span>{' '}
            <span className="text-gray-900 dark:text-white">Us</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>
    </section>
  );
}
