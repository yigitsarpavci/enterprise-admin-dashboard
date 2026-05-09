import { requireAdmin } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950">
      <AdminSidebar />
      <main className="flex-grow pb-24 md:pb-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
