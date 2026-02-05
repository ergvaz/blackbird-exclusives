export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Environment check:', { 
  hasKey: !!process.env.STRIPE_SECRET_KEY,
  allEnvVars: Object.keys(process.env)
});
    const { items } = req.body;
    
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `${item.type} - Size ${item.size}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      body: new URLSearchParams({
        'success_url': `${req.headers.origin || 'https://blackbird-exclusives-okr7.vercel.app'}/?success=true`,
        'cancel_url': `${req.headers.origin || 'https://blackbird-exclusives-okr7.vercel.app'}/#/cart`,
        'mode': 'payment',
        ...lineItems.reduce((acc, item, i) => ({
          ...acc,
          [`line_items[${i}][price_data][currency]`]: item.price_data.currency,
          [`line_items[${i}][price_data][product_data][name]`]: item.price_data.product_data.name,
          [`line_items[${i}][price_data][product_data][description]`]: item.price_data.product_data.description,
          [`line_items[${i}][price_data][unit_amount]`]: item.price_data.unit_amount,
          [`line_items[${i}][quantity]`]: item.quantity,
        }), {})
      })
    });

    const session = await response.json();
    
    if (!response.ok) {
      throw new Error(session.error?.message || 'Stripe session creation failed');
    }

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message || 'Checkout failed' });
  }
}
