import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'AI Psycholog',
    description: 'Twój prywatny AI mentor do codziennych dylematów',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl">
        <body className={inter.className}>{children}</body>
        </html>
    )
}
