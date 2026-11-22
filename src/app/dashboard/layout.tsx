import { redirect } from "next/navigation"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getSession } from "@/lib/core/server"

import { DashboardSidebar } from "../components/DashboardSidebar"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // Read the session on the server so the sidebar knows the role immediately
  const session = await getSession()
  if (!session?.user?.email) redirect("/sign-in")

  const u = session.user as { name?: string; email?: string; role?: string }
  if ((session.user as { status?: string }).status === "blocked") redirect("/blocked")

  return (
    <SidebarProvider>
      <DashboardSidebar
        initialUser={{ name: u.name, email: u.email, role: u.role }}
      />
      <main className="min-w-0 flex-1 bg-[#FFF8EC] rounded-2xl">
        <div className="flex items-center">
        <SidebarTrigger />
        <Navbar></Navbar>
        </div>
        {children}
        <Footer></Footer>
      </main>
    </SidebarProvider>
  )
}

export default DashboardLayout