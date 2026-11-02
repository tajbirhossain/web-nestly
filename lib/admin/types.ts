import type { Borough, Terms } from "@/lib/data";

export type ListingStatus = "published" | "draft" | "archived";
export type Listing = {
  id: string;
  title: string;
  slug: string;
  neighborhood: string;
  borough: Borough;
  beds: number; // 0 = studio
  baths: number;
  sqft: number;
  price: number; // per month
  availableFrom: string; // ISO date
  status: ListingStatus;
  featured: boolean;
  /** When false the public site hides this home from searches that include children. */
  childrenAllowed: boolean;
  images: string[];
  description: string;
  amenities: string[];
  updatedAt: string;
} & Terms; // fees, occupancy, house rules and special instructions

export type BookingStatus = "new" | "contacted" | "confirmed" | "declined" | "cancelled";
export type Booking = {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  status: BookingStatus;
  message: string;
  notes: string;
  createdAt: string;
};

export type InquiryType = "contact" | "corporate" | "relocation" | "newsletter";
export type InquiryStatus = "new" | "in-progress" | "resolved";
export type Inquiry = {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  company?: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
};

export type HostStatus = "pending" | "approved" | "rejected";
export type HostApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  borough: Borough;
  beds: number;
  expectedRent: number;
  message: string;
  status: HostStatus;
  createdAt: string;
};

export type ReviewStatus = "pending" | "published" | "hidden";
export type Review = {
  id: string;
  name: string;
  stay: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
};

export type PostStatus = "published" | "draft";
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  body: string;
  image: string;
  status: PostStatus;
  date: string;
};

export type Settings = {
  siteName: string;
  supportEmail: string;
  phone: string;
  minStayDays: number;
  bookingsOpen: boolean;
  notifyBookings: boolean;
  notifyInquiries: boolean;
  notifyHosts: boolean;
};

export type DB = {
  listings: Listing[];
  bookings: Booking[];
  inquiries: Inquiry[];
  hosts: HostApplication[];
  reviews: Review[];
  posts: Post[];
  settings: Settings;
};

export type CollectionKey = Exclude<keyof DB, "settings">;
