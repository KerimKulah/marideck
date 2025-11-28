"use client"

// SON HALİ

import PhoneInput from 'react-phone-input-2'
import tr from 'react-phone-input-2/lang/tr.json'
import 'react-phone-input-2/lib/style.css'
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createCustomer, updateCustomer } from "@/redux/slices/customerSlice"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import React from 'react'
import ReactFlagsSelect from 'react-flags-select'
import { Building2, Globe, IdCard, Mail, MapPin, Phone, StickyNote, User, Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    name: z.string().nonempty({ message: "Yetkili Kişinin Adı Soyadı zorunludur" }),
    email: z.string().email({ message: "Lütfen geçerli bir e-posta adresi giriniz" }),
    phone: z.string().nonempty({ message: "Telefon numarası zorunlu" })
        .regex(/^\+?[0-9]{1,30}$/, { message: "Geçerli bir telefon numarası giriniz. En fazla 30 haneli olmalıdır", }),
    taxNumber: z.string().optional(),
    address: z.string().max(500, { message: "Adres en fazla 500 karakter uzunluğunda olmalıdır" }).optional(),
    country: z.string().max(100, { message: "Ülke en fazla 100 karakter uzunluğunda olmalıdır" }).optional(),
    company: z.string().max(500, { message: "Firma en fazla 500 karakter uzunluğunda olmalıdır" }).optional(),
    customerType: z.enum(["Armatör", "Broker", "Taşımacı", "Acente", "Yük Sahibi", "İhracatçı", "İthalatçı", "Terminal Operatörü", "Port Yetkilisi", "Gümrük Müşaviri", "Hukuk Temsilcisi", "Diğer"], {
        required_error: "Müşteri türü zorunlu",
        invalid_type_error: "Geçersiz müşteri türü"
    }),
    notes: z.string().optional()
})

type CustomerFormValues = z.infer<typeof formSchema>

enum CustomerType {
    Armator = 'Armatör',
    Broker = 'Broker',
    FreightForwarder = 'Taşımacı',
    Acente = 'Acente',
    YukSahibi = 'Yük Sahibi',
    Exporter = 'İhracatçı',
    Importer = 'İthalatçı',
    TerminalOperator = 'Terminal Operatörü',
    PortAuthority = 'Port Yetkilisi',
    CustomsBroker = 'Gümrük Müşaviri',
    LegalRepresentative = 'Hukuk Temsilcisi',
    Diger = 'Diğer'
}

interface Customer {
    id: string
    name: string
    email: string
    phone?: string
    taxNumber?: string
    address?: string
    country?: string
    company?: string
    customerType?: CustomerType
    notes?: string
}

interface CustomerAddOrEditModalProps {
    isOpen: boolean
    onClose: () => void
    customer?: Customer | null
    onSuccess?: () => void
}

const uppercaseLabels = Object.keys(tr).reduce((acc, key) => {
    acc[key.toUpperCase()] = tr[key as keyof typeof tr];
    return acc;
}, {} as Record<string, string>);

export function CustomerAddOrEditModal({ isOpen, onClose, customer, onSuccess }: CustomerAddOrEditModalProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { loading } = useSelector((state: RootState) => state.customer)

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            taxNumber: "",
            address: "",
            country: "",
            company: "",
            customerType: undefined,
            notes: "",
        },
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
            if (customer) {
                form.reset({
                    name: customer.name || "",
                    email: customer.email || "",
                    phone: customer.phone || "",
                    taxNumber: customer.taxNumber || "",
                    address: customer.address || "",
                    country: customer.country || "",
                    company: customer.company || "",
                    customerType: customer.customerType || undefined,
                    notes: customer.notes || "",
                })
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    country: "",
                    company: "",
                    customerType: undefined,
                    notes: "",
                })
            }
        }
    }, [customer, form, isOpen])

    const handleClose = () => {
        form.reset()
        onClose()
    }

    const onSubmit = async (values: CustomerFormValues) => {
        if (isSubmitting) return; // Eğer zaten gönderiliyorsa işlemi engelle

        setIsSubmitting(true); // Gönderim başladı
        try {
            if (customer) {
                // Update existing customer - send only the updated fields
                await dispatch(updateCustomer({
                    id: customer.id,
                    data: values
                })).unwrap()
                toast.success("Müşteri başarıyla güncellendi")
            } else {
                // Create new customer
                await dispatch(createCustomer(values)).unwrap()
                toast.success("Müşteri başarıyla oluşturuldu")
            }

            // Form'u temizle
            form.reset()

            // Başarılı işlem callback'ini çağır
            if (onSuccess) {
                onSuccess()
            }

            // Modal'ı kapat
            onClose()
        } catch (error: any) {
            toast.error("Hata oluştu :" + error?.message || "Bir hata oluştu")
        } finally {
            setIsSubmitting(false); // İşlem bittiğinde veya hata durumunda state'i sıfırla
        }
    }

    if (!isMounted) return null

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] lg:min-w-[700px] max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-semibold">
                            {customer ? ('Müşteri Bilgilerini Düzenle') : ('Yeni Müşteri Ekle')}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Profil Header - Kompakt */}
                    {customer && (
                        <div className="flex items-center gap-4 py-4 border-b">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                                <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-foreground break-words">
                                    {customer.name || 'Müşteri'}
                                </h3>
                                {customer.company && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground break-words">
                                            {customer.company}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Bilgiler Grid - Kompakt ve Kurumsal */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 min-w-0">
                                {/* Temel Bilgiler Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Temel Bilgiler
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Ad Soyad <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ad Soyad giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="customerType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Müşteri Türü <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value || ""}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Müşteri türü seçiniz" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.values(CustomerType).map((type) => (
                                                                    <SelectItem key={type} value={type}>
                                                                        {type}
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
                                            name="company"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Firma
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Firma adı giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* İletişim Bilgileri Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        İletişim
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        E-posta <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="E-posta giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Telefon <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <PhoneInput
                                                            placeholder="Telefon numarası giriniz"
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            country={'tr'}
                                                            localization={tr}
                                                            enableSearch={true}
                                                            searchPlaceholder="Ülke kodu ara.."
                                                            inputStyle={{
                                                                width: '100%',
                                                                borderRadius: '8px',
                                                                borderColor: 'rgba(161, 161, 161, 0.3)',
                                                                height: '36px',
                                                            }}
                                                            buttonStyle={{
                                                                backgroundColor: "white",
                                                                borderColor: 'rgba(161, 161, 161, 0.3)',
                                                                borderRadius: '8px 0 0  8px',
                                                                height: '36px',
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Ülke
                                                    </FormLabel>
                                                    <FormControl>
                                                        <ReactFlagsSelect
                                                            className="my-custom-flags-select pt-2"
                                                            placeholder="Ülke seçiniz"
                                                            onSelect={field.onChange}
                                                            selected={field.value || ""}
                                                            searchable={true}
                                                            searchPlaceholder="Ülke adı ara.."
                                                            customLabels={uppercaseLabels}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Detaylı Bilgiler Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <IdCard className="h-4 w-4 text-muted-foreground" />
                                        Detaylı Bilgiler
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="taxNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Vergi Numarası
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Vergi Numarası giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Adres Kartı - Tam Genişlik */}
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-3 min-w-0 w-full">
                                            <div className="bg-muted/30 rounded-lg border p-4 space-y-3 w-full min-w-0 overflow-hidden">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    Adres
                                                </h4>
                                                <FormControl className="w-full min-w-0">
                                                    <Textarea
                                                        placeholder="Adres bilgisi giriniz"
                                                        className="min-h-[80px] resize-none break-words overflow-wrap-anywhere w-full min-w-0"
                                                        style={{ maxWidth: '100%' }}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Notlar Kartı - Tam Genişlik */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-3 min-w-0 w-full">
                                            <div className="bg-muted/30 rounded-lg border p-4 space-y-3 w-full min-w-0 overflow-hidden">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                                                    Not
                                                </h4>
                                                <FormControl className="w-full min-w-0">
                                                    <Textarea
                                                        placeholder="Notunuz varsa giriniz"
                                                        className="min-h-[80px] resize-none break-words overflow-wrap-anywhere w-full min-w-0"
                                                        style={{ maxWidth: '100%' }}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={loading || isSubmitting}
                                    className="px-6"
                                >
                                    İptal
                                </Button>
                                <Button type="submit" disabled={loading || isSubmitting} className="px-6">
                                    {loading || isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {customer ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                                        </div>
                                    ) : customer ? 'Güncelle' : 'Oluştur'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}