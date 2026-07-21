import './globals.css'

export const metadata = {
  title: 'Infinite Performance Leaderboard',
  description: 'The Official Rankings of the IP Club Collective',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* Restore original fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Bebas+Neue&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        
        {/* Restore Tailwind CDN and Config */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      display: ['"Bebas Neue"', 'system-ui', 'sans-serif'],
                      heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                      body: ['"Inter"', 'system-ui', 'sans-serif'],
                    },
                  },
                },
              };
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}