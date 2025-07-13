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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import React from 'react'
import ReactFlagsSelect from 'react-flags-select'

const formSchema = z.object({
    name: z.string().nonempty({ message: "Yetkili Kişinin Adı Soyadı zorunludur" }),
    email: z.string().email({ message: "Lütfen geçerli bir e-posta adresi giriniz" }),
    phone: z.string().nonempty({ message: "Telefon numarası zorunlu" })
        .regex(/^\+?[0-9]{1,30}$/, { message: "Geçerli bir telefon numarası giriniz. En fazla 30 haneli olmalıdır", }),
    address: z.string().max(500, { message: "Adres en fazla 500 karakter uzunluğunda olmalıdır" }).optional(),
    country: z.string().max(100, { message: "Ülke en fazla 100 karakter uzunluğunda olmalıdır" }).optional(),
    company: z.string().max(500, { message: "Firma en fazla 500 karakter uzunluğunda olmalıdır" }).optional(),
    notes: z.string().optional()
})

type CustomerFormValues = z.infer<typeof formSchema>

interface Customer {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    country?: string
    company?: string
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
    const { loading, error } = useSelector((state: RootState) => state.customer)

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            country: "",
            company: "",
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
                    address: customer.address || "",
                    country: customer.country || "",
                    company: customer.company || "",
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
            toast.error(error?.message || "Bir hata oluştu")
        } finally {
            setIsSubmitting(false); // İşlem bittiğinde veya hata durumunda state'i sıfırla
        }
    }

    if (!isMounted) return null

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{customer ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yetkili Kişi <span className="text-red-500">*</span></FormLabel>
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
                                        <FormLabel>E-posta <span className="text-red-500">*</span></FormLabel>
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
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
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
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ülke</FormLabel>
                                        <FormControl>
                                            <ReactFlagsSelect
                                                className="my-custom-flags-select"
                                                placeholder="-"
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
                                        <FormLabel>Adres</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Adres bilgisi giriniz"
                                                className="min-h-[80px]"
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
                                        <FormLabel>Not</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Notunuz varsa giriniz"
                                                className="min-h-[80px]"
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
    )
}