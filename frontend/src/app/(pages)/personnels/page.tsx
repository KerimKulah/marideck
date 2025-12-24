"use client"

import { Search, Plus, User, Mail, Phone, MoreHorizontal, Edit, Trash, Eye, UserPlus, ChevronDown, Smartphone, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AppDispatch } from "@/redux/store"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useEffect, useState } from "react"
import debounce from "lodash/debounce"
import { getUsers, deleteUser, setPage, setLimit, setSearchQuery, clearError } from "@/redux/slices/userSlice"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { MiniLoading } from "@/components/ui/mini-loading"
import { toast } from "sonner"
import { format } from "date-fns"
import { PersonnelAddOrEditModal } from "@/components/personnel-addoredit-modal"
import { PersonnelViewModal } from "@/components/personnel-view-modal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function PersonnelsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, error, page, limit, totalPages, searchQuery, totalUsers } = useSelector((state: RootState) => state.user);
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch users on component mount and when page/limit/search changes
    useEffect(() => {
        dispatch(getUsers({ page, limit, search: searchQuery }));
    }, [dispatch, page, limit, searchQuery]);

    console.log(users)

    // Handle search input with debounce
    const handleSearch = debounce((value: string) => {
        dispatch(setSearchQuery(value));
        dispatch(setPage(1));
    }, 500);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setPage(newPage));
        }
    };

    const handleLimitChange = (newLimit: number) => {
        dispatch(setLimit(newLimit));
        dispatch(setPage(1));
    };

    // Handle delete user
    const handleViewUser = (user: any) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setModalMode('edit');
        setIsAddEditModalOpen(true);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setModalMode('add');
        setIsAddEditModalOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        setUserToDelete(userId);
        setIsDeleteDialogOpen(true);
    };

    const handleUserSuccess = () => {
        dispatch(getUsers({ page, limit, search: searchQuery }));
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteUser(parseInt(userToDelete))).unwrap();
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
            toast.success("Personel başarıyla silindi.");
            dispatch(getUsers({ page, limit, search: searchQuery }));
        } catch (error) {
            console.error('Personel silinirken hata oluştu:', error);
            toast.error("Personel silinirken bir hata oluştu.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                    Bu sayfa Marideck yönetim sistemine erişimi olan personellerin yönetimini sağlar.
                    Sistemde tanımlı personellerin listesini gösterir ve yeni personel ekleme, düzenleme,
                    görüntüleme ve silme işlemlerini gerçekleştirmenize olanak tanır.
                    <br /><br />
                    <div className="flex items-center gap-2">
                        <span className="font-medium">ÖNEMLİ:</span> Bu modül sadece Marideck sistemine giriş yapacak
                        kullanıcıların teknik bilgilerini içerir. Personellerin detaylı özgeçmiş veya kişisel
                        bilgileri burada tutulamaz.
                    </div>
                </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Personel ara..."
                            className="pl-9 w-full"
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                handleSearch(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <Button onClick={handleAddUser} className="whitespace-nowrap">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Yeni Personel Ekle
                </Button>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Oluşturulma Tarihi</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex justify-center">
                                        <MiniLoading />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Kayıt bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {user.firstName} {user.lastName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Mail className="text-muted-foreground h-4 w-4" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="text-muted-foreground h-4 w-4" />
                                            {user.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.roles?.[0]?.name === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.roles?.[0]?.name === 'admin' ? 'Yönetici' : 'Personel'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Menüyü aç</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Görüntüle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Düzenle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Lock className="mr-2 h-4 w-4" />
                                                    Şifresini Sıfırla
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteUser(user.id.toString())}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Sil
                                                </DropdownMenuItem>

                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
                            {[5, 10, 20, 30, 50].map((limitOption) => (
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
                    Toplam {totalUsers} kayıt
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
            {/* Add/Edit Modal */}
            <PersonnelAddOrEditModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                personnel={selectedUser}
                onSuccess={handleUserSuccess}
            />

            {/* View Modal */}
            <PersonnelViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                personnel={selectedUser}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Personeli Sil</DialogTitle>
                        <DialogDescription>
                            Bu işlem geri alınamaz. Personeli silmek istediğinize emin misiniz?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Siliniyor...
                                </div>
                            ) : 'Sil'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}