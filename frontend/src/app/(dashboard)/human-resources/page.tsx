"use client"

import { Search, Plus, User, Mail, Phone, Calendar, MoreHorizontal, ChevronDown, PhoneCall, MessageCircle, Copy, Edit, Trash, Eye, AlertTriangle, Building2, Briefcase, MapPin, Clock, UserCheck, Users, GraduationCap, Award, FileText, CalendarDays, Clock3, CheckCircle, XCircle, AlertCircle, Timer, Coffee, Moon, Sun, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppDispatch } from "@/redux/store"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useEffect, useState, useMemo } from "react"
import debounce from "lodash/debounce"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { MiniLoading } from "@/components/ui/mini-loading"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for demonstration
const mockEmployees = [
    {
        id: 1,
        name: "Ahmet Yılmaz",
        position: "Yazılım Geliştirici",
        department: "IT",
        email: "ahmet.yilmaz@company.com",
        phone: "+90 532 123 45 67",
        hireDate: "2023-01-15",
        status: "active",
        salary: 45000,
        location: "İstanbul",
        manager: "Mehmet Demir"
    },
    {
        id: 2,
        name: "Ayşe Kaya",
        position: "İnsan Kaynakları Uzmanı",
        department: "HR",
        email: "ayse.kaya@company.com",
        phone: "+90 532 234 56 78",
        hireDate: "2022-06-10",
        status: "active",
        salary: 38000,
        location: "Ankara",
        manager: "Fatma Özkan"
    },
    {
        id: 3,
        name: "Mehmet Demir",
        position: "Proje Yöneticisi",
        department: "IT",
        email: "mehmet.demir@company.com",
        phone: "+90 532 345 67 89",
        hireDate: "2021-03-20",
        status: "active",
        salary: 55000,
        location: "İstanbul",
        manager: "Ali Veli"
    },
    {
        id: 4,
        name: "Fatma Özkan",
        position: "İK Müdürü",
        department: "HR",
        email: "fatma.ozkan@company.com",
        phone: "+90 532 456 78 90",
        hireDate: "2020-09-15",
        status: "active",
        salary: 65000,
        location: "Ankara",
        manager: "CEO"
    },
    {
        id: 5,
        name: "Ali Veli",
        position: "CEO",
        department: "Executive",
        email: "ali.veli@company.com",
        phone: "+90 532 567 89 01",
        hireDate: "2019-01-01",
        status: "active",
        salary: 120000,
        location: "İstanbul",
        manager: "Board"
    }
];

// Mock data for leave requests
const mockLeaveRequests = [
    {
        id: 1,
        employeeId: 1,
        employeeName: "Ahmet Yılmaz",
        leaveType: "Yıllık İzin",
        startDate: "2024-01-15",
        endDate: "2024-01-22",
        days: 7,
        status: "pending",
        reason: "Aile ziyareti",
        submittedDate: "2024-01-10",
        approvedBy: null
    },
    {
        id: 2,
        employeeId: 2,
        employeeName: "Ayşe Kaya",
        leaveType: "Hastalık İzni",
        startDate: "2024-01-20",
        endDate: "2024-01-22",
        days: 3,
        status: "approved",
        reason: "Grip",
        submittedDate: "2024-01-18",
        approvedBy: "Fatma Özkan"
    },
    {
        id: 3,
        employeeId: 3,
        employeeName: "Mehmet Demir",
        leaveType: "Doğum İzni",
        startDate: "2024-02-01",
        endDate: "2024-02-15",
        days: 15,
        status: "approved",
        reason: "Baba doğum izni",
        submittedDate: "2024-01-25",
        approvedBy: "Ali Veli"
    }
];

// Mock data for shifts
const mockShifts = [
    {
        id: 1,
        employeeId: 1,
        employeeName: "Ahmet Yılmaz",
        shiftType: "Sabah Vardiyası",
        startTime: "08:00",
        endTime: "16:00",
        date: "2024-01-15",
        status: "scheduled",
        location: "Ana Ofis"
    },
    {
        id: 2,
        employeeId: 2,
        employeeName: "Ayşe Kaya",
        shiftType: "Öğle Vardiyası",
        startTime: "12:00",
        endTime: "20:00",
        date: "2024-01-15",
        status: "completed",
        location: "Ana Ofis"
    },
    {
        id: 3,
        employeeId: 3,
        employeeName: "Mehmet Demir",
        shiftType: "Gece Vardiyası",
        startTime: "22:00",
        endTime: "06:00",
        date: "2024-01-15",
        status: "in-progress",
        location: "Ana Ofis"
    }
];

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

const formatPhone = (phoneNumber?: string | null) => {
    if (!phoneNumber) return '-';
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
        return `+${cleaned.replace(/\D/g, '')}`;
    }
    return cleaned;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
        case 'inactive':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pasif</Badge>;
        case 'on-leave':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">İzinli</Badge>;
        default:
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Bilinmiyor</Badge>;
    }
};

const getLeaveStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Beklemede</Badge>;
        case 'approved':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Onaylandı</Badge>;
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Reddedildi</Badge>;
        default:
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Bilinmiyor</Badge>;
    }
};

const getShiftStatusBadge = (status: string) => {
    switch (status) {
        case 'scheduled':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Planlandı</Badge>;
        case 'in-progress':
            return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Devam Ediyor</Badge>;
        case 'completed':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Tamamlandı</Badge>;
        case 'cancelled':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">İptal</Badge>;
        default:
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Bilinmiyor</Badge>;
    }
};

const handleWhatsappMessage = (phoneNumber: string) => {
    const formattedPhone = formatPhone(phoneNumber);
    window.open(`https://wa.me/${formattedPhone}`);
};

const handlePhoneCall = (phoneNumber: string) => {
    const formattedPhone = formatPhone(phoneNumber);
    window.location.href = `tel:${formattedPhone}`;
};

const handleMail = (email: string) => {
    window.location.href = `mailto:${email}`;
};

// HR Stats Cards Component
const HRStatsCards = () => {
    const totalEmployees = mockEmployees.length;
    const activeEmployees = mockEmployees.filter(emp => emp.status === 'active').length;
    const departments = [...new Set(mockEmployees.map(emp => emp.department))].length;
    const avgSalary = Math.round(mockEmployees.reduce((sum, emp) => sum + emp.salary, 0) / mockEmployees.length);

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Toplam Çalışan */}
            <div className="rounded-lg border p-3 bg-white">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Toplam Çalışan</p>
                        <p className="text-2xl font-bold">{totalEmployees}</p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100 flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Aktif Çalışan */}
            <div className="rounded-lg border p-3 bg-white">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Aktif Çalışan</p>
                        <p className="text-2xl font-bold">{activeEmployees}</p>
                    </div>
                    <div className="p-2 rounded-full bg-green-100 flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
                        <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Departman Sayısı */}
            <div className="rounded-lg border p-3 bg-white">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Departman</p>
                        <p className="text-2xl font-bold">{departments}</p>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100 flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
                        <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Ortalama Maaş */}
            <div className="rounded-lg border p-3 bg-white">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Ort. Maaş</p>
                        <p className="text-2xl font-bold">₺{avgSalary.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded-full bg-orange-100 flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
                        <Award className="h-6 w-6 text-orange-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function HumanResourcePage() {
    const [employees, setEmployees] = useState(mockEmployees);
    const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
    const [shifts, setShifts] = useState(mockShifts);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState("employees");

    // Filter employees based on search
    const filteredEmployees = useMemo(() => {
        if (!searchQuery) return employees;
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [employees, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredEmployees.length / limit);
    const paginatedEmployees = filteredEmployees.slice((page - 1) * limit, page * limit);

    const handleShowDetails = (employee: any) => {
        setSelectedEmployee(employee);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setSelectedEmployee(null);
        setIsDetailsModalOpen(false);
    };

    const handleAddEmployee = () => {
        setEditingEmployee(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditEmployee = (employee: any) => {
        setEditingEmployee(employee);
        setIsAddEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddEditModalOpen(false);
        setEditingEmployee(null);
    };

    const handleDeleteEmployee = (id: number) => {
        setEmployeeToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        setIsDeleting(true);
        try {
            setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete));
            setIsDeleteDialogOpen(false);
            setEmployeeToDelete(null);
            toast("Çalışan başarıyla silindi.");
        } catch (error) {
            console.error('Çalışan silinirken hata oluştu:', error);
            toast("Çalışan silinirken bir hata oluştu.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Debounced search function
    const debouncedDispatch = useMemo(
        () => debounce((value: string) => {
            setSearchQuery(value);
        }, 500),
        []
    );

    // Update search query with debounce
    useEffect(() => {
        debouncedDispatch(searchInput);
        return () => debouncedDispatch.cancel();
    }, [searchInput, debouncedDispatch]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    return (
        <div className="grid space-y-4">
            {/* HR Stats Cards */}
            <HRStatsCards />

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="employees" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Çalışanlar
                    </TabsTrigger>
                    <TabsTrigger value="leaves" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        İzin Yönetimi
                    </TabsTrigger>
                    <TabsTrigger value="shifts" className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        Vardiya Yönetimi
                    </TabsTrigger>
                </TabsList>

                {/* Employees Tab */}
                <TabsContent value="employees" className="space-y-4">
                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                    <DialogTitle>Çalışanı Sil</DialogTitle>
                                </div>
                                <DialogDescription className="pt-2">
                                    Bu çalışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sm:justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setEmployeeToDelete(null);
                                    }}
                                    disabled={isDeleting}
                                >
                                    İptal
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Siliniyor...' : 'Sil'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Arama ve Yeni Çalışan Ekle Butonu */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        {/* Arama Inputu */}
                        <div className="relative w-full ">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Çalışan adı, pozisyon veya departman ara..."
                                className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>

                        {/* Yeni Çalışan Ekle Butonu */}
                        <Button onClick={handleAddEmployee} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Yeni Çalışan Ekle</span>
                        </Button>
                    </div>

                    {/* Çalışan Tablosu */}
                    <div className="rounded-lg border overflow-y-auto">
                        <div className="max-h-[600px] overflow-y-auto ">
                            <Table className="w-full min-w-[700px] sm:min-w-full ">
                                {/* Tablo Header */}
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Adı Soyadı</TableHead>
                                        <TableHead>Pozisyon</TableHead>
                                        <TableHead>Departman</TableHead>
                                        <TableHead>E-posta</TableHead>
                                        <TableHead>Telefon</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead>İşe Giriş</TableHead>
                                        <TableHead>İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>

                                {/* Tablo Body */}
                                <TableBody >
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24">
                                                <MiniLoading />
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedEmployees?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                {searchQuery ? 'Arama kriterlerine uygun çalışan bulunamadı.' : 'Henüz çalışan kaydı bulunmuyor.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedEmployees?.map((employee) => (
                                            <TableRow key={employee.id} className="hover:bg-muted/50">
                                                {/* Adı Soyadı */}
                                                <TableCell className="min-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span>
                                                                    {employee.name?.length > 15 ? `${employee.name.slice(0, 15)}...` : employee.name}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{employee.name}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                                {/* Pozisyon */}
                                                <TableCell className="min-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span>
                                                                    {employee.position?.length > 15 ? `${employee.position.slice(0, 15)}...` : employee.position}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{employee.position}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                                {/* Departman */}
                                                <TableCell className="min-w-[150px]">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span>{employee.department}</span>
                                                    </div>
                                                </TableCell>
                                                {/* E-posta*/}
                                                <TableCell className="min-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="hover:underline transition-colors cursor-pointer">
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span className="max-w-[120px]">{employee.email?.length > 25 ? `${employee.email.slice(0, 25)}...` : employee.email}</span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>İletişim seçenekleri için tıklayın</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="start">
                                                                <DropdownMenuItem onClick={() => handleMail(employee.email)} className="gap-2">
                                                                    <Mail color="blue" className="h-4 w-4" />
                                                                    Mail Gönder
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={async () => {
                                                                        try {
                                                                            await navigator.clipboard.writeText(employee.email);
                                                                            toast.success('Mail kopyalandı!');
                                                                        } catch (error) {
                                                                            toast.error('Kopyalama başarısız!');
                                                                        }
                                                                    }}
                                                                    className="gap-2"
                                                                >
                                                                    <Copy color="black" className="h-4 w-4" />
                                                                    Maili Kopyala
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>

                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                                {/* Telefon */}
                                                <TableCell className="min-w-[170px]">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="hover:underline transition-colors cursor-pointer">
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span>{formatPhone(employee.phone)}</span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>İletişim seçenekleri için tıklayın</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start">
                                                                <DropdownMenuItem onClick={() => handlePhoneCall(employee.phone)} className="gap-2">
                                                                    <PhoneCall color="blue" className="h-4 w-4" />
                                                                    Telefon Et
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleWhatsappMessage(employee.phone)} className="gap-2">
                                                                    <img
                                                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                                                        alt="WhatsApp"
                                                                        className="h-[22px] w-[22px] translate-x-[-3px]"
                                                                    />
                                                                    <span className="translate-x-[-7px] cursor-pointer">WhatsApp Mesajı Gönder</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={async () => {
                                                                    try {
                                                                        await navigator.clipboard.writeText(employee.phone);
                                                                        toast.success('Numara kopyalandı!');
                                                                    } catch (error) {
                                                                        toast.error('Kopyalama başarısız!');
                                                                    }
                                                                }} className="gap-2">
                                                                    <Copy color="black" className="h-4 w-4" />
                                                                    Numarayı Kopyala
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                                {/* Durum */}
                                                <TableCell>
                                                    {getStatusBadge(employee.status)}
                                                </TableCell>
                                                {/* İşe Giriş Tarihi */}
                                                <TableCell>
                                                    {formatDate(employee.hireDate)}
                                                </TableCell>
                                                {/* İşlemler */}
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Menüyü aç</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleShowDetails(employee)}><Eye /> Detayları Görüntüle</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditEmployee(employee)}><Edit /> Düzenle</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEmployee(employee.id)}><Trash className="text-destructive" /> Sil</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Limit Seçici ve Toplam Kayıt Bilgisi */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Sayfa başına:</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-15">
                                        {limit}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {[5, 10, 20, 50].map((limitOption) => (
                                        <DropdownMenuItem
                                            key={limitOption}
                                            onClick={() => handleLimitChange(limitOption)}
                                            className={limit === limitOption ? "bg-accent" : ""}>
                                            {limitOption}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Toplam {filteredEmployees.length} kayıt
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                {/* Previous */}
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page > 1) handlePageChange(page - 1);
                                        }}
                                        aria-disabled={page === 1}
                                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {/* First Page */}
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(1);
                                        }}
                                        aria-current={1 === page ? "page" : undefined}
                                        className={1 === page ? "font-bold underline" : ""}
                                    >
                                        1
                                    </PaginationLink>
                                </PaginationItem>

                                {/* Left Ellipsis */}
                                {page > 3 && (
                                    <PaginationItem>
                                        <span className="px-2">...</span>
                                    </PaginationItem>
                                )}

                                {/* Middle Pages */}
                                {Array.from(
                                    { length: Math.min(3, totalPages - 2) },
                                    (_, i) => {
                                        let pageNumber;
                                        if (page <= 3) {
                                            pageNumber = i + 2;
                                        } else if (page >= totalPages - 2) {
                                            pageNumber = totalPages - 3 + i;
                                        } else {
                                            pageNumber = page - 1 + i;
                                        }

                                        if (pageNumber > 1 && pageNumber < totalPages) {
                                            return (
                                                <PaginationItem key={pageNumber}>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(pageNumber);
                                                        }}
                                                        aria-current={pageNumber === page ? "page" : undefined}
                                                        className={pageNumber === page ? "font-bold underline" : ""}
                                                    >
                                                        {pageNumber}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }
                                        return null;
                                    }
                                )}

                                {/* Right Ellipsis */}
                                {page < totalPages - 2 && totalPages > 5 && (
                                    <PaginationItem>
                                        <span className="px-2">...</span>
                                    </PaginationItem>
                                )}

                                {/* Last Page */}
                                {totalPages > 1 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(totalPages);
                                            }}
                                            aria-current={totalPages === page ? "page" : undefined}
                                            className={totalPages === page ? "font-bold underline" : ""}
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {/* Next */}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page < totalPages) handlePageChange(page + 1);
                                        }}
                                        aria-disabled={page === totalPages}
                                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}

                    {/* Employee Details Modal */}
                    {selectedEmployee && (
                        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto lg:min-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                                        Çalışan Detayları
                                    </DialogTitle>
                                </DialogHeader>

                                {/* Profil Bölümü */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left min-w-0">
                                        <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                                            {selectedEmployee.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1 text-muted-foreground mt-1">
                                            <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="break-words">{selectedEmployee.position}</span>
                                        </p>
                                        <p className="text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1 text-muted-foreground mt-1">
                                            <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="break-words">{selectedEmployee.department}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Temel Bilgiler */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Temel Bilgiler</h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3 py-2">
                                                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">E-posta</p>
                                                    <p className="font-medium text-foreground text-sm sm:text-base break-words">{selectedEmployee.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-2">
                                                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Telefon</p>
                                                    <p className="font-medium text-foreground text-sm sm:text-base break-words">{selectedEmployee.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-2">
                                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Lokasyon</p>
                                                    <p className="font-medium text-foreground text-sm sm:text-base break-words">{selectedEmployee.location}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-2">
                                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">İşe Giriş Tarihi</p>
                                                    <p className="font-medium text-foreground text-sm sm:text-base break-words">{formatDate(selectedEmployee.hireDate)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-2">
                                                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Maaş</p>
                                                    <p className="font-medium text-foreground text-sm sm:text-base break-words">₺{selectedEmployee.salary.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 py-2">
                                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Yönetici</p>
                                                    <p className="font-medium text-foreground text-sm sm:text-base break-words">{selectedEmployee.manager}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Durum:</span>
                                            {getStatusBadge(selectedEmployee.status)}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </TabsContent>

                {/* Leave Management Tab */}
                <TabsContent value="leaves" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="İzin talebi ara..."
                                className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Yeni İzin Talebi</span>
                        </Button>
                    </div>

                    <div className="rounded-lg border overflow-y-auto">
                        <div className="max-h-[600px] overflow-y-auto">
                            <Table className="w-full min-w-[700px] sm:min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Çalışan</TableHead>
                                        <TableHead>İzin Türü</TableHead>
                                        <TableHead>Başlangıç</TableHead>
                                        <TableHead>Bitiş</TableHead>
                                        <TableHead>Gün Sayısı</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead>İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveRequests.map((request) => (
                                        <TableRow key={request.id} className="hover:bg-muted/50">
                                            <TableCell className="min-w-[150px]">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>{request.employeeName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[120px]">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                    <span>{request.leaveType}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(request.startDate)}</TableCell>
                                            <TableCell>{formatDate(request.endDate)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{request.days} gün</Badge>
                                            </TableCell>
                                            <TableCell>{getLeaveStatusBadge(request.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Eye /> Detayları Görüntüle</DropdownMenuItem>
                                                        {request.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem><CheckCircle /> Onayla</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive"><XCircle /> Reddet</DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                {/* Shift Management Tab */}
                <TabsContent value="shifts" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Vardiya ara..."
                                    className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <Select defaultValue="today">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tarih seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Bugün</SelectItem>
                                    <SelectItem value="week">Bu Hafta</SelectItem>
                                    <SelectItem value="month">Bu Ay</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Yeni Vardiya</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Toplam Vardiya</CardTitle>
                                <Clock3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{shifts.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
                                <Timer className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{shifts.filter(s => s.status === 'in-progress').length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{shifts.filter(s => s.status === 'completed').length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-lg border overflow-y-auto">
                        <div className="max-h-[600px] overflow-y-auto">
                            <Table className="w-full min-w-[700px] sm:min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Çalışan</TableHead>
                                        <TableHead>Vardiya Türü</TableHead>
                                        <TableHead>Başlangıç</TableHead>
                                        <TableHead>Bitiş</TableHead>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead>İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shifts.map((shift) => (
                                        <TableRow key={shift.id} className="hover:bg-muted/50">
                                            <TableCell className="min-w-[150px]">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>{shift.employeeName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[120px]">
                                                <div className="flex items-center gap-2">
                                                    {shift.shiftType === 'Sabah Vardiyası' && <Sun className="h-4 w-4 text-yellow-500" />}
                                                    {shift.shiftType === 'Öğle Vardiyası' && <Coffee className="h-4 w-4 text-orange-500" />}
                                                    {shift.shiftType === 'Gece Vardiyası' && <Moon className="h-4 w-4 text-blue-500" />}
                                                    <span>{shift.shiftType}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span>{shift.startTime}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span>{shift.endTime}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(shift.date)}</TableCell>
                                            <TableCell>{getShiftStatusBadge(shift.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Eye /> Detayları Görüntüle</DropdownMenuItem>
                                                        <DropdownMenuItem><Edit /> Düzenle</DropdownMenuItem>
                                                        {shift.status === 'scheduled' && (
                                                            <DropdownMenuItem><RotateCcw /> Başlat</DropdownMenuItem>
                                                        )}
                                                        {shift.status === 'in-progress' && (
                                                            <DropdownMenuItem><CheckCircle /> Tamamla</DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}