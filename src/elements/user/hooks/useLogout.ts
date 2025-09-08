import { createClient } from "@/lib/superbase/client";
import { useRouter } from "next/navigation";

export const useLogout = () => {
    const router = useRouter();

    const logout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    return { logout };
}