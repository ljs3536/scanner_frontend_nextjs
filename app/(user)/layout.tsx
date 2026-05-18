import Header from "@/components/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. 상단 공통 헤더 */}
      <Header />

      {/* 2. 각 페이지의 내용(Dashboard, Scan 등)이 들어갈 자리 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
