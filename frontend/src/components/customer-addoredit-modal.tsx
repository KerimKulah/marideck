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
import { Building2, Globe, IdCard, Mail, MapPin, Phone, StickyNote, User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Script from 'next/script';

// Custom LordIcon component
declare global {
    interface Window {
        loadAnimation?: any;
    }
}

interface LordIconProps {
    src: string;
    trigger?: string;
    delay?: string;
    colors?: string;
    style?: React.CSSProperties;
    className?: string;
}

const LordIcon: React.FC<LordIconProps> = ({
    src,
    trigger = 'loop',
    delay = '2000',
    colors = 'primary:#121331,secondary:#0473a3',
    style = {},
    className = ''
}) => {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.loadAnimation) {
            window.loadAnimation();
        }
    }, [src]);

    // Create the HTML string for the lord-icon
    const iconHtml = {
        __html: `
            <lord-icon
                src="${src}"
                trigger="${trigger}"
                delay="${delay}"
                colors="${colors}"
                style="width: 100%; height: 100%; ${Object.entries(style)
                .map(([key, value]) => `${key}: ${value};`)
                .join(' ')}"
                class="${className}">
            </lord-icon>
        `
    };

    return <div dangerouslySetInnerHTML={iconHtml} />;
};

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
            <Script src="https://cdn.lordicon.com/lordicon.js" strategy="beforeInteractive" />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="border rounded-full p-4">
                                <LordIcon
                                    src="https://cdn.lordicon.com/kdduutaw.json"
                                    trigger="hover"
                                    delay="2000"
                                    colors="primary:#121331,secondary:#0672a2"
                                    style={{ width: '100px', height: '100px' }}
                                />
                            </div>
                            <DialogTitle className="text-center">
                                {customer ? 'Müşteri Bilgilerini Düzenle' : 'Yeni Müşteri Ekle'}
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                {customer ? 'Müşteri bilgilerini düzenlemek için yeni bilgileri giriniz.' : 'Eklemek istediğiniz müşterinin bilgilerini giriniz.'}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                Ad Soyad <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ad Soyad giriniz" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                E-posta <span className="text-red-500">*</span></FormLabel>
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
                                            <FormLabel>
                                                <Phone className="h-4 w-4 text-muted-foreground " />
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
                                    name="customerType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                Müşteri Türü
                                                <span className="text-xs text-red-500">*</span>
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
                                            <FormLabel>
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                Firma
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Firma adı giriniz" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="taxNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <IdCard className="h-4 w-4 text-muted-foreground" />
                                                Vergi Numarası
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Vergi Numarası giriniz" {...field} />
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
                                            <FormLabel>
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                Ülke
                                            </FormLabel>
                                            <FormControl>
                                                <ReactFlagsSelect
                                                    className="my-custom-flags-select"
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

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                Adres
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Adres bilgisi giriniz"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <StickyNote className="h-4 w-4 text-muted-foreground" />
                                                Not
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Notunuz varsa giriniz"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    İptal
                                </Button>
                                <Button type="submit" disabled={loading || isSubmitting}>
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