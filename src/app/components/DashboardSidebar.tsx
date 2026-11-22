"use client"

// PizzaHub dashboard sidebar: floating card style.
// Needs the shadcn sidebar:  npx shadcn@latest add sidebar
// Rendered inside <SidebarProvider> by src/app/dashboard/layout.tsx, which
// passes the server session as initialUser so the right role shows immediately.
//
// KEEP ONLY ONE COPY of this file in the project.

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    CirclePlus,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Settings,
    ShoppingBag,
    Sparkles,
    Store,
    UtensilsCrossed,
    Users,
    type LucideIcon,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useSession, signOut } from "@/lib/auth-client"

// 1) Roles and menu item shape
type Role = "admin" | "customer" | "vendor"

type DashboardMenuItem = {
    id: string
    name: string
    url: string
    icon: LucideIcon
}

export type SidebarUser = {
    name?: string | null
    email?: string | null
    role?: string | null
}

// 2) Menu items for each role.
// Every url must match a real folder under src/app/dashboard.
const menuItemsByRole: Record<Role, DashboardMenuItem[]> = {
    vendor: [
        { id: "vendor-overview", name: "Overview", url: "/dashboard/vendor/overview", icon: LayoutDashboard },
        { id: "vendor-menu-items", name: "My Menu Items", url: "/dashboard/vendor/menu", icon: UtensilsCrossed },
        { id: "vendor-add-menu-item", name: "Add Menu Item", url: "/dashboard/vendor/menu/new", icon: CirclePlus },
        { id: "vendor-customer-orders", name: "Customer Orders", url: "/dashboard/order", icon: ClipboardList },
        { id: "vendor-subscription", name: "Subscription", url: "/dashboard/vendor/subscription", icon: Sparkles },
    ],

    customer: [
        { id: "customer-overview", name: "Overview", url: "/dashboard/customer/overview", icon: LayoutDashboard },
        { id: "customer-orders", name: "My Orders", url: "/dashboard/customer/my-order", icon: ShoppingBag },
    ],

    admin: [
        { id: "admin-overview", name: "Overview", url: "/dashboard/admin/overview", icon: LayoutDashboard },
        { id: "admin-users", name: "Manage Users", url: "/dashboard/admin/manage-users", icon: Users },
        { id: "admin-vendors", name: "Manage Menu Items", url: "/dashboard/admin/manage-items", icon: Store },
        { id: "admin-orders", name: "Transactions", url: "/dashboard/admin/transactions", icon: ClipboardList },
    ],
}

// Profile settings are shared: the page detects the role and shows the right form.
const profileUrlByRole: Record<Role, string> = {
    vendor: "/dashboard/profile",
    customer: "/dashboard/profile",
    admin: "/dashboard/profile",
}

// 3) Styles
const menuButtonClass =
    "group/btn relative h-12 gap-3 rounded-xl px-2 text-[#1F2A1F]/70 transition-all " +
    "hover:bg-[#2F6B3A]/10 hover:text-[#1F2A1F] " +
    "data-[active=true]:bg-white data-[active=true]:font-bold " +
    "data-[active=true]:text-[#E8452C] data-[active=true]:shadow-sm " +
    "before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-1 " +
    "before:rounded-full before:bg-[#E8452C] before:opacity-0 " +
    "data-[active=true]:before:opacity-100"

const iconTileClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 transition-colors " +
    "group-data-[active=true]/btn:bg-[#E8452C] group-data-[active=true]/btn:text-white " +
    "group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:w-auto " +
    "group-data-[collapsible=icon]:bg-transparent"

const footerButtonClass =
    "h-10 rounded-xl px-3 text-[#1F2A1F]/70 hover:bg-black/5 hover:text-[#1F2A1F]"

const panelClass =
    "[&_[data-sidebar=sidebar]]:rounded-3xl [&_[data-sidebar=sidebar]]:border-[#1F2A1F]/10 [&_[data-sidebar=sidebar]]:bg-[#FFF8EC] [&_[data-sidebar=sidebar]]:text-[#1F2A1F] [&_[data-sidebar=sidebar]]:shadow-xl"

// 4) The sidebar
export function DashboardSidebar({ initialUser }: { initialUser?: SidebarUser }) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()

    // Keep the server and hydration snapshots aligned; switch to the live
    // session once the client has hydrated without setting state in an effect.
    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false,
    )

    const liveUser = session?.user as SidebarUser | undefined
    const user = (mounted ? liveUser ?? initialUser : initialUser) as
        | SidebarUser
        | undefined

    const rawRole = user?.role
    const role: Role =
        rawRole === "admin" || rawRole === "vendor" || rawRole === "customer"
            ? rawRole
            : "customer"

    const items = menuItemsByRole[role]
    const displayName = user?.name || user?.email || "User"
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
    const profileUrl = profileUrlByRole[role]

    const handleSignOut = async () => {
        try {
            await signOut()
            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Sign out failed:", error)
        }
    }

    // No user known at all (should not happen inside the dashboard layout)
    if (!user) {
        return (
            <Sidebar variant="floating" collapsible="icon" className={panelClass}>
                <SidebarHeader className="p-3">
                    <div className="h-14 animate-pulse rounded-2xl bg-black/5" />
                </SidebarHeader>
                <SidebarContent className="gap-2 px-4 pt-4">
                    <div className="h-10 animate-pulse rounded-xl bg-black/5" />
                    <div className="h-10 animate-pulse rounded-xl bg-black/5" />
                    <div className="h-10 animate-pulse rounded-xl bg-black/5" />
                </SidebarContent>
            </Sidebar>
        )
    }

    return (
        <Sidebar variant="floating" collapsible="icon" className={panelClass}>
            {/* TOP: user card */}
            <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
                <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8452C]/15 text-base font-bold text-[#E8452C] group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:text-sm">
                        {displayName.charAt(0).toUpperCase()}
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#2F6B3A]" />
                    </span>

                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-bold">{displayName}</p>
                        <p className="truncate text-xs text-[#2F6B3A]">
                            {roleLabel} account
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            {/* MIDDLE: menu for this role */}
            <SidebarContent className="px-1">
                <SidebarGroup>
                    <SidebarGroupLabel className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#1F2A1F]/40 after:ml-3 after:h-px after:flex-1 after:bg-[#1F2A1F]/10">
                        WORKSPACE
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={pathname === item.url}
                                        tooltip={item.name}
                                        className={menuButtonClass}
                                        render={<Link href={item.url} />}
                                    >
                                        <span className={iconTileClass}>
                                            <item.icon className="h-4 w-4" />
                                        </span>
                                        <span>{item.name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* BOTTOM: promo card, profile settings, sign out */}
            <SidebarFooter className="gap-3 p-3">
                <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#E8452C]/40 bg-[#E8452C]/5 p-3 group-data-[collapsible=icon]:hidden">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                        <Sparkles className="h-4 w-4 text-[#E8452C]" />
                    </span>
                    <div>
                        <p className="text-sm font-bold leading-snug">
                            Made for the neighborhood.
                        </p>
                        <p className="mt-0.5 text-xs text-[#1F2A1F]/60">
                            Thanks for being part of PizzaHub.
                        </p>
                    </div>
                </div>

                <div className="h-px bg-[#1F2A1F]/10" />

                <SidebarMenu className="gap-1">
                    {/* <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Profile settings"
                            className={footerButtonClass}
                            render={<Link href={profileUrl} />}
                        >
                            <Settings />
                            <span>Profile settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem> */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={
                                role === "admin"
                                    ? "Profile settings are disabled for administrators"
                                    : "Profile settings"
                            }
                            disabled={role === "admin"}
                            className={`${footerButtonClass} ${role === "admin"
                                    ? "cursor-not-allowed opacity-40"
                                    : ""
                                }`}
                            render={
                                role === "admin"
                                    ? undefined
                                    : <Link href={profileUrl} />
                            }
                        >
                            <Settings />
                            <span>Profile settings</span>

                            {role === "admin" && (
                                <span className="ml-auto text-[10px] font-bold">
                                    Locked
                                </span>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sign out"
                            onClick={handleSignOut}
                            className="h-10 rounded-xl px-3 text-[#1F2A1F]/70 hover:bg-[#E8452C]/10 hover:text-[#E8452C]"
                        >
                            <LogOut />
                            <span>Sign out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}