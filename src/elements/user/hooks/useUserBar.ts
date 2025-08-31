import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";

interface Profile {
    name: string;
    credits: number;
}

export const useUserBar = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showPlans, setShowPlans] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("name, credits")
                .eq("user_id", user.id)
                .single();

            if (!error && data) {
                setProfile({
                    name: data.name || user.email || "Anonymous",
                    credits: data.credits ?? 0,
                });
            }

            setLoading(false);
        };

        fetchUser();
    }, []);

    return { profile, loading, setShowSettings, showSettings, setShowPlans, showPlans };
}