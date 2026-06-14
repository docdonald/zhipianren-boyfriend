"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/auth/signin");
        router.refresh();
      }}
      className="text-white/60 hover:text-white text-xs px-3 py-1.5 rounded-full border border-white/10"
    >
      退出
    </button>
  );
}
