
"use client"

import { Search, Plus, Building2, User, Mail, Phone, Globe, Calendar, MoreHorizontal, ChevronDown, PhoneCall, MessageCircle, Copy, Edit, Trash, Eye, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, Tag } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppDispatch } from "@/redux/store"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useEffect, useState, useMemo } from "react"
import debounce from "lodash/debounce"
import { getCustomers, setPage, setLimit, setSearchQuery, setSortBy, setSortOrder, deleteCustomer, clearError, getCustomerStatistics } from "@/redux/slices/customerSlice"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { MiniLoading } from "@/components/ui/mini-loading"
import { CustomerDetailsModal } from "@/components/customer-details-modal"
import { CustomerAddOrEditModal } from "@/components/customer-addoredit-modal"
import tr from 'react-phone-input-2/lang/tr.json'
import ReactCountryFlag from "react-country-flag"
import CustomerStatsCards from "@/components/customer-stats-cards"
import { toast } from "sonner"
import { isActiveOperation } from "@/lib/operation-status"


const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

const CountryCell = ({ countryCode }: { countryCode?: string }) => {
  if (!countryCode) return <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />Bilinmiyor</div>;
  const flag = <ReactCountryFlag countryCode={countryCode.toUpperCase()} svg style={{ width: '16px', height: '16px' }} />;
  const countryName = tr[countryCode.toLowerCase() as keyof typeof tr] || countryCode;

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      {flag}
      <span>
        {countryName.length > 12 ? `${countryName.slice(0, 12)}...` : countryName}
      </span>
    </div>
  );
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

export default function CustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, loading, error, page, limit, totalPages, searchQuery, totalCustomers, sortBy, sortOrder, statistics, statisticsLoading } = useSelector((state: RootState) => state.customer);

  // Status Badge Component
  const StatusBadge = ({ customer }: { customer: any }) => {
    const hasActiveOperations = customer.operations?.some((operation: any) =>
      isActiveOperation(operation.status)
    ) || false;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${hasActiveOperations
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
        <span className="w-2 h-2 rounded-full bg-current"></span>
        {hasActiveOperations ? 'Aktif Operasyon' : 'Operasyon Yok'}
      </div>
    );
  };

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShowDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
    setIsDetailsModalOpen(false);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setIsAddEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddEditModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSuccess = () => {
    setIsAddEditModalOpen(false);
    setEditingCustomer(null);
    dispatch(getCustomers({ page, limit, search: searchQuery }));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteCustomer(customerToDelete)).unwrap();
      // Modalı hemen kapat
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
      toast("Müşteri başarıyla silindi.");
      // Verileri yenile
      await dispatch(getCustomers({ page, limit, search: searchQuery }));
    } catch (error) {
      console.error('Müşteri silinirken hata oluştu:', error);
      toast("Müşteri silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    dispatch(getCustomers({ page, limit, search: searchQuery, sortBy, sortOrder }));
    dispatch(getCustomerStatistics());
  }, [dispatch, page, limit, searchQuery, sortBy, sortOrder]);

  // Hata yönetimi
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Hata gösterildikten sonra temizle
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Debounced search function
  const debouncedDispatch = useMemo(
    () => debounce((value: string) => {
      dispatch(setSearchQuery(value));
    }, 500),
    [dispatch]
  );

  // Update search query with debounce
  useEffect(() => {
    debouncedDispatch(searchInput);
    return () => debouncedDispatch.cancel();
  }, [searchInput, debouncedDispatch]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Aynı field'a tıklanırsa order'ı değiştir
      dispatch(setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      // Yeni field seçilirse ASC ile başla
      dispatch(setSortBy(field));
      dispatch(setSortOrder('ASC'));
    }
  };

  // Client-side sorting for operation status (backend doesn't support this field)
  const sortedCustomers = useMemo(() => {
    if (sortBy === 'operationStatus') {
      return [...customers].sort((a, b) => {
        const aHasOperations = a.operations?.some((operation: any) => isActiveOperation(operation.status)) || false;
        const bHasOperations = b.operations?.some((operation: any) => isActiveOperation(operation.status)) || false;

        if (sortOrder === 'ASC') {
          return aHasOperations === bHasOperations ? 0 : aHasOperations ? -1 : 1;
        } else {
          return aHasOperations === bHasOperations ? 0 : aHasOperations ? 1 : -1;
        }
      });
    }
    return customers;
  }, [customers, sortBy, sortOrder]);

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === 'ASC' ?
      <ArrowUp className="h-4 w-4 text-blue-600" /> :
      <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="grid space-y-4">
      {/* <CustomerStatsCards /> */}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <DialogTitle>Müşteriyi Sil</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCustomerToDelete(null);
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

      {/* Arama ve Yeni Müşteri Ekle Butonu */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Arama Inputu */}
        <div className="relative w-full ">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Firma veya yetkili kişi ara..."
            className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Yeni Müşteri Ekle Butonu */}
        <Button onClick={handleAddCustomer} className="w-full sm:w-auto cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          <span>Müşteri Ekle</span>
        </Button>
      </div>

      {/* Müşteri Tablosu */}
      <div className="rounded-lg border overflow-y-auto">
        <div className="max-h-[600px] overflow-y-auto ">
          <Table className="w-full min-w-[700px] sm:min-w-full ">
            {/* Tablo Header */}
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="h-auto -ml-3 font-semibold hover:bg-transparent cursor-pointer"
                  >
                    Adı Soyadı
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('customerType')}
                    className="h-auto -ml-3 font-semibold hover:bg-transparent cursor-pointer"
                  >
                    Kategori / Tür
                    {getSortIcon('customerType')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('company')}
                    className="h-auto -ml-3 font-semibold hover:bg-transparent cursor-pointer"
                  >
                    Firma Adı
                    {getSortIcon('company')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('email')}
                    className="h-auto -ml-3 font-semibold hover:bg-transparent cursor-pointer"
                  >
                    E-posta
                    {getSortIcon('email')}
                  </Button>
                </TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('country')}
                    className="h-auto -ml-3.5 font-semibold hover:bg-transparent cursor-pointer"
                  >
                    Ülke
                    {getSortIcon('country')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('createdAt')}
                    className="h-auto -ml-3 font-semibold hover:bg-transparent cursor-pointer"
                  >
                    Eklenme Tarihi
                    {getSortIcon('createdAt')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('operationStatus')}
                    className="h-auto -ml-2.5 font-semibold hover:bg-transparent cursor-pointer"
                  >
                    Durum
                    {getSortIcon('operationStatus')}
                  </Button>
                </TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>

            {/* Tablo Body */}
            <TableBody >
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24">
                    <MiniLoading />
                  </TableCell>
                </TableRow>
              ) : sortedCustomers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Henüz müşteri kaydı bulunmuyor.'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedCustomers?.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50 cursor-pointer">
                    {/* Yetkili Kişi */}
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {customer.name?.length > 15 ? `${customer.name.slice(0, 15)}...` : customer.name}
                        </span>
                      </div>
                    </TableCell>
                    {/* Müşteri Türü */}
                    <TableCell className="min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {customer.customerType || '-'}
                        </span>
                      </div>
                    </TableCell>
                    {/* Firma Adı */}
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {customer.company ? (
                            customer.company?.length > 30 ? `${customer.company.slice(0, 25)}...` : customer.company
                          ) : 'Bilinmiyor'}
                        </span>
                      </div>
                    </TableCell>
                    {/* E-posta*/}
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="max-w-[120px]">{customer.email?.length > 15 ? `${customer.email.slice(0, 15)}...` : customer.email}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(customer.email);
                                  toast.success('Mail kopyalandı!');
                                } catch (error) {
                                  toast.error('Kopyalama başarısız!');
                                }
                              }}
                              className="h-3 w-3 -ml-2 cursor-pointer"
                            >
                              <Copy style={{ width: '10px', height: '10px' }} />

                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Maili kopyala</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    {/* Telefon */}
                    <TableCell className="min-w-[170px]">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{formatPhone(customer.phone)}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(customer.phone);
                                  toast.success('Numara kopyalandı!');
                                } catch (error) {
                                  toast.error('Kopyalama başarısız!');
                                }
                              }}
                              className="h-3 w-3 p-0 -ml-2 cursor-pointer"
                            >
                              <Copy style={{ width: '10px', height: '10px' }} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Numarayı kopyala</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    {/* Ülke */}
                    <TableCell >
                      <CountryCell countryCode={customer.country} />
                    </TableCell>
                    {/* Eklenme Tarihi */}
                    <TableCell className="flex items-center gap-1.5 mt-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    {/* Durum */}
                    <TableCell>
                      <StatusBadge customer={customer} />
                    </TableCell>
                    {/* İşlemler */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <span className="sr-only">Menüyü aç</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleShowDetails(customer)}><Eye /> Detayları Görüntüle</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCustomer(customer)}><Edit /> Düzenle</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMail(customer.email)}><Mail /> Mail Gönder</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePhoneCall(customer.phone)}><PhoneCall /> Telefon Et</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleWhatsappMessage(customer.phone)}><MessageCircle /> WhatsApp Mesajı</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive hover:!text-destructive" onClick={() => handleDeleteCustomer(customer.id)}><Trash className="text-destructive" /> Sil</DropdownMenuItem>
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
          Toplam {totalCustomers} kayıt
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
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                className={1 === page ? "font-bold underline cursor-pointer" : "cursor-pointer"}
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
                        className={pageNumber === page ? "font-bold underline cursor-pointer" : "cursor-pointer"}
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
                  className={totalPages === page ? "font-bold underline cursor-pointer" : "cursor-pointer"}
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
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modals */}
      <CustomerDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetails} customer={selectedCustomer} />
      <CustomerAddOrEditModal
        isOpen={isAddEditModalOpen}
        onClose={handleCloseModal}
        customer={editingCustomer}
        onSuccess={handleSuccess}
      />
    </div>
  )
} 