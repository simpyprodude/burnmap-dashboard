import Stripe from 'stripe'
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PLAN_PRICES = {
  indie: process.env.STRIPE_PRICE_INDIE,
  team:  process.env.STRIPE_PRICE_TEAM,
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.formData()
  const plan = body.get('plan')

  const priceId = PLAN_PRICES[plan]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?upgraded=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    metadata: { plan },
  })

  return NextResponse.redirect(session.url, 303)
}
