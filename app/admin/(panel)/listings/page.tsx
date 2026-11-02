import type { Metadata } from "next";
import Listings from "@/components/admin/Listings";

export const metadata: Metadata = { title: "Listings" };

export default function Page() {
  return <Listings />;
}
