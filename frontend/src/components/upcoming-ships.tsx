"use client"

import { Clock, Ship } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface UpcomingShip {
    imo: string
    name: string
    eta: string
    port: string
    status: string
}

export default function UpcomingShips() {
    // Example data - should be replaced with actual data from API
    const upcomingShips: UpcomingShip[] = [
        {
            imo: "9876543",
            name: "MV Starlight",
            eta: "2025-07-16T14:30:00",
            port: "İstanbul Limanı",
            status: "Yaklaşan"
        },
        {
            imo: "1234567",
            name: "SS Horizon",
            eta: "2025-07-18T09:45:00",
            port: "İzmir Limanı",
            status: "Yaklaşan"
        }
    ]

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Yaklaşan Gemi Hareketleri
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gemi Adı</TableHead>
                            <TableHead>IMO</TableHead>
                            <TableHead>ETA</TableHead>
                            <TableHead>Port</TableHead>
                            <TableHead>Durum</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {upcomingShips.map((ship) => (
                            <TableRow key={ship.imo}>
                                <TableCell>{ship.name}</TableCell>
                                <TableCell>{ship.imo}</TableCell>
                                <TableCell>
                                    {formatDistanceToNow(new Date(ship.eta), {
                                        addSuffix: true,
                                        locale: tr
                                    })}
                                </TableCell>
                                <TableCell>{ship.port}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        {ship.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
