"use client"

import { Search, Plus, FileText, Ship, Anchor, Clock, AlertCircle, CheckCircle, XCircle, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Demo veriler
const operations = [
    {
        id: 1,
        shipName: "M/V Atlantic Star",
        imo: 9876543,
        port: "Ambarli",
        eta: "2025-06-22T08:00:00",
        etd: "2025-06-24T18:00:00",
        status: "devam",
        agencyType: "Full Agency",
        callSign: "ABCDE",
        flag: "Panama",
        shipType: "Container Ship",
        operator: "Mediterranean Shipping Company",
        berth: "AMB-3",
        atd: null,
        ata: "2025-06-22T08:30:00",
        reference: "OP-2025-001",
        services: {
            pilot: { status: 'completed' },
            tug: { status: 'pending' },
            bunker: { status: 'not_requested' },
            water: { status: 'requested' },
            waste: { status: 'not_requested' },
            cashMaster: { status: 'not_requested' }
        },
        documents: {
            arrivalNotice: true,
            manifest: true,
            bl: false,
            disbursementAccount: false
        },
        notes: [],
        cargo: {
            type: "Container",
            weight: "15,000 MT",
            quantity: "1,200 TEU"
        }
    },
    {
        id: 2,
        shipName: "M/V Pacific Dawn",
        imo: 8765432,
        port: "Haydarpasa",
        eta: "2025-06-25T10:00:00",
        etd: "2025-06-27T16:00:00",
        status: "planlama",
        agencyType: "Husbandry",
        callSign: "FGHIJ",
        flag: "Marshall Islands",
        shipType: "Bulk Carrier",
        operator: "Pacific Carriers",
        berth: "HD-5",
        atd: null,
        ata: null,
        reference: "OP-2025-002",
        services: {
            pilot: { status: 'not_requested' },
            tug: { status: 'not_requested' },
            bunker: { status: 'not_requested' },
            water: { status: 'not_requested' },
            waste: { status: 'not_requested' },
            cashMaster: { status: 'not_requested' }
        },
        documents: {
            arrivalNotice: false,
            manifest: false,
            bl: false,
            disbursementAccount: false
        },
        notes: [],
        cargo: {
            type: "Coal",
            weight: "75,000 MT",
            quantity: "N/A"
        }
    },
    {
        id: 3,
        shipName: "M/V Mediterranean Queen",
        imo: 7654321,
        port: "Diliskelesi",
        eta: "2025-06-20T14:00:00",
        etd: "2025-06-21T20:00:00",
        status: "tamamlandi",
        agencyType: "Protective Agency",
        callSign: "KLMNO",
        flag: "Liberia",
        shipType: "Crude Oil Tanker",
        operator: "Teekay Shipping",
        berth: "DIL-2",
        atd: "2025-06-21T19:45:00",
        ata: "2025-06-20T14:30:00",
        reference: "OP-2025-003",
        services: {
            pilot: { status: 'completed' },
            tug: { status: 'completed' },
            bunker: { status: 'completed' },
            water: { status: 'completed' },
            waste: { status: 'completed' },
            cashMaster: { status: 'completed' }
        },
        documents: {
            arrivalNotice: true,
            manifest: true,
            bl: true,
            disbursementAccount: true
        },
        notes: [
            { id: 1, text: "Bunker delivery completed at 16:30", timestamp: "2025-06-21T16:30:00", user: "Ahmet Yılmaz" },
            { id: 2, text: "Final documents received from captain", timestamp: "2025-06-21T18:15:00", user: "Mehmet Demir" }
        ],
        cargo: {
            type: "Crude Oil",
            weight: "120,000 MT",
            quantity: "N/A"
        }
    }
]

const statusColors = {
    planlama: "bg-blue-100 text-blue-800",
    devam: "bg-yellow-100 text-yellow-800",
    tamamlandi: "bg-green-100 text-green-800"
}

const serviceStatusIcons = {
    requested: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    not_requested: <XCircle className="h-4 w-4 text-gray-300" />
}

export default function OperationsPage() {
    return (
        <div className="space-y-4 p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Operasyon ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                    />
                </div>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Yeni Operasyon Ekle</span>
                    <span className="sm:hidden">Yeni Ekle</span>
                </Button>
            </div>

            <div className="rounded-lg border overflow-x-auto">
                <Table className="min-w-[800px] sm:min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Gemi Bilgileri</TableHead>
                            <TableHead className="hidden md:table-cell">Liman</TableHead>
                            <TableHead className="hidden lg:table-cell">Zaman Çizelgesi</TableHead>
                            <TableHead className="hidden xl:table-cell">Durum</TableHead>
                            <TableHead className="hidden 2xl:table-cell">Acentelik Tipi</TableHead>
                            <TableHead className="text-right w-[100px]">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {operations.map((op) => (
                            <TableRow
                                key={op.id}
                                className="hover:bg-muted/50 cursor-pointer"
                                onClick={() => console.log('Navigate to operation:', op.id)}
                            >
                                <TableCell className="py-3">
                                    <div className="font-medium">{op.shipName}</div>
                                    <div className="text-sm text-muted-foreground">IMO: {op.imo} • {op.callSign}</div>
                                    <div className="text-sm">{op.shipType} • {op.flag}</div>
                                </TableCell>

                                <TableCell className="hidden md:table-cell">
                                    <div className="font-medium">{op.port}</div>
                                    <div className="text-sm text-muted-foreground">Rıhtım: {op.berth || 'Bekleniyor'}</div>
                                </TableCell>

                                <TableCell className="hidden lg:table-cell">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>ETA: {new Date(op.eta).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>ETD: {new Date(op.etd).toLocaleString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="hidden xl:table-cell">
                                    <Badge className={`${statusColors[op.status as keyof typeof statusColors]} capitalize`}>
                                        {op.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>

                                <TableCell className="hidden 2xl:table-cell">
                                    <Badge variant="outline">{op.agencyType}</Badge>
                                </TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Menüyü aç</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Detayları Görüntüle</DropdownMenuItem>
                                            <DropdownMenuItem>Düzenle</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Sil</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}