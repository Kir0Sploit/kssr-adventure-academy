"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ParentAuth from "./ParentAuth";
import { getMe, type AccountDTO } from "@/lib/account";

/** Entry/login gate for the learning app. Sends each plan to its own page. */
export default function MainGate() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const routeByPlan = (acc: AccountDTO) => {
    router.replace(acc.plan === "bundle" ? "/main/premium" : "/main/normal");
  };

  useEffect(() => {
    void getMe().then((me) => {
      if (me.account) routeByPlan(me.account);
      else setChecking(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <div className="min-h-screen grid place-items-center text-2xl font-display animate-bobble">🦧 …</div>;
  }

  return (
    <ParentAuth
      onAuthed={(acc) => routeByPlan(acc)}
      onBack={() => router.push("/")}
    />
  );
}
