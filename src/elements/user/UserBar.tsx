"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";

interface Profile {
    name: string;
    credits: number;
}

export default function UserBar() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="sticky bottom-0 border-t pt-3 mt-3 flex items-center justify-center text-sm text-gray-400">
                Not logged in
            </div>
        );
    }

    return (
        <div className="sticky bottom-0 border-t pt-3 mt-3 flex items-center justify-between text-sm text-gray-700">
            <span className="font-medium text-white">{profile.name}</span>
            <span className="text-blue-600 font-bold">{profile.credits} credits</span>
        </div>
    );
}
