"use client"

import { Users, CheckSquare, Receipt, FileText, Zap, Ship, Anchor } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

type QuickAction = {
    title: string
    icon: React.ReactNode
    onClick: () => void
    color: string
}

export function QuickActionsCard() {
    const router = useRouter()

    const quickActions: QuickAction[] = [
        {
            title: "Müşteri Ekle",
            icon: <Users className="h-5 w-5" />,
            onClick: () => router.push("/customers/add"),
            color: "bg-muted hover:bg-primary/10 text-foreground border-border transition-all"
        },
        {
            title: "Görev Oluştur",
            icon: <CheckSquare className="h-5 w-5" />,
            onClick: () => router.push("/tasks/add"),
            color: "bg-muted hover:bg-primary/10 text-foreground border-border transition-all"
        },
        {
            title: "Fatura Ekle",
            icon: <Receipt className="h-5 w-5" />,
            onClick: () => router.push("/demo-requests"),
            color: "bg-muted hover:bg-primary/10 text-foreground border-border transition-all"
        },
        {
            title: "Belge Yükle",
            icon: <FileText className="h-5 w-5" />,
            onClick: () => router.push("/documents"),
            color: "bg-muted hover:bg-primary/10 text-foreground border-border transition-all"
        },
        {
            title: "Gemi Ekle",
            icon: <Ship className="h-5 w-5" />,
            onClick: () => router.push("/ships"),
            color: "bg-muted hover:bg-primary/10 text-foreground border-border transition-all"
        },
        {
            title: "Operasyon",
            icon: <Anchor className="h-5 w-5" />,
            onClick: () => router.push("/operations"),
            color: "bg-muted hover:bg-primary/10 text-foreground border-border transition-all"
        }
    ]

    return (
        <Card className="h-full !py-3 !gap-3">
            <CardHeader className="!px-4 !pb-1 pt-2">
                <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-[16px]">Hızlı İşlemler</CardTitle>
                </div>
                <div className="h-[1px] w-full bg-border" />
            </CardHeader>
            <CardContent className="!px-3 sm:!px-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${action.color}`}
                        >
                            {action.icon}
                            <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                                {action.title}
                            </span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
