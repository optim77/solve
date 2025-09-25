"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/superbase/client";
import type { User } from "@supabase/auth-js";

type SupabaseUserContextType = {
    user: User | null;
    loading: boolean;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
    user: null,
    loading: true,
});

export function SupabaseUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!error) setUser(data.user ?? null);
            setLoading(false);
        };

        getUser();

        const { data: subscription } = supabase.auth.onAuthStateChange(() => {
            getUser();
        });

        return () => subscription.subscription.unsubscribe();
    }, []);

    return (
        <SupabaseUserContext.Provider value={{ user, loading }}>
            {children}
        </SupabaseUserContext.Provider>
    );
}

export const useSupabaseUser = () => useContext(SupabaseUserContext);
