import { AuthButton } from "@/components/auth/AuthButton";
import SplitText from "@/elements/landing/SplitText";
import RotatingText from "@/elements/landing/RotatingText";
import { ChevronRight } from "lucide-react";

export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col items-center bg-black text-white">
            <div className="flex-1 w-full flex flex-col gap-12 sm:gap-20 items-center">
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                    <div className="w-full max-w-6xl flex justify-between items-center px-4 sm:px-6">
                        <div className="flex gap-5 items-center font-semibold">
                            <div className="flex items-center gap-2">{/* LOGO  */}</div>
                        </div>
                        <AuthButton />
                    </div>
                </nav>

                <div className="flex-1 flex flex-col gap-10 sm:gap-16 max-w-6xl w-full px-4 sm:px-8">
                    <section className="flex-1 flex flex-col items-center text-center gap-6">
                        <h1 className="font-bold leading-tight">
                            <SplitText
                                text="Welcome to Solve!"
                                className="text-3xl sm:text-5xl lg:text-7xl font-semibold"
                                delay={50}
                                duration={0.6}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                            />
                        </h1>

                        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl">
                            Your personal AI assistant for everyday problems.
                            <br />
                            Create and solve problems with the best LLM models and custom
                            pre-prompts.
                            <br />
                            Communicate with AI the way you like.
                        </p>

                        <a
                            href="/protected/chat"
                            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3
                         bg-white text-black rounded-lg
                         hover:bg-gray-200 transition"
                        >
                            Start Talking <ChevronRight />
                        </a>

                        <div className="flex flex-col sm:flex-row items-center justify-center text-3xl sm:text-5xl lg:text-7xl mt-10 gap-3 sm:gap-4">
                            <p className="mr-0 sm:mr-2 font-medium">Create with the best</p>
                            <RotatingText
                                texts={["Teacher", "Artist", "Advisor", "Researcher", "Friend"]}
                                mainClassName="px-2 sm:px-3 bg-cyan-300 text-black overflow-hidden py-1 sm:py-2 justify-center rounded-lg"
                                staggerFrom={"last"}
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "-100%" }}
                                staggerDuration={0.025}
                                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1"
                                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                rotationInterval={2000}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
