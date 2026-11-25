import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "./components/CardDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PizzaHub — Hot & Fresh Pizza Delivered",
    template: "%s | PizzaHub",
  },
  description:
    "Browse approved pizzas, sides and desserts from local kitchens, order with a delivery date and address, and track every order on PizzaHub.",
};

const THEME_SCRIPT = `try{if(localStorage.getItem("pizzahub-theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <CartProvider>
        {children}
        <CartDrawer/>
        </CartProvider>
        <ToastContainer></ToastContainer>
      </body>
    </html>
  );
}
