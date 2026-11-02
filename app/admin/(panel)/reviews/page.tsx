import type { Metadata } from "next";
import Reviews from "@/components/admin/Reviews";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <Reviews />;
}
