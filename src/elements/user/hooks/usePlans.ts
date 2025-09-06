import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import { Plan } from "@/elements/user/types/types";

export const usePlans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("plans")
                .select("id, name, description, price")
                .order("price", { ascending: true });

            if (error) {
                console.error("Supabase error:", error.message);
            } else {
                setPlans(data);
            }

            setLoadingPlans(false);
        }
        fetchPlans();
    }, []);


    return { plans, loadingPlans };

}