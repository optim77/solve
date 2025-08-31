import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";

export interface Credits {
    id: string;
    credits: number;
    price: number;
}

export const useCredits = () => {
    const [credits, setCredits] = useState<Credits[]>([]);
    const [loadingCredits, setLoadingCredits] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("credits")
                .select("id, credits, price")
                .order("price", { ascending: true });

            if (error) {
                console.error("Supabase error:", error.message);
            } else {
                setCredits(data);
            }

            setLoadingCredits(false);
        }
        fetchPlans();
    }, []);


    return { credits, loadingCredits };

}