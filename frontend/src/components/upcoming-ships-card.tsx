"use client"

import { Ship, Clock, MapPin } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format, isAfter, subDays } from "date-fns"
import { tr } from "date-fns/locale"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"

type Ship = {
    id: string
    name: string
    imo: string
    eta: string
    port: string
    status: 'Beklemede' | 'Limanda' | 'Yolda' | 'Demirde' | 'Gecikmeli' | 'Acil' | 'Bilinmiyor'
    newTime?: string
}

export function UpcomingShipsCard() {
    const { ships, loading, error } = useSelector((state: RootState) => state.ship)

    // Yaklaşan gemileri filtrele (önümüzdeki 7 gün içinde gelecek olanlar)
    const upcomingShips = ships.filter(ship => {
        if (!ship.eta && !ship.newTime) return false

        const etaDate = new Date(ship.newTime || ship.eta)
        const today = new Date()
        const nextWeek = new Date()
        nextWeek.setDate(today.getDate() + 7)

        return isAfter(etaDate, today) && isAfter(nextWeek, etaDate)
    })


    const statusColors = {
        'Beklemede': 'bg-yellow-100 text-yellow-800',
        'Limanda': 'bg-green-100 text-green-800',
        'Yolda': 'bg-blue-100 text-blue-800',
        'Demirde': 'bg-purple-100 text-purple-800',
        'Gecikmeli': 'bg-orange-100 text-orange-800',
        'Acil': 'bg-red-100 text-red-800',
        'Bilinmiyor': 'bg-gray-100 text-gray-800'
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                        <Ship className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-lg">Yaklaşan Gemiler</CardTitle>
                    </div>
                    <div className="h-[1px] w-full bg-border mt-3" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-500">Veri yüklenirken bir hata oluştu: {error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                    <Ship className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Yaklaşan Gemiler</CardTitle>
                    <Badge variant="outline" className="ml-auto">
                        {loading ? '...' : upcomingShips.length}
                    </Badge>
                </div>
                <div className="h-[1px] w-full bg-border mt-3" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : upcomingShips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                        <Clock className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Önümüzdeki 7 gün içinde gelecek gemi bulunamadı</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingShips.slice(0, 5).map((ship: Ship) => {
                            const etaDate = new Date(ship.newTime || ship.eta)
                            return (
                                <div key={ship.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium">{ship.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{ship.port || 'Bilinmeyen Liman'}</span>
                                            </div>
                                        </div>
                                        <Badge className={statusColors[ship.status] || 'bg-gray-100 text-gray-800'}>
                                            {ship.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {format(etaDate, 'd MMMM yyyy HH:mm', { locale: tr })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
