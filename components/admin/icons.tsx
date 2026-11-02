const paths = {
  dashboard: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z",
  building: "M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h2M14 8h2M8 12h2M14 12h2",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
  inbox: "M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5",
  key: "M15 9a4 4 0 1 1-7.5 2L3 15.5V19h3.5v-2H9v-2h2l1.5-1.5A4 4 0 0 0 15 9z",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  doc: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1.5-2-3.5-2.4.8a7 7 0 0 0-1.6-.9L14.6 4h-4l-.4 2.9a7 7 0 0 0-1.6.9L6.2 7 4.2 10.5 6.2 12a7 7 0 0 0 0 1.8l-2 1.7 2 3.5 2.4-.8c.5.4 1 .7 1.6.9l.4 2.9h4l.4-2.9c.6-.2 1.1-.5 1.6-.9l2.4.8 2-3.5-2-1.7a7 7 0 0 0 0-1.8z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  menu: "M4 6h16M4 12h16M4 18h16",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M9 4H4v16h5M16 8l4 4-4 4M20 12H9",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 4a4 4 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3",
  chevron: "M9 6l6 6-6 6",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  bell: "M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4",
  alert: "M12 3l10 18H2zM12 10v5M12 18v.5",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
