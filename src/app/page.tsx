import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AuthButton } from "@/components/auth/AuthButton";

export default function HomePage() {
    return (
        <>
            <main className="min-h-screen flex flex-col items-center">
                <div className="flex-1 w-full flex flex-col gap-20 items-center">
                    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                            <div className="flex gap-5 items-center font-semibold">
                                <div className="flex items-center gap-2">
                                </div>
                            </div>
                            <AuthButton/>
                        </div>
                    </nav>
                    <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
                        <main className="flex-1 flex flex-col gap-6 px-4">
                            <h1 className="text-4xl font-bold mb-4">Welcome to Solve</h1>
                            <p className="text-lg text-gray-600 mb-6">
                                Your personal AI assistant for everyday dilemmas.
                            </p>
                            <a
                                href="protected/chat"
                                className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                            >
                                Start Talking
                            </a>
                        </main>
                    </div>

                    <footer
                        className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                        <p>
                        Powered by Solve
                        </p>
                        <ThemeSwitcher />
                    </footer>
                </div>
            </main>

            {/*<Navbar />*/}
        </>
    );
}
