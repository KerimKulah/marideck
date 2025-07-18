// SAFE DELETE YAPILMIŞ MAİL TEKRA KAYDOLURKEN HATA GELİYOR ONA BAKILACAK
// AKTİF OPERASYON? gibi bir boolean eklenebilir.

"use client"

import { Search, Plus, Building2, User, Mail, Phone, Globe, Calendar, MoreHorizontal, ChevronDown, PhoneCall, MessageCircle, Copy, Edit, Trash, Eye, AlertTriangle } from "lucide-react"
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
import { getCustomers, setPage, setLimit, setSearchQuery, deleteCustomer, clearError } from "@/redux/slices/customerSlice"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { MiniLoading } from "@/components/ui/mini-loading"
import { CustomerDetailsModal } from "@/components/customer-details-modal"
import { CustomerAddOrEditModal } from "@/components/customer-addoredit-modal"
import tr from 'react-phone-input-2/lang/tr.json'
import ReactCountryFlag from "react-country-flag"
import CustomerStatsCards from "@/components/customer-stats-cards"
import { toast } from "sonner"


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
  if (!countryCode) return <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />-</div>;
  const flag = <ReactCountryFlag countryCode={countryCode.toUpperCase()} svg style={{ width: '16px', height: '16px' }} />;
  const countryName = tr[countryCode.toLowerCase() as keyof typeof tr] || countryCode;

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      {flag}
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            {countryName.length > 12 ? `${countryName.slice(0, 12)}...` : countryName}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            {flag}
            <p >{countryName}</p>
          </div>
        </TooltipContent>
      </Tooltip>
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
  const { customers, loading, error, page, limit, totalPages, searchQuery, totalCustomers } = useSelector((state: RootState) => state.customer);
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
    dispatch(getCustomers({ page, limit, search: searchQuery }));
  }, [dispatch, page, limit, searchQuery]);

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

  return (
    <div className="grid space-y-4">
      {/* Delete Confirmation Dialog */}
      <CustomerStatsCards />

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
        <div className="relative w-full sm:max-w-md">
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
        <Button onClick={handleAddCustomer} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span>Yeni Müşteri Ekle</span>
        </Button>
      </div>

      {/* Müşteri Tablosu */}
      <div className="rounded-lg border overflow-x-auto">
        <Table className="w-full min-w-[700px] sm:min-w-full">
          {/* Tablo Header */}
          <TableHeader>
            <TableRow>
              <TableHead>Adı Soyadı</TableHead>
              <TableHead>Müşteri Türü</TableHead>
              <TableHead>Firma Adı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Ülke</TableHead>
              <TableHead>Eklenme Tarihi</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>

          {/* Tablo Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24">
                  <MiniLoading />
                </TableCell>
              </TableRow>
            ) : customers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Henüz müşteri kaydı bulunmuyor.'}
                </TableCell>
              </TableRow>
            ) : (
              customers?.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  {/* Yetkili Kişi */}
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {customer.name?.length > 15 ? `${customer.name.slice(0, 15)}...` : customer.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{customer.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  {/* Müşteri Türü */}
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {customer.customer_type?.length > 15 ? `${customer.customer_type.slice(0, 15)}...` : customer.customer_type}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{customer.customer_type}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  {/* Firma Adı */}
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {customer.company ? (
                              customer.company?.length > 30 ? `${customer.company.slice(0, 25)}...` : customer.company
                            ) : '-'}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{customer.company}</p>
                        </TooltipContent>
                      </Tooltip>
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
                                <span className="max-w-[120px]">{customer.email?.length > 25 ? `${customer.email.slice(0, 25)}...` : customer.email}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>İletişim seçenekleri için tıklayın</p>
                              </TooltipContent>
                            </Tooltip>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleMail(customer.email)} className="gap-2">
                            <Mail color="blue" className="h-4 w-4" />
                            Mail Gönder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(customer.email);
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
                                <span>{formatPhone(customer.phone)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>İletişim seçenekleri için tıklayın</p>
                              </TooltipContent>
                            </Tooltip>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handlePhoneCall(customer.phone)} className="gap-2">
                            <PhoneCall color="blue" className="h-4 w-4" />
                            Telefon Et
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleWhatsappMessage(customer.phone)} className="gap-2">
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                              alt="WhatsApp"
                              className="h-[22px] w-[22px] translate-x-[-3px]"
                            />
                            <span className="translate-x-[-7px] cursor-pointer">WhatsApp Mesajı Gönder</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(customer.phone);
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
                  {/* Ülke */}
                  <TableCell >
                    <CountryCell countryCode={customer.country} />
                  </TableCell>
                  {/* Eklenme Tarihi */}
                  <TableCell>
                    {formatDate(customer.createdAt)}
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
                        <DropdownMenuItem onClick={() => handleShowDetails(customer)}><Eye /> Detayları Görüntüle</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCustomer(customer)}><Edit /> Düzenle</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCustomer(customer.id)}><Trash className="text-destructive" /> Sil</DropdownMenuItem>
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
              {[5, 10].map((limitOption) => (
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