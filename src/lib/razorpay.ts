// Shared Razorpay Checkout client helper — dynamically loads checkout.js once and
// wraps it in a promise-based API so callers don't deal with the raw SDK callbacks.

export interface RazorpayCheckoutOptions {
    keyId: string;
    amountInPaise: number;
    currency: string;
    name: string;
    description: string;
    orderId: string;
    prefill: { name: string; email: string; contact: string };
}

export interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

type RazorpayWindow = Window & {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
};

function loadCheckoutScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if ((window as RazorpayWindow).Razorpay) return resolve();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load payment gateway. Check your connection and try again.'));
        document.head.appendChild(script);
    });
}

/** Resolves with the payment response on success, or rejects if the user dismisses the modal or payment fails. */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<RazorpaySuccessResponse> {
    await loadCheckoutScript();
    const RazorpayCtor = (window as RazorpayWindow).Razorpay;
    if (!RazorpayCtor) throw new Error('Payment gateway unavailable');

    return new Promise((resolve, reject) => {
        const instance = new RazorpayCtor({
            key: options.keyId,
            amount: options.amountInPaise,
            currency: options.currency,
            name: 'Ignite Room',
            description: options.description,
            order_id: options.orderId,
            prefill: options.prefill,
            theme: { color: '#ff3366' },
            handler: (response: RazorpaySuccessResponse) => resolve(response),
            modal: { ondismiss: () => reject(new Error('DISMISSED')) },
        });
        instance.open();
    });
}
