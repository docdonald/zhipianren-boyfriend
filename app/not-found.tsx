import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-white/60 mb-8">这个角色不在这个世界</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-white text-black text-sm"
        >
          返回选角
        </Link>
      </div>
    </main>
  );
}
