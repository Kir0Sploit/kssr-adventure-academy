import { redirect } from "next/navigation";

// The admin CMS lives at /admin/dashboard.
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
