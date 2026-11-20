const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

interface OrderData {
        [key: string]: unknown
}

export async function  placeOrder(data: OrderData): Promise<unknown>{
    const response =await fetch(`${BASE_URL}/orders`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    })
    return response.json()
}