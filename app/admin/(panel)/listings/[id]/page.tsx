import type { Metadata } from "next";
import ListingEditor from "@/components/admin/ListingForm";

export const metadata: Metadata = { title: "Edit listing" };

export default function Page() {
  return <ListingEditor />;
}
