import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  React.useEffect(() => {
    // Call backend to create payment intent when component mounts
    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000, // Amount in cents (e.g., $10.00)
        currency: 'usd',
        clientId: 'client_123',
        description: 'Test Payment',
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Failed to create payment');
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!stripe || !elements || !clientSecret) {
      setError('Stripe is not loaded or client secret missing');
      setLoading(false);
      return;
    }
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
    });
    if ('error' in result && result.error) {
      setError(result.error.message || 'Payment failed');
    } else if ('paymentIntent' in result && result.paymentIntent && typeof (result.paymentIntent as any).status === 'string' && (result.paymentIntent as any).status === 'succeeded') {
      setSuccess('Payment successful!');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {clientSecret ? (
        <PaymentElement />
      ) : (
        <div>Loading payment options...</div>
      )}
      <button type="submit" disabled={!stripe || loading || !clientSecret} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Processing...' : 'Pay $10'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-500 mt-2">{success}</div>}
    </form>
  );
}

export default function StripeCheckout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
