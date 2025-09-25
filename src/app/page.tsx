import { AuthButton } from "@/components/auth/AuthButton";
import SplitText from "@/elements/landing/SplitText";
import RotatingText from "@/elements/landing/RotatingText";
import { ArrowRight, ChevronRight } from "lucide-react";

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
                            <h1 className="text-4xl font-bold mb-4">
                                <SplitText
                                    text="Welcome to Solve!"
                                    className="text-7xl font-semibold text-center"
                                    delay={50}
                                    duration={0.6}
                                    ease="power3.out"
                                    splitType="chars"
                                    from={{opacity: 0, y: 40}}
                                    to={{opacity: 1, y: 0}}
                                    threshold={0.1}
                                    rootMargin="-100px"
                                    textAlign="center"
                                />

                            </h1>
                            <p className="text-lg text-gray-300 mb-6">
                                Your personal AI assistant for everyday problems.
                                <br/>
                                Create and solve problem with the best LLM models and custom pre-prompts.
                                <br/>
                                Custom communication with models with the way you like.
                            </p>
                            <a
                                href="protected/chat"
                                className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-800"
                            >
                                <div className="flex items-center gap-2">

                                    Start Talking <ChevronRight />
                                </div>
                            </a>

                            <div className="flex text-7xl mt-50">
                                <p className="mr-2">
                                    Create with the best
                                </p>
                                <p>
                                    <RotatingText
                                        texts={['Teacher', 'Artist', 'Advisor', 'Researcher', 'Friend']}
                                        mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                                        staggerFrom={"last"}
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "-100%" }}
                                        staggerDuration={0.025}
                                        splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                        rotationInterval={2000}
                                    />
                                </p>

                            </div>

                        </main>
                    </div>

                </div>
            </main>

        </>
    );
}
