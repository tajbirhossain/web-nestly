import type { Metadata } from "next";
import Hosts from "@/components/admin/Hosts";

export const metadata: Metadata = { title: "Host applications" };

export default function Page() {
  return <Hosts />;
}
