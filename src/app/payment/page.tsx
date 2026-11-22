import { redirect } from "next/navigation"
import { getSession } from "@/lib/core/server"
import PaymentPage from "../components/PaymentPage"

export default async function Page() {
  const session = await getSession()
  

  if (!session?.user) redirect("/sign-in")

  const { id, name, email } = session.user

  return <PaymentPage customer={{ id, name, email }} />
}