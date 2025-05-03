import Image from "next/image"
import { ArrowRight } from "lucide-react"

export default function ProductsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with angled design */}
          <div className="relative mb-20">
            <div className="absolute inset-0 bg-emerald-600 skew-y-3 -z-10 rounded-br-3xl rounded-tl-3xl"></div>
            <div className="relative z-10 py-12 px-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Our Products</h2>
              <div className="h-1 w-24 bg-emerald-300 mb-4"></div>
              <p className="text-emerald-50 max-w-xl">
                Comprehensive solutions designed to transform your nutrition journey
              </p>
            </div>
          </div>

          {/* Products in a staggered layout */}
          <div className="space-y-16">
            {/* First product */}
            <div className="relative">
              <div className="grid md:grid-cols-5 gap-6 items-center">
                {/* Image column - spans 2 of 5 columns */}
                <div className="md:col-span-2 order-2 md:order-1">
                  <div className="rounded-2xl overflow-hidden shadow-xl transform transition-transform hover:scale-105">
                    <Image
                      src="/placeholder.svg?height=300&width=500"
                      alt="Smartspoonplus dashboard interface"
                      width={500}
                      height={300}
                      className="w-full object-cover"
                    />
                  </div>
                </div>

                {/* Content column - spans 3 of 5 columns */}
                <div className="md:col-span-3 order-1 md:order-2 md:pl-8">
                  <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-600"
                    >
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Smartspoonplus</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    With features such as meal planning, client tracking, and reporting tools, nutritionists can save
                    valuable time and reduce administrative burdens, allowing them to focus more on client interaction
                    and personalized care.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">Meal Planning</span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                      Client Tracking
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                      Reporting Tools
                    </span>
                  </div>
                  <button className="group flex items-center text-emerald-600 font-medium hover:text-emerald-800 transition-colors">
                    Explore Smartspoonplus
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

            {/* Second product */}
            <div className="relative">
              <div className="grid md:grid-cols-5 gap-6 items-center">
                {/* Content column */}
                <div className="md:col-span-3 md:pr-8">
                  <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-600"
                    >
                      <path d="M22 12.5V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12.5"></path>
                      <path d="M22 12.5a2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 1 17 17.5 2.5 2.5 0 0 1 14.5 15a2.5 2.5 0 0 0-2.5-2.5 2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 1 7 17.5 2.5 2.5 0 0 1 4.5 15 2.5 2.5 0 0 0 2 12.5"></path>
                      <path d="M2 12.5V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7.5"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Nutripreneurship programs</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    By fostering professional growth and practical skills, the programs empower professionals to
                    translate expertise into sustainable ventures while addressing local wellness needs.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                      Professional Growth
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                      Sustainable Ventures
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                      Local Wellness
                    </span>
                  </div>
                  <button className="group flex items-center text-emerald-600 font-medium hover:text-emerald-800 transition-colors">
                    Discover Programs
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Image column */}
                <div className="md:col-span-2">
                  <div className="rounded-2xl overflow-hidden shadow-xl transform transition-transform hover:scale-105">
                    <Image
                      src="/placeholder.svg?height=300&width=500"
                      alt="Nutrition professionals collaborating"
                      width={500}
                      height={300}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
