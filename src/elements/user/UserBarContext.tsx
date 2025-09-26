"use client"

import React, { createContext, useContext } from "react";
import { useUserBar } from "@/elements/user/hooks/useUserBar";


const UserBarContext = createContext<ReturnType<typeof useUserBar> | null>(null);

export const UserBarProvider = ({ children }: { children: React.ReactNode }) => {
    const value = useUserBar();
    return <UserBarContext.Provider value={value}>{children}</UserBarContext.Provider>;
};

export const useUserBarContext = () => {
    const ctx = useContext(UserBarContext);
    if (!ctx) throw new Error("useUserBarContext must be used within UserBarProvider");
    return ctx;
};
