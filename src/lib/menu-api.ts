const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// export async function createMenuItem(formData: FormData) {
//   const res = await fetch(`${BASE_URL}/menu`, {
//     method: "POST",
//     body: formData,
//   });

//   const result = await res.json().catch(() => null);

//   console.log("Backend response:", result);

//   if (!res.ok) {
//     throw new Error(
//       result?.message || `Request failed: ${res.status}`
//     );
//   }

//   return result;
// }

export async function createMenuItem(formData: FormData) {
  const res = await fetch(`${BASE_URL}/menu`, {
    method: "POST",
    body: formData,
  })

  const result = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(result?.message || "Failed to create menu item")
  }

  return result
}




