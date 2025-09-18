import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";

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
    const [userPlan, setUserPlan] = useState<UserPlan>();
    const [loading, setLoading] = useState(true);
    const [showPayments, setShowPayments] = useState(false);
    const [showPlans, setShowPlans] = useState(false);
    const [credits, setCredits] = useState<number>();
    const {user} = useSupabaseUser();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();

            const {data: {user}} = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const {data, error} = await supabase
                .from("profiles")
                .select("name, credits, months, active_sub, plans:plan_id(id, name, price)")
                .eq("user_id", user.id)
                .single();
            console.log(data);
            if (!error && data) {
                setProfile({
                    name: data.name || user.email || "Anonymous",
                    credits: data.credits ?? 0,
                    months: data.months,
                    active_sub: data.active_sub,
                });
                if (data.plans) {
                    setUserPlan(data.plans[0]);
                }

                setCredits(data.credits);
            }

            setLoading(false);
        };

        fetchUser();
    }, []);

    const decreaseCredits = async () => {
        try {
            if (user && credits !== undefined) {
                const supabase = createClient();
                const newCredits = Math.max(0, credits - 50);

                const {data, error} = await supabase
                    .from("profiles")
                    .update({credits: newCredits})
                    .eq("user_id", user.id)
                    .select()
                    .single();

                if (error) throw error;
                console.log(newCredits);
                setCredits(newCredits);
                setProfile((prev) => prev ? {...prev, credits: newCredits} : prev);

                console.log("Credits updated:", data);
                return data;
            }
        } catch (err) {
            console.error("Error decreasing credits:", err);
            return null;
        }
    };

    return {
        profile,
        userPlan,
        loading,
        setShowPayments,
        showPayments,
        setShowPlans,
        showPlans,
        credits,
        setCredits,
        decreaseCredits
    };
}