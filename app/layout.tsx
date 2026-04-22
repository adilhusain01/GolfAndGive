import type { Metadata } from "next";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const sans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title:       { default: "Golf & Give", template: "%s | Golf & Give" },
  description: "A charitable membership platform where golf scores unlock prize draws and recurring impact.",
  keywords:    ["golf", "charity", "draw", "prizes", "Stableford"],
  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         process.env.NEXT_PUBLIC_APP_URL,
    siteName:    "Golf & Give",
    title:       "Golf & Give",
    description: "Compete monthly, support a chosen charity, and turn a scorecard into recurring impact.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
