"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { createDocument, updateDocument, Document, DocumentType, DocumentStatus } from "@/redux/slices/documentSlice"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, Loader2, FileText, User, Ship, Anchor, Briefcase, Upload, X, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/api/axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const documentFormSchema = z.object({
  title: z.string().min(1, "Belge başlığı zorunludur"),
  type: z.enum(['contract', 'certificate', 'permit', 'ncts', 'summary_declaration', 'customs_correspondence', 'e_document', 'other'] as const),
  documentNumber: z.string().optional(),
  issueDate: z.date().optional().nullable(),
  expiryDate: z.date().optional().nullable(),
  status: z.enum(['valid', 'expired', 'expiring-soon', 'draft'] as const),
  notes: z.string().optional(),
  customerId: z.number().optional().nullable(),
  shipId: z.number().optional().nullable(),
  operationId: z.number().optional().nullable(),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

interface DocumentAddOrEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: Document | null
  onSuccess?: () => void
}

const typeOptions = [
  { value: 'contract' as DocumentType, label: 'Sözleşme' },
  { value: 'certificate' as DocumentType, label: 'Sertifika' },
  { value: 'permit' as DocumentType, label: 'İzin' },
  { value: 'ncts' as DocumentType, label: 'NCTS' },
  { value: 'summary_declaration' as DocumentType, label: 'Özet Beyan' },
  { value: 'customs_correspondence' as DocumentType, label: 'Gümrük Yazışması' },
  { value: 'e_document' as DocumentType, label: 'E-Belge' },
  { value: 'other' as DocumentType, label: 'Diğer' },
]

const statusOptions = [
  { value: 'valid' as DocumentStatus, label: 'Geçerli', color: 'bg-green-100 text-green-800' },
  { value: 'expired' as DocumentStatus, label: 'Süresi Dolmuş', color: 'bg-red-100 text-red-800' },
  { value: 'expiring-soon' as DocumentStatus, label: 'Yakında Dolacak', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'draft' as DocumentStatus, label: 'Taslak', color: 'bg-gray-100 text-gray-800' },
]

export function DocumentAddOrEditModal({
  open,
  onOpenChange,
  document,
  onSuccess
}: DocumentAddOrEditModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Array<{ id: number; name: string }>>([])
  const [ships, setShips] = useState<Array<{ id: number; name: string; imoNumber?: string }>>([])
  const [operations, setOperations] = useState<Array<{ id: number; name: string }>>([])
  const [loadingData, setLoadingData] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [relationType, setRelationType] = useState<'customer' | 'ship' | 'operation' | null>(null)

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      type: 'other',
      documentNumber: "",
      issueDate: null,
      expiryDate: null,
      status: 'draft',
      notes: "",
      customerId: null,
      shipId: null,
      operationId: null,
    },
  })

  // Fetch customers, ships, operations
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');

      const [customersRes, shipsRes, operationsRes] = await Promise.all([
        api.get(`/customer?${params.toString()}`),
        api.get(`/ship?${params.toString()}`),
        api.get(`/operation?${params.toString()}`)
      ])

      setCustomers(customersRes.data.customers || customersRes.data || [])
      setShips(shipsRes.data.ships || shipsRes.data || [])
      setOperations(operationsRes.data.operations || operationsRes.data || [])
    } catch (error: any) {
      console.error("Veri yüklenirken hata:", error)
      toast.error("Veriler yüklenirken bir hata oluştu")
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (document) {
      // İlişki tipini belirle
      if (document.customer?.id) {
        setRelationType('customer')
      } else if (document.ship?.id) {
        setRelationType('ship')
      } else if (document.operation?.id) {
        setRelationType('operation')
      } else {
        setRelationType(null)
      }

      form.reset({
        title: document.title || "",
        type: document.type || 'other',
        documentNumber: document.documentNumber || "",
        issueDate: document.issueDate ? new Date(document.issueDate) : null,
        expiryDate: document.expiryDate ? new Date(document.expiryDate) : null,
        status: document.status || 'draft',
        notes: document.notes || "",
        customerId: document.customer?.id || null,
        shipId: document.ship?.id || null,
        operationId: document.operation?.id || null,
      })
    } else {
      resetForm()
    }
  }, [document, open])

  // İlişki tipi değiştiğinde diğerlerini temizle
  useEffect(() => {
    if (relationType === 'customer') {
      form.setValue('shipId', null)
      form.setValue('operationId', null)
    } else if (relationType === 'ship') {
      form.setValue('customerId', null)
      form.setValue('operationId', null)
    } else if (relationType === 'operation') {
      form.setValue('customerId', null)
      form.setValue('shipId', null)
    } else {
      form.setValue('customerId', null)
      form.setValue('shipId', null)
      form.setValue('operationId', null)
    }
  }, [relationType])

  // Form değerlerinden ilişki tipini belirle
  useEffect(() => {
    const customerId = form.watch('customerId')
    const shipId = form.watch('shipId')
    const operationId = form.watch('operationId')

    if (customerId) {
      setRelationType('customer')
    } else if (shipId) {
      setRelationType('ship')
    } else if (operationId) {
      setRelationType('operation')
    } else {
      setRelationType(null)
    }
  }, [form.watch('customerId'), form.watch('shipId'), form.watch('operationId')])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Dosya boyutu 10MB'dan büyük olamaz")
        return
      }
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      setIsSubmitting(true)

      // Create mode requires file
      if (!document && !selectedFile) {
        toast.error("Lütfen bir dosya seçin")
        return
      }

      const submitData = {
        ...data,
        issueDate: data.issueDate ? data.issueDate.toISOString().split('T')[0] : undefined,
        expiryDate: data.expiryDate ? data.expiryDate.toISOString().split('T')[0] : undefined,
        customerId: data.customerId || undefined,
        shipId: data.shipId || undefined,
        operationId: data.operationId || undefined,
      }

      if (document) {
        await dispatch(updateDocument({
          id: document.id.toString(),
          data: submitData,
          file: selectedFile || undefined
        })).unwrap()
        toast.success("Belge başarıyla güncellendi")
      } else {
        if (!selectedFile) {
          toast.error("Lütfen bir dosya seçin")
          return
        }
        await dispatch(createDocument({ data: submitData, file: selectedFile })).unwrap()
        toast.success("Belge başarıyla oluşturuldu")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Belge kaydedilirken hata oluştu:", error)
      toast.error(error?.message || "Belge kaydedilirken bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setRelationType(null)
    form.reset({
      title: "",
      type: 'other',
      documentNumber: "",
      issueDate: null,
      expiryDate: null,
      status: 'draft',
      notes: "",
      customerId: null,
      shipId: null,
      operationId: null,
    })
    form.clearErrors()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] lg:min-w-[900px] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document ? "Belge Bilgilerini Düzenle" : "Yeni Belge Yükle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* File Upload Section */}
            <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Dosya
              </h4>
              {!document && (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Dosya Seç <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maksimum dosya boyutu: 10MB. Desteklenen formatlar: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF, TXT
                  </p>
                </FormItem>
              )}
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {document && !selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{document.fileName}</span>
                  <span className="text-xs text-muted-foreground">
                    {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="text-xs text-muted-foreground">(Mevcut dosya)</span>
                </div>
              )}
              {document && (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Yeni Dosya Seç (Opsiyonel)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Temel Bilgiler
                </h4>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Belge Başlığı <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Belge başlığını giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Belge Tipi <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Tip seçiniz" />
                              </SelectTrigger>
                              <SelectContent>
                                {typeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            Durum <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Durum seçiniz" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="documentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Belge Numarası
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Belge numarasını giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Tarihler
                </h4>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs text-muted-foreground">
                          Yayın Tarihi
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {field.value ? (
                                  format(field.value, "PPP", { locale: tr })
                                ) : (
                                  <span>Tarih seçin</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date || null)}
                              locale={tr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs text-muted-foreground">
                          Son Geçerlilik Tarihi
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {field.value ? (
                                  format(field.value, "PPP", { locale: tr })
                                ) : (
                                  <span>Tarih seçin</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date || null)}
                              locale={tr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Relations */}
            <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                İlişkilendirme (Opsiyonel)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        Müşteri
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Müşteri seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">İlişkilendirme yok</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shipId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                        <Anchor className="h-3.5 w-3.5" />
                        Gemi
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Gemi seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">İlişkilendirme yok</SelectItem>
                          {ships.map((ship) => (
                            <SelectItem key={ship.id} value={ship.id.toString()}>
                              {ship.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        Operasyon
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Operasyon seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">İlişkilendirme yok</SelectItem>
                          {operations.map((operation) => (
                            <SelectItem key={operation.id} value={operation.id.toString()}>
                              {operation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Notlar
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notlarınızı buraya yazabilirsiniz..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {document ? "Güncelle" : "Yükle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

