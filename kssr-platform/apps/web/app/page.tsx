import { getCatalog } from "@/lib/catalog";
import Academy from "@/components/Academy";

// Curriculum is loaded at the server boundary and passed to the client as
// serializable props — the browser never touches Node `fs`.
export default function Page() {
  const catalog = getCatalog();
  return <Academy catalog={catalog} />;
}
