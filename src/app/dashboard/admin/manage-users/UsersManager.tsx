"use client"

import { useMemo, useState, useTransition } from "react"
import { Ban, BadgeCheck, Search, ShieldCheck, ShoppingBag, Store, Users, UserCheck } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { setUserBlocked } from "./actions"

type Role = "customer" | "vendor" | "admin"
type Status = "all" | "active" | "blocked"

export type UserRow = {
    id: string
    name: string
    email: string
    image: string | null
    role: Role
    blocked: boolean
    emailVerified: boolean
    createdAt: string | null
}

const ROLE_META: Record<Role, { label: string; icon: typeof Users; tone: string }> = {
    customer: { label: "Customer", icon: ShoppingBag, tone: "#2F6B3A" },
    vendor: { label: "Vendor", icon: Store, tone: "#C77B12" },
    admin: { label: "Admin", icon: ShieldCheck, tone: "#E8452C" },
}
const ROLES: Role[] = ["customer", "vendor", "admin"]

export default function UsersManager({
    users: initial,
    currentEmail,
}: {
    users: UserRow[]
    currentEmail: string
}) {
    const [users, setUsers] = useState(initial)
    const [query, setQuery] = useState("")
    const [role, setRole] = useState<Role | "all">("all")
    const [status, setStatus] = useState<Status>("all")
    const [pending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

    const counts = useMemo(() => {
        const c = { all: users.length, customer: 0, vendor: 0, admin: 0, blocked: 0 }
        users.forEach((u) => {
            c[u.role]++
            if (u.blocked) c.blocked++
        })
        return c
    }, [users])

    // const shown = useMemo(() => {
    //     const q = query.trim().toLowerCase()
    //     return users.filter(
    //         (u) =>
    //             (role === "all" || u.role === role) &&
    //             (status === "all" || (status === "blocked") === u.blocked) &&
    //             (!q || u.name.toLowerCase().includes(q) || u.email.includes(q)),
    //     )
    // }, [users, query, role, status])
    const shown = useMemo(() => {
        const q = query.trim().toLowerCase()

        return users
            .filter(
                (u) =>
                    (role === "all" || u.role === role) &&
                    (status === "all" || (status === "blocked") === u.blocked) &&
                    (!q || u.name.toLowerCase().includes(q) || u.email.includes(q)),
            )
            // Your own admin row always stays first; everyone else keeps their order
            .sort((a, b) => Number(b.email === currentEmail) - Number(a.email === currentEmail))
    }, [users, query, role, status, currentEmail])

    function toggle(user: UserRow) {
        const next = !user.blocked
        setMessage(null)
        setUsers((l) => l.map((u) => (u.email === user.email ? { ...u, blocked: next } : u)))

        startTransition(async () => {
            const res = await setUserBlocked(user.email, next)
            if (!res.ok) {
                setUsers((l) => l.map((u) => (u.email === user.email ? { ...u, blocked: !next } : u)))
                setMessage({ text: res.error ?? "Failed", error: true })
            } else {
                setMessage({
                    text: `${user.name || user.email} was ${next ? "blocked" : "unblocked"}`,
                    error: false,
                })
            }
        })
    }

    const tiles: { key: Role | "all"; label: string; icon: typeof Users; tone: string }[] = [
        { key: "all", label: "All users", icon: Users, tone: "#1F2A1F" },
        ...ROLES.map((r) => ({ key: r, label: ROLE_META[r].label + "s", icon: ROLE_META[r].icon, tone: ROLE_META[r].tone })),
    ]

    const chips: { key: Status; label: string }[] = [
        { key: "all", label: "Any status" },
        { key: "active", label: "Active" },
        { key: "blocked", label: `Blocked (${counts.blocked})` },
    ]

    return (
        <div className="space-y-6 p-6">
            <header>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#1F2A1F]/50">ADMIN</p>
                <h1 className="text-3xl font-extrabold text-[#1F2A1F]">Manage Users</h1>
                <p className="text-sm text-[#1F2A1F]/60">
                    See everyone on PizzaHub. Blocked users cannot use the dashboard.
                </p>
            </header>

            {/* Role filter tiles */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {tiles.map((t) => {
                    const active = role === t.key
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setRole(t.key)}
                            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-transparent bg-white shadow-md ring-2" : "border-[#1F2A1F]/10 bg-white/60 hover:bg-white"
                                }`}
                            style={active ? { ["--tw-ring-color" as string]: t.tone } : undefined}
                        >
                            <span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ background: t.tone }}>
                                <t.icon className="size-5" />
                            </span>
                            <span>
                                <span className="block text-2xl font-extrabold leading-none text-[#1F2A1F]">{counts[t.key]}</span>
                                <span className="text-xs text-[#1F2A1F]/60">{t.label}</span>
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Search + status chips */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#1F2A1F]/40" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or email"
                        className="h-11 rounded-xl bg-white pl-9"
                    />
                </div>

                <div className="flex rounded-xl bg-[#1F2A1F]/5 p-1">
                    {chips.map((c) => (
                        <button
                            key={c.key}
                            type="button"
                            onClick={() => setStatus(c.key)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${status === c.key ? "bg-white text-[#1F2A1F] shadow-sm" : "text-[#1F2A1F]/50 hover:text-[#1F2A1F]"
                                }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <p
                    role="status"
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${message.error ? "bg-red-50 text-red-700" : "bg-[#2F6B3A]/10 text-[#2F6B3A]"
                        }`}
                >
                    {message.text}
                </p>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#1F2A1F]/10 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#FFF8EC]">
                            <TableHead className="pl-5">User</TableHead>
                            <TableHead className="hidden md:table-cell">Joined</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="pr-5 text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {shown.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-sm text-[#1F2A1F]/50">
                                    No users match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {shown.map((u) => {
                            const isMe = u.email === currentEmail
                            const meta = ROLE_META[u.role]
                            return (
                                <TableRow
                                    key={u.id}
                                    className={
                                        u.blocked
                                            ? "bg-red-50/50"
                                            : isMe
                                                ? "bg-[#E8452C]/5"
                                                : undefined
                                    }
                                >

                                    <TableCell className="pl-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className={`size-10 ${u.blocked ? "grayscale" : ""}`}>
                                                {u.image && <AvatarImage src={u.image} alt="" />}
                                                <AvatarFallback className="bg-[#E8452C]/15 font-bold text-[#E8452C]">
                                                    {(u.name || u.email).charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="flex items-center gap-1.5 truncate font-semibold text-[#1F2A1F]">
                                                    {u.name || "No name"}
                                                    {u.emailVerified && <BadgeCheck className="size-4 text-[#2F6B3A]" />}
                                                    {isMe && <Badge variant="outline">You</Badge>}
                                                </p>
                                                <p className="truncate text-xs text-[#1F2A1F]/60">{u.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="hidden text-sm text-[#1F2A1F]/60 md:table-cell">
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                                            style={{ background: meta.tone }}
                                        >
                                            <meta.icon className="size-3.5" />
                                            {meta.label}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        {u.blocked ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                                                <Ban className="size-3.5" /> Blocked
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2F6B3A]">
                                                <UserCheck className="size-3.5" /> Active
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* <TableCell className="pr-5 text-right">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isMe || pending}
                      onClick={() => toggle(u)}
                      title={isMe ? "You cannot block yourself" : undefined}
                      className={
                        u.blocked
                          ? "rounded-lg bg-[#2F6B3A] font-bold text-white hover:bg-[#245530]"
                          : "rounded-lg bg-[#B3261E] font-bold text-white hover:bg-[#8F1D17]"
                      }
                    >
                      {u.blocked ? (
                        <><UserCheck className="size-4" /> Unblock</>
                      ) : (
                        <><Ban className="size-4" /> Block</>
                      )}
                    </Button>
                  </TableCell> */}
                                    <TableCell className="pr-5 text-right">
                                        {isMe ? (
                                            <span className="text-xs font-medium text-[#1F2A1F]/40">
                                                Your own account
                                            </span>
                                        ) : (
                                            <div
                                                role="group"
                                                aria-label={`Block or unblock ${u.name || u.email}`}
                                                className={`ml-auto flex w-fit rounded-xl bg-[#1F2A1F]/5 p-1 ${pending ? "opacity-60" : ""
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    disabled={pending}
                                                    aria-pressed={!u.blocked}
                                                    onClick={() => u.blocked && toggle(u)}
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${!u.blocked
                                                        ? "bg-[#2F6B3A] text-white shadow-sm"
                                                        : "text-[#1F2A1F]/50 hover:text-[#2F6B3A]"
                                                        }`}
                                                >
                                                    <UserCheck className="size-3.5" />
                                                    Unblock
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={pending}
                                                    aria-pressed={u.blocked}
                                                    onClick={() => !u.blocked && toggle(u)}
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${u.blocked
                                                        ? "bg-[#B3261E] text-white shadow-sm"
                                                        : "text-[#1F2A1F]/50 hover:text-[#B3261E]"
                                                        }`}
                                                >
                                                    <Ban className="size-3.5" />
                                                    Block
                                                </button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <p className="text-xs text-[#1F2A1F]/50">
                Showing {shown.length} of {users.length} users.
            </p>
        </div>
    )
}