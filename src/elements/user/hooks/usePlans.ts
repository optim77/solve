import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
}

export const usePlans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loadingPlan, setLoadingPlan] = useState(true);

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

            setLoadingPlan(false);
        }
        fetchPlans();
    }, []);


    return { plans, loadingPlan };

}