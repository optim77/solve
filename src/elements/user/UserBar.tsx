"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/superbase/client";
import { createPortal } from "react-dom";

interface Profile {
    name: string;
    credits: number;
}

export default function UserBar() {
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
        <>
            <div className="sticky bottom-0 border-t pt-3 mt-3 flex items-center justify-between text-sm text-gray-700">
                <span
                    className="font-medium text-white cursor-pointer hover:underline"
                    onClick={() => setShowSettings(true)}
                >
                    {profile.name}
                </span>
                <span
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => setShowPlans(true)}
                >
                    {profile.credits} credits
                </span>
            </div>

            {showSettings && createPortal(
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
                    onClick={() => setShowSettings(false)}
                >
                    <div
                        className=" border-3 rounded-2xl shadow-lg w-96 p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Ustawienia</h2>
                        <p>Tu w przyszłości możesz dać np. zmianę hasła, avatar itp.</p>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {showPlans && createPortal(
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
                    onClick={() => setShowPlans(false)}
                >
                    <div
                        className=" border-3 rounded-2xl shadow-lg w-96 p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Plany subskrypcyjne</h2>
                        <p>Tu możesz wyświetlić dostępne plany i upgrade.</p>
                        <button
                            onClick={() => setShowPlans(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
