// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
    title: "Solve",
    description: "AI assistant for everyday dilemmas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body>{children}</body>
            </html>
        </ClerkProvider>
    );
}
