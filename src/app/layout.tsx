import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuestHub — Quest for Code",
  description:
    "A fantasy RPG-themed GitHub client. View any public repo as an adventure.",
  openGraph: {
    title: "QuestHub — Quest for Code",
    description:
      "A fantasy RPG-themed GitHub client. View any public repo as an adventure.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
