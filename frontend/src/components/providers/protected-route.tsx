"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { clearError } from "@/redux/slices/authSlice";
import { Loading } from "@/components/ui/loading";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, isInitialized, error } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Oturum açılmadıysa login sayfasına yönlendir
    useEffect(() => {
        if (isInitialized && !loading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isInitialized, loading, isAuthenticated, router]);

    // Yükleme ekranı
    if (!isInitialized || loading) {
        return (
            <Loading />
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen px-4 max-w-md mx-auto space-y-4">
                <Alert variant="destructive" className="w-full border border-black bg-white text-black dark:bg-black dark:text-white dark:border-white">
                    <AlertDescription>{error || "Hata oluştu! Lütfen tekrar deneyin."}</AlertDescription>
                </Alert>
                <Button
                    variant="outline"
                    onClick={() => {
                        dispatch(clearError());
                        router.replace("/login");
                    }}
                    className="w-full border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                    Tekrar Giriş Yap
                </Button>
            </div>
        );
    }

    // Oturum açıldıysa children döndür
    return <>{children}</>;
}
