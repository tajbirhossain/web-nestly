import { BookingRules } from "@/components/BookingRules";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildAreaOptions, buildPriceMeta } from "@/lib/catalog";
import { getApartments } from "@/lib/listings";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [{ minStayDays }, apartments] = await Promise.all([getSettings(), getApartments()]);
  return (
    <BookingRules minNights={minStayDays} areaOptions={buildAreaOptions(apartments)} price={buildPriceMeta(apartments)}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </BookingRules>
  );
}
