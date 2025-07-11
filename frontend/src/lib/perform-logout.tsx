import api from "@/api/axios";
import { useRouter } from "next/navigation";

export async function performLogout() {
    const router = useRouter();
    try {
        await api.post('/auth/logout');
    } catch {
    } finally { 
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common["Authorization"];
        router.replace("/login");
    }
}