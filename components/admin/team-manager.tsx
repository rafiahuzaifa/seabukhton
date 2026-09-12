"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { inviteStaffAction, updateUserRoleAction } from "@/lib/actions/admin/team";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

type TeamUser = { id: string; name: string | null; email: string; role: string; isActive: boolean };

const roles = ["CUSTOMER", "STAFF", "ADMIN"] as const;
const inputClass = "rounded-full border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none";

export function TeamManager({ users, currentUserId, canManage }: { users: TeamUser[]; currentUserId: string; canManage: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "STAFF" as (typeof roles)[number] });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#f0e7dc] last:border-0">
                <td className="px-5 py-4 font-medium text-[#1b120d]">{user.name}</td>
                <td className="px-5 py-4 text-[#54453f]">{user.email}</td>
                <td className="px-5 py-4">
                  {canManage && user.id !== currentUserId ? (
                    <select
                      defaultValue={user.role}
                      disabled={pending}
                      onChange={(e) =>
                        startTransition(async () => {
                          const result = await updateUserRoleAction(user.id, e.target.value);
                          if (result.success) {
                            push("Role updated", "success");
                            router.refresh();
                          } else {
                            push(result.error ?? "Something went wrong.", "error");
                          }
                        })
                      }
                      className="rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-3 py-1.5 text-xs outline-none"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-full bg-[#f2e6d5] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-[#694d41]">
                      {user.role}
                      {user.id === currentUserId ? " (you)" : ""}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage ? (
        showForm ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const result = await inviteStaffAction(form);
                if (result.success) {
                  push(result.tempPassword ? `Added — temporary password: ${result.tempPassword}` : "Team member added", "success");
                  setForm({ name: "", email: "", role: "STAFF" });
                  setShowForm(false);
                  router.refresh();
                } else {
                  push(result.error ?? "Something went wrong.", "error");
                }
              });
            }}
            className="grid gap-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5 md:grid-cols-3"
          >
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as (typeof roles)[number] })} className={inputClass}>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
                {pending ? "Saving…" : "Add team member"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
            <Plus size={14} /> Add team member
          </Button>
        )
      ) : (
        <p className="text-xs text-[#8a7469]">Only admins can change roles or add team members.</p>
      )}
    </div>
  );
}
