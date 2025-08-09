import Navbar from "@/components/Navbar";

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen flex items-center justify-center p-6">

                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Welcome to Solve</h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Your personal AI assistant for everyday dilemmas.
                    </p>
                    <a
                        href="/chat"
                        className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Start Talking
                    </a>
                </div>
            </main>
        </>

    )
}
