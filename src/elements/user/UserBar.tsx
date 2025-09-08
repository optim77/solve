"use client";

import { useUserBar } from "@/elements/user/hooks/useUserBar";
import { usePlans } from "@/elements/user/hooks/usePlans";
import { useState } from "react";
import { useCredits } from "@/elements/user/hooks/useCredits";
import { usePayment } from "@/elements/user/hooks/usePayment";
import PlansModal from "@/elements/user/elements/PlansModal";
import { Item } from "@/elements/user/types/types";
import { usePayments } from "@/elements/user/hooks/usePayments";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/elements/user/hooks/useLogout";
import { CreditCard, LogOut, Settings } from "lucide-react";
import { PaymentsModal } from "@/elements/user/elements/PaymentsModal";

export default function UserBar() {
    const { profile, loading, setShowPayments, showPayments, setShowPlans, showPlans } = useUserBar();
    const { logout } = useLogout();
    const { payments, subscriptions, loadingPayments, loadingSubscriptions } = usePayments(profile?.plans.id, profile?.active_sub);
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
                <DropdownMenu>
                    <DropdownMenuTrigger className="text-white cursor-pointer hover:underline">{profile.name}</DropdownMenuTrigger>
                    <DropdownMenuContent className="p-3">
                        <DropdownMenuItem onClick={() => setShowPayments(true)}><CreditCard /> Payments</DropdownMenuItem>
                        <DropdownMenuItem><Settings /> Settings</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => logout()}><LogOut /> Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <span
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => setShowPlans(true)}
                >
                    {profile.credits} credits
                </span>
            </div>

            <PaymentsModal
                show={showPayments}
                onClose={() => setShowPayments(false)}
                subscriptions={subscriptions}
                payments={payments}
                loadingPayment={loadingPayments}
                loadingSubscription={loadingSubscriptions}
            />

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
                activatedPlan={profile.plans.name}
            />
        </>
    );
}
