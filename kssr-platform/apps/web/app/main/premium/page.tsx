import { getCatalog } from "@/lib/catalog";
import Academy from "@/components/Academy";

// Premium (bundle) learning app — full access. Free accounts are redirected
// to /main/normal automatically.
export default function PremiumPage() {
  const catalog = getCatalog();
  return <Academy catalog={catalog} tier="premium" />;
}
