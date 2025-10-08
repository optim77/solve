    import { useCallback, useEffect, useState } from "react";
    import { createClient } from "@/lib/superbase/client";
    import { Credits } from "@/elements/user/types/types";

    export const useCredits = () => {
        const [creditsPlan, setCreditsPlan] = useState<Credits[]>([]);
        const [loadingCredits, setLoadingCredits] = useState(true);


        const fetchPlans = useCallback(async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("credits")
                .select("id, credits, price")
                .order("price", { ascending: true });

            if (error) {
                console.error("Supabase error:", error.message);
            } else {
                setCreditsPlan(data);
            }

            setLoadingCredits(false);
        }, []);


        useEffect(() => {
            fetchPlans();
        }, [fetchPlans]);

        return { creditsPlan, loadingCredits };

    }