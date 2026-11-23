// import { cache } from "react"
// import { headers } from "next/headers"

// import { auth } from "@/lib/auth"
// import { redirect } from "next/navigation"

// const readSession = cache(async () => {
//   return auth.api.getSession({ headers: await headers() })
// })

// export const getSession = () => readSession()

// export const getToken=async()=>{
//     const session =await getSession()
//     if(!session || !session.session?.token){
//       redirect("/unauthorized")
//     }
//     return session.session.token;
// }


// export const requireRole =async(role:string)=>{
//     const session =await getSession()
//     if(!session || session?.user.role !== role){
//        redirect('/unauthorized')
//     }
//      if (session.user.status === "blocked") {
//     redirect("/blocked")
//   }
//     return session;
// }
// export const authfetch =async (api:string)=>{
//     const token =await getToken();
//     const res =await fetch(api,{
//         headers:{
//             authorization: `Bearer ${token}`
//         }
//     })
//     return res;
// }


import { cache } from "react"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const readSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export const getSession = () => readSession()

export const getToken = async () => {
  const session = await getSession()
  if (!session || !session.session?.token) {
    redirect("/unauthorized")
  }
  return session.session.token
}
export const protedMutation = async (api: string, method: string, data?: unknown) => {
    const token=await getToken()
    const res =await fetch(api,{
        method:method,
        headers:{
            'content-type':'application/json',
            authorization: `Bearer ${token}`
        },
        body:data? JSON.stringify(data):null
    })
    return res;
}

export const requireRole = async (role: string) => {
  const session = await getSession()
  if (!session || session?.user.role !== role) {
    redirect("/unauthorized")
  }
  if (session.user.status === "blocked") {
    redirect("/blocked")
  }
  return session
}

// Sends the token AND keeps method / body / other options
export const authfetch = async (api: string, init: RequestInit = {}) => {
  const token = await getToken()
  const headersObj = new Headers(init.headers)
  headersObj.set("authorization", `Bearer ${token}`)
  return fetch(api, { cache: "no-store", ...init, headers: headersObj })
}

