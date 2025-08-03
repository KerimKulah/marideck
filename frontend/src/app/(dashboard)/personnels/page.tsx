"use client"

import { Search, Plus, User, Mail, Phone, MoreHorizontal, Edit, Trash, Eye, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

export default function PersonnelsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, error, page, limit, totalPages, searchQuery, totalUsers } = useSelector((state: RootState) => state.user);
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

    // Handle delete user
    const handleDeleteUser = (userId: string) => {
        setUserToDelete(userId);
        setIsDeleteDialogOpen(true);
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
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
                <Button onClick={() => { }}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Yeni Personel Ekle
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Personel ara..."
                            className="pl-8 w-[300px]"
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                handleSearch(e.target.value);
                            }}
                        />
                    </div>
                </div>
            </div>

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
                            <TableHead className="text-right">İşlemler</TableHead>
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
                                    Kayıtlı personel bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {`${user.firstName} ${user.lastName}`}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                                            {user.roles[0].name === 'admin' ? 'Yönetici' : 'Personel'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-md text-xs ${user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Menüyü aç</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { }}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Görüntüle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { }}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Düzenle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteUser(user.id)}
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

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1 || loading}
                                >
                                    Önceki
                                </Button>
                            </PaginationItem>

                            {getPageNumbers().map((pageNum) => (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                        href="#"
                                        isActive={pageNum === page}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages || loading}
                                >
                                    Sonraki
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Personeli Sil</DialogTitle>
                        <DialogDescription>
                            Bu işlem geri alınamaz. Bu personeli silmek istediğinize emin misiniz?
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
                            {isDeleting ? 'Siliniyor...' : 'Sil'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}