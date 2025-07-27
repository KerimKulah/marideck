"use client"

import { Plus, Ship, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

type QuickAction = {
    title: string
    icon: React.ReactNode
    onClick: () => void
    variant?: "default" | "outline"
}

export function QuickActionsCard() {
    const router = useRouter()

    const quickActions: QuickAction[] = [
        {
            title: "Gemi Ekle", 
            icon: <Ship className="h-4 w-4" />,
            onClick: () => router.push("/ships/add"),
            variant: "default"
        },
        {
            title: "Müşteri Ekle",
            icon: <Users className="h-4 w-4" />,
            onClick: () => router.push("/customers/add"),
            variant: "outline"
        },
        {
            title: "Demo İstekleri",
            icon: <Zap className="h-4 w-4" />,
            onClick: () => router.push("/demo-requests"),
            variant: "outline"
        }
    ]

    return (
        <Card className="h-full max-h-[293px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
                {quickActions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant}
                        className="w-full justify-start gap-2"
                        onClick={action.onClick}
                    >
                        {action.icon}
                        {action.title}
                    </Button>
                ))}
            </CardContent>
        </Card>
    )
}
