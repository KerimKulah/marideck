"use client"
import { SidebarProvider } from "@/components/ui/sidebar";
import InitUser from "@/components/providers/init-user";
import ProtectedRoute from "@/components/providers/protected-route";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <InitUser>
                <ChatbotButton />
                <ProtectedRoute>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <Header />
                            <main className="p-4 md:p-6">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                </ProtectedRoute>
            </InitUser>
        </>
    )
}