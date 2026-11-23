import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/core/server';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const FALLBACK_ORIGIN = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
const PLANS_PATH = '/dashboard/vendor/subscription'

export async function POST() {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin') || FALLBACK_ORIGIN

    const userSession = await getSession()

    // A payment with no signed-in user could never be linked to an account,
    // so send the visitor to sign in before creating a Stripe session.
    if (!userSession?.user?.email) {
      return NextResponse.redirect(`${origin}/sign-in`, 303)
    }

    // Only vendor accounts can buy a vendor subscription.
    // Customers and admins are sent back to their dashboard.
    const role = (userSession.user as { role?: string }).role
    if (role !== 'vendor') {
      return NextResponse.redirect(`${origin}/dashboard`, 303)
    }

    // Already Premium: a second checkout must never be started.
    const token = userSession.session?.token

    if (!token) {
      return NextResponse.redirect(`${origin}/sign-in`, 303)
    }

    const planRes = await fetch(
      `${API}/subscription/${encodeURIComponent(userSession.user.email)}`,
      {
        cache: 'no-store',
        headers: { authorization: `Bearer ${token}` },
      }
    ).catch(() => null)

    if (!planRes?.ok) {
      return NextResponse.redirect(`${origin}${PLANS_PATH}?error=plan`, 303)
    }

    const plan = await planRes.json().catch(() => null)

    if (plan?.premium) {
      return NextResponse.redirect(`${origin}${PLANS_PATH}?error=already-premium`, 303)
    }

    // The backend creates the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: 'price_1Udy1AHbDck1wPxh6F5rdr7H',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userSession.user.email,
      metadata: {
        userId: userSession.user.id,
      },
      success_url: `${origin}${PLANS_PATH}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${PLANS_PATH}/cancel`,
      // Provide a name (for example, hosted_web_0001) to label this Checkout integration and measure its conversion independently
      integration_identifier: 'pizzahub_web_001',
    });
    return NextResponse.redirect(session.url as string, 303)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
