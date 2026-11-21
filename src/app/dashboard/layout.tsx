import { redirect } from "next/navigation"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getSession } from "@/lib/core/server"

import { DashboardSidebar } from "../components/DashboardSidebar"

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // Read the session on the server so the sidebar knows the role immediately
  const session = await getSession()
  if (!session?.user?.email) redirect("/sign-in")

  const u = session.user as { name?: string; email?: string; role?: string }

  return (
    <SidebarProvider>
      <DashboardSidebar
        initialUser={{ name: u.name, email: u.email, role: u.role }}
      />
      <main className="min-w-0 flex-1 bg-[#FFF8EC] rounded-2xl">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}

export default DashboardLayout