import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ContactMessageActions } from "@/components/ContactMessageActions";

const PAGE_SIZE = 20;

export default async function AdminContactMessagesPage({
  searchParams,
}: PageProps<"/admin/contact-messages">) {
  await requireRole("ADMIN");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contactMessage.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    return p > 1 ? `/admin/contact-messages?page=${p}` : "/admin/contact-messages";
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Messages de contact</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Messages envoyés depuis la page de contact ({total} message{total > 1 ? "s" : ""}).
      </p>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-zinc-500">
            Aucun message pour le moment.
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    {m.name}{" "}
                    <span className="font-normal text-zinc-500">
                      &lt;
                      <a href={`mailto:${m.email}`} className="hover:underline">
                        {m.email}
                      </a>
                      &gt;
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {format(m.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!m.read && (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                      Nouveau
                    </span>
                  )}
                  <ContactMessageActions messageId={m.id} read={m.read} />
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm">{m.message}</p>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="rounded-lg border border-border px-3 py-1.5 hover:border-accent">
              Précédent
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-1.5 text-zinc-400">Précédent</span>
          )}
          <span className="text-zinc-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="rounded-lg border border-border px-3 py-1.5 hover:border-accent">
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
