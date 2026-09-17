import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireRole("ADMIN");

  const unreadCount = await prisma.contactMessage.count({ where: { read: false } });

  return (
    <div>
      <AdminNav unreadCount={unreadCount} />
      {children}
    </div>
  );
}
