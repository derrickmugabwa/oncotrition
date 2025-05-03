import Image from "next/image"
import { List, Rocket } from "lucide-react"

export default function ProductsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-blue-600 mb-3">Our Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions designed to transform your nutrition journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* First product card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <List className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold mt-1">Smartspoonplus</h3>
            </div>

            {/* Product image */}
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=200&width=400"
                alt="Smartspoonplus dashboard interface"
                width={400}
                height={200}
                className="w-full object-cover rounded-lg"
              />
            </div>

            <p className="text-gray-600 mb-4">
              With features such as meal planning, client tracking, and reporting tools, nutritionists can save valuable
              time and reduce administrative burdens, allowing them to focus more on client interaction and personalized
              care
            </p>

            <div className="mt-auto">
              <button className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
                Learn more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Second product card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold mt-1">Nutripreneurship programs</h3>
            </div>

            {/* Product image */}
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=200&width=400"
                alt="Nutrition professionals collaborating"
                width={400}
                height={200}
                className="w-full object-cover rounded-lg"
              />
            </div>

            <p className="text-gray-600 mb-4">
              By fostering professional growth and practical skills, the programs empower professionals to translate
              expertise into sustainable ventures while addressing local wellness needs.
            </p>

            <div className="mt-auto">
              <button className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
                Learn more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
