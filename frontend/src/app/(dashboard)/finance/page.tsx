import React from 'react'

import { Search, Plus, Download, Filter, MoreHorizontal, TrendingUp, TrendingDown, FileText, Clock, CheckCircle2, XCircle, Clock3, DollarSign, RefreshCw, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Type definitions
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft'
type TransactionType = 'income' | 'expense'

interface Invoice {
  id: string
  invoiceNumber: string
  customer: string
  vessel?: string
  amount: number
  currency: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  type: TransactionType
  description?: string
  paidAmount?: number
  paidDate?: string
}

// Sample data
const invoices: Invoice[] = [
  {
    id: 'INV-2023-1001',
    invoiceNumber: '2023/1001',
    customer: 'ABC Denizcilik',
    vessel: 'MV Blue Star',
    amount: 125000,
    currency: 'USD',
    issueDate: '2023-06-01',
    dueDate: '2023-07-01',
    status: 'paid',
    type: 'income',
    description: 'Temmuz ayı acente hizmet bedeli',
    paidAmount: 125000,
    paidDate: '2023-06-28'
  },
  {
    id: 'INV-2023-1002',
    invoiceNumber: '2023/1002',
    customer: 'XYZ Lojistik',
    vessel: 'MV Green Ocean',
    amount: 87500,
    currency: 'EUR',
    issueDate: '2023-06-05',
    dueDate: '2023-07-05',
    status: 'pending',
    type: 'income',
    description: 'Haziran ayı liman hizmetleri'
  },
  {
    id: 'EXP-2023-0456',
    invoiceNumber: 'EXP-0456',
    customer: 'Deniz Temizlik Hizmetleri',
    amount: 18500,
    currency: 'TRY',
    issueDate: '2023-06-10',
    dueDate: '2023-06-30',
    status: 'overdue',
    type: 'expense',
    description: 'Gemi temizlik hizmeti'
  },
  {
    id: 'INV-2023-1003',
    invoiceNumber: '2023/1003',
    customer: 'Global Shipping Inc.',
    vessel: 'MV Ocean Queen',
    amount: 156000,
    currency: 'USD',
    issueDate: '2023-06-15',
    dueDate: '2023-07-15',
    status: 'pending',
    type: 'income',
    description: 'Temmuz ayı kira bedeli'
  },
  {
    id: 'DRAFT-001',
    invoiceNumber: 'TASLAK-001',
    customer: 'Akdeniz Nakliyat',
    amount: 45000,
    currency: 'USD',
    issueDate: '2023-06-20',
    dueDate: '2023-07-20',
    status: 'draft',
    type: 'income',
    description: 'Temmuz ayı acente hizmet bedeli'
  }
]

// Helper functions
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Ödendi
      </Badge>
    case 'pending':
      return <Badge variant="outline" className="border-amber-500 text-amber-600">
        <Clock3 className="mr-1 h-3 w-3" /> Bekliyor
      </Badge>
    case 'overdue':
      return <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" /> Gecikmiş
      </Badge>
    case 'draft':
      return <Badge variant="outline" className="bg-muted text-muted-foreground">
        Taslak
      </Badge>
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function FinancePage() {
  // Calculate summary values
  const totalIncome = invoices
    .filter(inv => inv.type === 'income' && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const totalExpenses = invoices
    .filter(inv => inv.type === 'expense' && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending')
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finans Yönetimi</h1>
          <p className="text-muted-foreground">Faturalarınızı ve finansal işlemlerinizi yönetin</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span>Rapor Al</span>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Yeni Fatura</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome, 'USD')}</div>
            <p className="text-xs text-muted-foreground">+20.1% son aya göre</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses, 'USD')}</div>
            <p className="text-xs text-muted-foreground">+5.3% son aya göre</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('tr-TR')} {invoices[0]?.currency}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geciken Ödemeler</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('tr-TR')} {invoices[0]?.currency}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Fatura no, müşteri adı veya gemi adı ile ara..."
              className="pl-9 w-full"
            />
          </div>
          <div className="flex gap-2">
    >
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">Tümü</TabsTrigger>
              <TabsTrigger value="income">Gelirler</TabsTrigger>
              <TabsTrigger value="expenses">Giderler</TabsTrigger>
              <TabsTrigger value="pending">Bekleyenler</TabsTrigger>
              <TabsTrigger value="overdue">Gecikenler</TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              Toplam {invoices.length} fatura bulundu
            </div>
          </div>

          {/* Invoices Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Müşteri/Gemi</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead>Düzenlenme</TableHead>
                  <TableHead>Vade Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {invoice.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        {invoice.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.customer}</div>
                      {invoice.vessel && (
                        <div className="text-sm text-muted-foreground">{invoice.vessel}</div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={invoice.description}>
                      {invoice.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>
                      <div className={invoice.status === 'overdue' ? 'text-red-500 font-medium' : ''}>
                        {formatDate(invoice.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">İşlemler</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Görüntüle</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Düzenle</DropdownMenuItem>
                          {invoice.status !== 'paid' && (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              <span>Ödeme Alındı</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>İptal Et</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
