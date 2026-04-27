import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { BookmarksProvider } from "@/lib/bookmarks-context"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HUNGRY - Discover Your Perfect Meal",
  description: "A warm editorial food magazine meets modern mobile app. Find perfect meals based on your mood.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#D97757",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`font-sans ${playfair.variable} antialiased overflow-x-hidden`}>
        <BookmarksProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </BookmarksProvider>
        <Analytics />
      </body>
    </html>
  )
}
