import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_INDIE]: 'indie',
  [process.env.STRIPE_PRICE_TEAM]:  'team',
}

// Next.js App Router — read raw body for Stripe signature verification
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.client_reference_id
      const customerId = session.customer
      const plan = session.metadata?.plan || 'indie'
      if (userId) {
        await supabase
          .from('profiles')
          .update({ plan, stripe_customer_id: customerId })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const priceId = sub.items?.data?.[0]?.price?.id
      const plan = PRICE_TO_PLAN[priceId]
      if (plan && sub.customer) {
        await supabase
          .from('profiles')
          .update({ plan })
          .eq('stripe_customer_id', sub.customer)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      if (sub.customer) {
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', sub.customer)
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
