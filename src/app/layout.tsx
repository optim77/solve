import '@/app/globals.css';
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "next-themes";
import { SupabaseUserProvider } from "@/components/superbase/SupabaseUserProvider";

export const metadata = {
    title: "Solve",
    description: "AI assistant for everyday dilemmas",
};

export default function RootLayout({children}: { children: React.ReactNode }) {

    return (
        <html lang="en">
            <body>
            <SupabaseUserProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <Toaster position="top-center"/>
                    {children}
            </ThemeProvider>
            </SupabaseUserProvider>
            </body>
        </html>
    );
}
