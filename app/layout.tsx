import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title:       { default: "Golf & Give", template: "%s | Golf & Give" },
  description: "Play. Win. Give Back. The golf platform that combines competition with charity.",
  keywords:    ["golf", "charity", "draw", "prizes", "Stableford"],
  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         process.env.NEXT_PUBLIC_APP_URL,
    siteName:    "Golf & Give",
    title:       "Golf & Give — Play, Win, Give Back",
    description: "Monthly golf prize draws with charitable impact built in.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
