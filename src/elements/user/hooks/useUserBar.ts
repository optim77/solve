import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";
import toast from "react-hot-toast";
import { UserSubscription } from "@/elements/user/types/types";

export interface Profile {
    name: string;
    credits: number;
    months: number;
    active_sub: boolean;
}

export interface UserPlan {
    id: string;
    name: string;
    price: number;
}

export const useUserBar = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [subscriptions, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
    const [credits, setCredits] = useState<number>(0);
    const [showPayments, setShowPayments] = useState(false);
    const [showPlans, setShowPlans] = useState(false);

    const { user } = useSupabaseUser();

    const fetchUser = async () => {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("name, credits, months, active_sub, plans:plan_id(id, name, price)")
            .eq("user_id", user.id)
            .single();

        if (!error && data) {
            setProfile({
                name: data.name || user.email || "Anonymous",
                credits: data.credits ?? 0,
                months: data.months,
                active_sub: data.active_sub,
            });
            if (data.plans) {
                setUserPlan(data.plans);

                await fetchSubscriptions(data.plans, data.active_sub);
            }

            setCredits(data.credits ?? 0);
        }

        setLoading(false);
    };
    const fetchSubscriptions = async (plan: UserPlan, activeSub: boolean) => {
        if (!plan || !activeSub) return;

        const { data, error } = await createClient()
            .from("plans")
            .select("id, name, price, description")
            .eq("id", plan.id)
            .single();

        if (error || !data) {
            toast.error("Something went wrong! Try again");
            return;
        }

        setSubscription(data);
        setLoadingSubscriptions(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const decreaseCredits = async () => {
        try {
            if (!user || credits === undefined) return null;

            const supabase = createClient();
            const newCredits = Math.max(0, credits - 50);

            const { data, error } = await supabase
                .from("profiles")
                .update({ credits: newCredits })
                .eq("user_id", user.id)
                .select()
                .single();

            if (error) throw error;

            setCredits(newCredits);
            setProfile((prev) => (prev ? { ...prev, credits: newCredits } : prev));
            console.log("Credits updated:", data);

            return data;
        } catch (err) {
            console.error("Error decreasing credits:", err);
            return null;
        }
    };

    const handleManageSubscription = async () => {
        const res = await fetch("/api/create-portal-session", {
            method: "POST",
            body: JSON.stringify({ userId: user.id }),
        });

        const data = await res.json();
        window.location.href = data.url;
    };

    const buyCredits = async (packId: string, userId: string) => {
        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            body: JSON.stringify({ packId, userId }),
        });
        const { url } = await res.json();
        window.location.href = url;
    };

    return {
        profile,
        userPlan,
        subscriptions,
        loading,
        loadingSubscriptions,
        credits,
        setCredits,
        showPayments,
        setShowPayments,
        showPlans,
        setShowPlans,
        decreaseCredits,
        handleManageSubscription,
        buyCredits
    };
};
