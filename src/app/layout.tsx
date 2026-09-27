import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevFest Ilorin 2026 Trivia",
  description:
    "Play the DevFest Ilorin 2026 trivia tournament. Sign in with Google and compete on the global leaderboard.",
  openGraph: {
    title: "DevFest Ilorin 2026 Trivia",
    description: "Test your tech knowledge at the biggest tech conference in North Central Nigeria.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${jakarta.variable} antialiased min-h-screen`}
        style={{ fontFamily: "var(--font-jakarta), var(--font-outfit), ui-sans-serif, system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
