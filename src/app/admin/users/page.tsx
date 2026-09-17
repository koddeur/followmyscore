import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { UserRoleForm } from "@/components/UserRoleForm";
import { AdminUserSearch } from "@/components/AdminUserSearch";
import { DeleteUserButton } from "@/components/DeleteUserButton";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const admin = await requireRole("ADMIN");

  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { username: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Utilisateurs</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Gère les rôles des comptes ({total} utilisateur{total > 1 ? "s" : ""}).
      </p>

      <div className="mb-4 max-w-sm">
        <AdminUserSearch defaultValue={query} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-zinc-500">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  {query ? <>Aucun utilisateur ne correspond à « {query} ».</> : "Aucun utilisateur."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-500">@{u.username}</td>
                  <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <UserRoleForm userId={u.id} role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== admin.id && (
                      <DeleteUserButton userId={u.id} label={u.name} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:border-accent"
            >
              Précédent
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Précédent</span>
          )}
          <span className="text-zinc-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:border-accent"
            >
              Suivant
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Suivant</span>
          )}
        </div>
      )}
    </div>
  );
}
