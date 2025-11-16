import type { Metadata } from "next";
import localFont from "next/font/local";

import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/sonner";
import { Footer } from "@/components/navbar/footer";
import { Header } from "@/components/navbar/header";
import { ReactQueryProvider } from "@/components/react-query";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | TryWear",
    default: "TryWear",
  },
  description:
    "Temukan gaya terbaikmu di TryWear - e-commerce fashion modern dengan koleksi pakaian trendi, nyaman, dan berkualitas. Belanja mudah, harga bersahabat, dan pengiriman cepat ke seluruh Indonesia!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster position="top-center" richColors />
        <Footer />
      </body>
    </html>
  );
}
