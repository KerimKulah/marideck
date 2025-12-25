import api from "@/api/axios";
import { removeAccessToken } from "@/lib/access-token-store";
import { useRouter } from "next/navigation";

export async function performLogout() {
    const router = useRouter();
    try {
        await api.post('/auth/logout');
    } catch {
    } finally { 
        removeAccessToken();
        router.replace("/login");
    }
}