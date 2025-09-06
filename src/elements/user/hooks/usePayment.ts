export const usePayment = () => {
    const handleCheckout = async (productId: string, type: "subscription" | "credits") => {
        try {
            const res = await fetch("/api/stripe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: productId,
                    type: type
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Checkout error:", error);
                return;
            }

            const { url } = await res.json();
            window.location.href = url;
        } catch (err) {
            console.error("Checkout exception:", err);
        }
    };

    return { handleCheckout };
}

