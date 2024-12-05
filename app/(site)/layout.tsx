import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThemeToggle from '@/components/ThemeToggle'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <ThemeToggle />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
