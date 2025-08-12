import { ClerkProvider } from "@clerk/nextjs";
import '@/app/globals.css';
import { Toaster } from "react-hot-toast";
import UserInit from "@/components/UserInit";

export const metadata = {
    title: "Solve",
    description: "AI assistant for everyday dilemmas",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body>
                <Toaster position="top-center" />
                <UserInit />
                {children}
            </body>
            </html>
        </ClerkProvider>
    );
}
