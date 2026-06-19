import { getCatalog } from "@/lib/catalog";
import Academy from "@/components/Academy";

// Free-tier learning app. Premium games/topics are locked here; bundle
// accounts are redirected to /main/premium automatically.
export default function NormalPage() {
  const catalog = getCatalog();
  return <Academy catalog={catalog} tier="free" />;
}
