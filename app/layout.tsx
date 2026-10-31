import type { Metadata } from "next";
import { Fraunces, Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nestly.nyc"),
  title: {
    default: "Nestly — Furnished apartments in New York City for 30+ days",
    template: "%s | Nestly",
  },
  description:
    "Move-in ready furnished apartments across Manhattan, the Bronx, Brooklyn and New Jersey for stays of 30 days or longer. Utilities and Wi‑Fi included.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
