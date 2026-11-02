import Shell from "@/components/admin/Shell";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return <Shell>{children}</Shell>;
}
