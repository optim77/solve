import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";

export const useSupabaseUser = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data, error } = await createClient().auth.getUser();
            if (!error) setUser(data.user);
            setLoading(false);
        };

        getUser();

        const { data: subscription } = createClient().auth.onAuthStateChange(() => {
            getUser();
        });

        return () => subscription.subscription.unsubscribe();
    }, []);

    return { user, loading };
};
