"use client"

import { Search, Plus, Building2, User, Mail, Phone, Globe, Calendar, MoreHorizontal, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AppDispatch } from "@/redux/store"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useEffect, useState, useMemo } from "react"
import debounce from "lodash/debounce"
import { getCustomers, setPage, setLimit, setSearchQuery, deleteCustomer } from "@/redux/slices/customerSlice"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { MiniLoading } from "@/components/ui/mini-loading"
import { CustomerDetailsModal } from "@/components/customer-details-modal"
import CustomerAddOrEditModal from "@/components/customer-addoredit-modal"

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

export default function CustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, loading, error, page, limit, totalPages, searchQuery, totalCustomers } = useSelector((state: RootState) => state.customer);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleShowDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
    setIsDetailsModalOpen(false);
  };

  // İlk yükleme
  useEffect(() => {
    dispatch(getCustomers({ page, limit, search: searchQuery }));
  }, [dispatch, page, limit, searchQuery]);

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

  // ALERT OLMALI , SILININCE F5 OTO YUKLENSIN
  const handleDeleteCustomer = (id: string) => {
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      dispatch(deleteCustomer(id));
    }
  };

  // const handleEditCustomer = (id: string) => {
  //   dispatch(setCustomer(id));
  // };

  // const showCustomerDetails = (customer: Customer) => {
  //   dispatch(setCustomer(customer));
  // };

  if (loading) {
    return <MiniLoading />
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">
      <span className="text-red-500">{error}</span>
    </div>
  }

  return (
    <div className="grid space-y-4">
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
        <Button className="w-full sm:w-auto">
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
              <TableHead>Yetkili Kişi</TableHead>
              <TableHead>Firma Adı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Ülke</TableHead>
              <TableHead>Son İşlem Tarihi</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          {/* Tablo Body */}
          <TableBody>
            {customers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Henüz müşteri kaydı bulunmuyor.'}
                </TableCell>
              </TableRow>
            ) : (
              customers?.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  {/* Yetkili Kişi */}
                  <TableCell>
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
                  {/* Firma Adı */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {customer.company?.length > 25 ? `${customer.company.slice(0, 25)}...` : customer.company}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{customer.company}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  {/* E-posta */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${customer.email}`} className="hover:underline">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {customer.email?.length > 25 ? `${customer.email.slice(0, 25)}...` : customer.email}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{customer.email}</p>
                          </TooltipContent>
                        </Tooltip>
                      </a>
                    </div>
                  </TableCell>
                  {/* Telefon */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${customer.phone}`} className="hover:underline">
                        {customer.phone}
                      </a>
                    </div>
                  </TableCell>
                  {/* Ülke */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            {!customer.country ? '-' : (customer.country.length > 12 ? `${customer.country.slice(0, 12)}...` : customer.country)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{customer.country}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  {/* Son İşlem Tarihi */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(customer.lastTransactionDate)}
                    </div>
                  </TableCell>
                  {/* İşlemler */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShowDetails(customer)}>Detayları Görüntüle</DropdownMenuItem>
                        <DropdownMenuItem>Düzenle</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
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
    </div>


  )
}