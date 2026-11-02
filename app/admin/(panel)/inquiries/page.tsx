import type { Metadata } from "next";
import Inquiries from "@/components/admin/Inquiries";

export const metadata: Metadata = { title: "Inquiries" };

export default function Page() {
  return <Inquiries />;
}
