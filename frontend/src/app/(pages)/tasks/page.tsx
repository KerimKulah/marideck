import { Search, Plus, AlertCircle, CheckCircle2, Clock, Calendar as CalendarIcon, User, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Demo veriler
const tasks = [
    {
        id: 1,
        title: "Gemi bakım kontrolü",
        description: "MV Blue Star gemisinin rutin bakım kontrolünün yapılması",
        status: "completed",
        priority: "high",
        assignedTo: "Ahmet Yılmaz",
        dueDate: "2025-06-30",
        createdAt: "2025-06-20T10:00:00"
    },
    {
        id: 2,
        title: "Müşteri görüşmesi",
        description: "ABC Denizcilik ile yeni anlaşma görüşmesi",
        status: "in-progress",
        priority: "medium",
        assignedTo: "Ayşe Kaya",
        dueDate: "2025-07-02",
        createdAt: "2025-06-22T14:30:00"
    },
    {
        id: 3,
        title: "Fiyat teklifi hazırlama",
        description: "XYZ Lojistik için yeni sezon fiyat tekliflerinin hazırlanması",
        status: "pending",
        priority: "high",
        assignedTo: "Mehmet Demir",
        dueDate: "2025-06-28",
        createdAt: "2025-06-23T09:15:00"
    },
    {
        id: 4,
        title: "Belge güncelleme",
        description: "Tüm müşteri sözleşmelerinin güncellenmesi",
        status: "pending",
        priority: "low",
        assignedTo: "Fatma Şahin",
        dueDate: "2025-07-05",
        createdAt: "2025-06-24T11:20:00"
    },
    {
        id: 5,
        title: "Depo stok kontrolü",
        description: "Ana depodaki yedek parça stoklarının kontrol edilmesi",
        status: "in-progress",
        priority: "medium",
        assignedTo: "Ali Veli",
        dueDate: "2025-06-29",
        createdAt: "2025-06-23T16:45:00"
    }
];

const statusIcons = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'in-progress': <Clock className="h-4 w-4 text-blue-500" />,
    pending: <AlertCircle className="h-4 w-4 text-yellow-500" />
};

const priorityBadges = {
    high: <Badge variant="destructive">Yüksek</Badge>,
    medium: <Badge variant="outline" className="border-amber-500 text-amber-600">Orta</Badge>,
    low: <Badge variant="outline">Düşük</Badge>
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export default function TasksPage() {
    return (
        <div className="grid space-y-4">
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Görev ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                    />
                </div>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Yeni Görev Ekle</span>
                </Button>
            </div>

            {/* Tasks Table */}
            <div className="rounded-lg border overflow-x-auto">
                <Table className="min-w-[800px] sm:min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Görev</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Aciliyet</TableHead>
                            <TableHead>Atanan Kişi</TableHead>
                            <TableHead>Son Tarih</TableHead>
                            <TableHead>Oluşturulma Tarihi</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => ( 
                            <TableRow key={task.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{task.title}</span>
                                        <span className="text-sm text-muted-foreground line-clamp-1">{task.description}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {statusIcons[task.status as keyof typeof statusIcons]}
                                        <span className="capitalize">
                                            {task.status === 'in-progress' ? 'Devam Ediyor' :
                                                task.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {priorityBadges[task.priority as keyof typeof priorityBadges]}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{task.assignedTo}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        <span>{formatDate(task.dueDate)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-muted-foreground">
                                        {formatDate(task.createdAt)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">İşlemler</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Düzenle</DropdownMenuItem>
                                            <DropdownMenuItem>Durumu Güncelle</DropdownMenuItem>
                                            <DropdownMenuItem>Detayları Görüntüle</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">Sil</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}