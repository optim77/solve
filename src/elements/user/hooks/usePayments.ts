import { useEffect, useState } from "react";
import { Purchase, Subscription } from "@/elements/user/types/types";
import { createClient } from "@/lib/superbase/client";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";

export const usePayments = () => {

    const [payments, setPayments] = useState<Purchase[]>([]);
    const [subscriptions, setSubscription] = useState<Subscription[]>([]);
    const { user } = useSupabaseUser();

    const fetchPurchases = async () => {
        const { data, error } = await createClient()
            .from("purchase")
            .select(`
              id,
              created_at,
              checkout_session_id,
              credits:credits_id (
                id,
                credits,
                price
              ),
              plans:plans_id (
                id,
                name,
                price
              )
            `)
            .eq("user_id", user.id);

        if (error || !data) throw new Error(error?.message);

        console.log("purchases", data);
        setPayments(data);
    };

    const fetchSubscriptions = async () => {
        const { data, error } = await createClient()
            .from("subscriptions")
            .select(`
              id,
              created_at,
              months,
              active,
              plans:plans (
                id,
                name,
                price,
                description
              )
            `)
            .eq("user_id", user.id)
            .eq("active", true);

        if (error || !data) throw new Error(error?.message);

        console.log("sub", data);
        setSubscription(data);
    };

    useEffect(() => {
        fetchPurchases();
        fetchSubscriptions();
    }, [user]);

    return { payments, subscriptions };

}