import MainGate from "@/components/MainGate";

// Login gate: authenticates the parent, then routes to /main/normal (free)
// or /main/premium (bundle).
export default function MainPage() {
  return <MainGate />;
}
