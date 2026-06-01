import './globals.css'

export const metadata = {
  title: 'Watch Hunt',
  description: 'Find your grail at the right price',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg min-h-screen grid-texture">
        {children}
      </body>
    </html>
  )
}
