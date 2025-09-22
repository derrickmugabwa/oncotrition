// Force dynamic rendering for authentication pages
export const dynamic = 'force-dynamic'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
