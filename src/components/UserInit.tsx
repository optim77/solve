"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserInit() {
    const { isSignedIn } = useUser();

    useEffect(() => {
        if (isSignedIn) {
            fetch("/api/user/init", { method: "POST" })
                .catch(err => console.error("User init error:", err));
        }
    }, [isSignedIn]);

    return null;
}
