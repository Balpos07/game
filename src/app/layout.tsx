import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devnvisuals.com"),
  title: "DevN'Visuals Trivia",
  description:
    "Play the DevN'Visuals trivia challenge. Sign in with Google and compete on the global leaderboard.",
  openGraph: {
    title: "DevN'Visuals Trivia",
    description: "Test your tech and design knowledge on DevN'Visuals.",
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
        className={`${manrope.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
