import { useEffect, useState } from "react";
import { Purchase, UserSubscription } from "@/elements/user/types/types";
import { createClient } from "@/lib/superbase/client";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";
import toast from "react-hot-toast";

export const usePayments = (planId?: string, activeSub?: boolean) => {

    const [payments, setPayments] = useState<Purchase[]>([]);
    const [subscriptions, setSubscription] = useState<UserSubscription>();
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
    const { user } = useSupabaseUser();

    const fetchPurchases = async () => {
        if (!user) return;

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
            .order("created_at", { ascending: false })
            .eq("user_id", user.id);

        if (error || !data) {
            toast.error("Something went wrong! Try again");
            throw new Error(error?.message);
        }

        setPayments(data);
        setLoadingPayments(false);
    };

    const fetchSubscriptions = async () => {
        if (planId && activeSub){
            const { data, error } = await createClient()
                .from("plans")
                .select('id, name, price, description')
                .eq("id", planId)
                .single();
            if (error || !data) {
                toast.error("Something went wrong! Try again");
                throw new Error(error?.message);
            }
            setSubscription(data);
            setLoadingSubscriptions(false);
        }


    };

    useEffect(() => {
        fetchPurchases();
        fetchSubscriptions();
    }, [user]);

    return { payments, subscriptions, loadingPayments, loadingSubscriptions };

}