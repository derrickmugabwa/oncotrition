import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">NutriLife</h3>
            <p className="text-sm">Empowering you to live a healthier life through proper nutrition.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-green-200">Home</Link></li>
              <li><Link href="/about" className="hover:text-green-200">About Us</Link></li>
              <li><Link href="/features" className="hover:text-green-200">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-green-200">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>Email: info@nutrilife.com</li>
              <li>Phone: (123) 456-7890</li>
              <li>Address: 123 Nutrition St, Healthy City, HC 12345</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-200">Facebook</a>
              <a href="#" className="hover:text-green-200">Twitter</a>
              <a href="#" className="hover:text-green-200">Instagram</a>
              <a href="#" className="hover:text-green-200">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          <p>&copy; 2023 NutriLife. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

