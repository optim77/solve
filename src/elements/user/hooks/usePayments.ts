import { useEffect, useState } from "react";
import { Purchase } from "@/elements/user/types/types";
import { createClient } from "@/lib/superbase/client";
import { useSupabaseUser } from "@/components/superbase/SupabaseUserProvider";
import toast from "react-hot-toast";

export const usePayments = () => {

    const [payments, setPayments] = useState<Purchase[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(true);
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

    useEffect(() => {
        fetchPurchases();
    }, [user]);

    return { payments, loadingPayments };

}