export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-4">사이드바</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
