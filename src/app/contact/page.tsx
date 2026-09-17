import { getCurrentUser } from "@/lib/dal";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact — FollowMyScore",
  description: "Contacte le support de FollowMyScore.",
};

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Contact</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Une question, un bug à signaler, une suggestion ? Écris-nous, on te répond dès que possible.
      </p>

      <ContactForm defaultName={user?.name ?? ""} defaultEmail={user?.email ?? ""} />
    </div>
  );
}
