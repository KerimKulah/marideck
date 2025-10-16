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
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
                </div>
                <div className="h-[1px] w-full bg-border mt-3" />
            </CardHeader>
            <CardContent className="space-y-2">
                {quickActions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant}
                        className="w-full justify-start items-center gap-2"
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
