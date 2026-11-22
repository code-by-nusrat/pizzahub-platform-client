import { cache } from "react"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const readSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export const getSession = () => readSession()

export const getToken=async()=>{
    const session =await getSession()
    if(!session || !session.session?.token){
      redirect("/sign-in")
    }
    return session.session.token;
}


export const requireRole =async(role:string)=>{
    const session =await getSession()
    if(!session || session?.user.role !== role){
       redirect('/unauthorized')
    }
     if (session.user.status === "blocked") {
    redirect("/blocked")
  }
    return session;
}