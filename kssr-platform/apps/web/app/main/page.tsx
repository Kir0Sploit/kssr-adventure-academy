import { getCatalog } from "@/lib/catalog";
import Academy from "@/components/Academy";

// The parent/child learning app (login → profiles → games → dashboard).
export default function MainPage() {
  const catalog = getCatalog();
  return <Academy catalog={catalog} />;
}
