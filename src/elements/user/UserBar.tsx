"use client";

import { createPortal } from "react-dom";
import { useUserBar } from "@/elements/user/hooks/useUserBar";
import { usePlans } from "@/elements/user/hooks/usePlans";
import { useState } from "react";
import { useCredits } from "@/elements/user/hooks/useCredits";
import { usePayment } from "@/elements/user/hooks/usePayment";
import PlansModal from "@/elements/user/elements/PlansModal";
import { Item } from "@/elements/user/types/types";
import { usePayments } from "@/elements/user/hooks/usePayments";

export default function UserBar() {
    const { profile, loading, setShowSettings, showSettings, setShowPlans, showPlans } = useUserBar();
    const { payments, subscriptions } = usePayments();
    const { plans, loadingPlans } = usePlans();
    const { credits, loadingCredits } = useCredits();
    const { handleCheckout } = usePayment();
    const [item, setItem] = useState<Item>("subscription");

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="sticky bottom-0 border-t pt-3 mt-3 flex items-center justify-center text-sm text-gray-400">
                Not logged in
            </div>
        );
    }

    return (
        <>
            <div className="sticky bottom-0 border-t pt-3 mt-3 flex items-center justify-between text-sm text-gray-700">
                <span
                    className="font-medium text-white cursor-pointer hover:underline"
                    onClick={() => setShowSettings(true)}
                >
                    {profile.name}
                </span>
                <span
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => setShowPlans(true)}
                >
                    {profile.credits} credits
                </span>
            </div>

            {showSettings && createPortal(
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
                    onClick={() => setShowSettings(false)}
                >
                    <div
                        className=" border-3 rounded-2xl shadow-lg w-96 p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Ustawienia</h2>
                        <p>Tu w przyszłości możesz dać np. zmianę hasła, avatar itp.</p>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <PlansModal
                show={showPlans}
                onClose={() => setShowPlans(false)}
                item={item}
                setItem={setItem}
                plans={plans}
                credits={credits}
                loadingPlans={loadingPlans}
                loadingCredits={loadingCredits}
                handleCheckout={handleCheckout}
            />
        </>
    );
}
