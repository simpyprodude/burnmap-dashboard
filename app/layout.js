import './globals.css'

export const metadata = {
  title: 'Burnmap',
  description: 'Your real AI bill, before it hits.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
