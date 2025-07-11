import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ProtectedRoute from "@/components/providers/protected-route"
import InitUser from "@/components/providers/init-user"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <InitUser>
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