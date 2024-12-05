'use client'

import Link from 'next/link'
import { useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-green-600 text-white">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">NutriLife</Link>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-green-200">Home</Link>
          <Link href="/about" className="hover:text-green-200">About Us</Link>
          <Link href="/features" className="hover:text-green-200">Features</Link>
          <Link href="/pricing" className="hover:text-green-200">Pricing</Link>
          <Link href="/contact" className="hover:text-green-200">Contact Us</Link>
          <Link href="/login" className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-100">Login</Link>
        </nav>
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link href="/" className="hover:text-green-200">Home</Link>
            <Link href="/about" className="hover:text-green-200">About Us</Link>
            <Link href="/features" className="hover:text-green-200">Features</Link>
            <Link href="/pricing" className="hover:text-green-200">Pricing</Link>
            <Link href="/contact" className="hover:text-green-200">Contact Us</Link>
            <Link href="/login" className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-100 inline-block">Login</Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header

