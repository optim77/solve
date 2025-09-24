import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GET() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card className="justify-center">
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Thank you for signing up!
                            </CardTitle>
                            <CardDescription>Your account is verified</CardDescription>
                        </CardHeader>
                        <CardContent>

                            <Button>
                                <a href="/auth/login">Go to login page</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}