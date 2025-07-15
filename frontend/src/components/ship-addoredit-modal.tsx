"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createShip, updateShip } from "@/redux/slices/shipSlice"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import React from 'react'
import { Building2, Calendar, FlagIcon, Globe, IdCard, Mail, MapPin, Phone, Sailboat, Ship, StickyNote, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import ReactFlagsSelect from "react-flags-select"
import tr from 'react-phone-input-2/lang/tr.json'

// Düzeltilmiş form şeması - backend ile uyumlu
const formSchema = z.object({
    imoNumber: z.string().optional(),
    mmsiNumber: z.string().optional(),
    callsign: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    flag: z.string().optional(),
    lat: z.coerce.number().optional(),
    lon: z.coerce.number().optional(),
    speed: z.coerce.number().optional(),
    course: z.coerce.number().optional(),
    eta: z.date().optional(),
    etd: z.date().optional(),
    lastPort: z.string().optional(),
    currentPort: z.string().optional(),
    nextPort: z.string().optional(),
    status: z.string().optional(),
    shipOwner: z.string().optional(),
    agent: z.string().optional(),
    builtYear: z.coerce.number().optional(),
    grossTonnage: z.coerce.number().optional(),
    deadweight: z.coerce.number().optional(),
    draft: z.coerce.number().optional(),
    length: z.coerce.number().optional(),
    beam: z.coerce.number().optional(),
    notes: z.string().optional(),
    customerId: z.coerce.number().optional(),
    cargoDetails: z.string().optional(),
})

type ShipFormValues = z.infer<typeof formSchema>

const uppercaseLabels = Object.keys(tr).reduce((acc, key) => {
    acc[key.toUpperCase()] = tr[key as keyof typeof tr];
    return acc;
}, {} as Record<string, string>);

interface Ship {
    id?: number;
    imoNumber?: string;
    mmsiNumber?: string;
    callsign?: string;
    name?: string;
    type?: string;
    flag?: string;
    lat?: number;
    lon?: number;
    speed?: number;
    course?: number;
    eta?: Date;
    etd?: Date;
    lastPort?: string;
    currentPort?: string;
    nextPort?: string;
    status?: string;
    shipOwner?: string;
    agent?: string;
    builtYear?: number;
    grossTonnage?: number;
    deadweight?: number;
    draft?: number;
    notes?: string;
    length?: number;
    beam?: number;
    customerId?: number;
    cargoDetails?: string;
}

interface ShipAddOrEditModalProps {
    isOpen: boolean
    onClose: () => void
    ship?: Ship | null
    onSuccess?: () => void
}

export function ShipAddOrEditModal({ isOpen, onClose, ship, onSuccess }: ShipAddOrEditModalProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { loading, error } = useSelector((state: RootState) => state.ship)
    const [showAdvanced, setShowAdvanced] = useState(false)


    const form = useForm<ShipFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            imoNumber: "",
            mmsiNumber: "",
            callsign: "",
            name: "",
            type: "",
            flag: "",
            lat: undefined,
            lon: undefined,
            speed: undefined,
            course: undefined,
            eta: undefined,
            etd: undefined,
            lastPort: "",
            currentPort: "",
            nextPort: "",
            status: "",
            shipOwner: "",
            agent: "",
            builtYear: undefined,
            grossTonnage: undefined,
            deadweight: undefined,
            draft: undefined,
            length: undefined,
            beam: undefined,
            notes: "",
            customerId: undefined,
            cargoDetails: "",
        },
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
            if (ship) {
                form.reset({
                    imoNumber: ship.imoNumber || "",
                    mmsiNumber: ship.mmsiNumber || "",
                    callsign: ship.callsign || "",
                    name: ship.name || "",
                    type: ship.type || "",
                    flag: ship.flag || "",
                    lat: ship.lat || undefined,
                    lon: ship.lon || undefined,
                    speed: ship.speed || undefined,
                    course: ship.course || undefined,
                    eta: ship.eta || undefined,
                    etd: ship.etd || undefined,
                    lastPort: ship.lastPort || "",
                    currentPort: ship.currentPort || "",
                    nextPort: ship.nextPort || "",
                    status: ship.status || "",
                    shipOwner: ship.shipOwner || "",
                    agent: ship.agent || "",
                    builtYear: ship.builtYear || undefined,
                    grossTonnage: ship.grossTonnage || undefined,
                    deadweight: ship.deadweight || undefined,
                    draft: ship.draft || undefined,
                    length: ship.length || undefined,
                    beam: ship.beam || undefined,
                    notes: ship.notes || "",
                    customerId: ship.customerId || undefined,
                    cargoDetails: ship.cargoDetails || "",
                })
            } else {
                form.reset({
                    imoNumber: "",
                    mmsiNumber: "",
                    callsign: "",
                    name: "",
                    type: "",
                    flag: "",
                    lat: undefined,
                    lon: undefined,
                    speed: undefined,
                    course: undefined,
                    eta: undefined,
                    etd: undefined,
                    lastPort: "",
                    currentPort: "",
                    nextPort: "",
                    status: "",
                    shipOwner: "",
                    agent: "",
                    builtYear: undefined,
                    grossTonnage: undefined,
                    deadweight: undefined,
                    draft: undefined,
                    length: undefined,
                    beam: undefined,
                    notes: "",
                    customerId: undefined,
                    cargoDetails: "",
                })
            }
        }
    }, [ship, form, isOpen])

    const handleClose = () => {
        form.reset()
        onClose()
    }

    const onSubmit = async (values: ShipFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Boş string değerlerini undefined'a çevirme
            const cleanedValues = Object.fromEntries(
                Object.entries(values).map(([key, value]) => [
                    key,
                    value === "" ? undefined : value
                ])
            );

            if (ship) {
                await dispatch(updateShip({
                    id: ship.id?.toString() || "",
                    data: cleanedValues
                })).unwrap()
                toast.success("Gemi bilgileri başarıyla güncellendi")
            } else {
                await dispatch(createShip(cleanedValues)).unwrap()
                toast.success("Gemi başarıyla oluşturuldu")
            }

            form.reset()
            if (onSuccess) {
                onSuccess()
            }
            onClose()
        } catch (error: any) {
            toast.error(error?.message || "Bir hata oluştu")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isMounted) return null

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="mb-4">{ship ? "Gemi Bilgilerini Düzenle" : "Yeni Gemi Ekle"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Temel Bilgiler */}
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Ship className="h-4 w-4 text-muted-foreground" />
                                            Gemi Adı
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Gemi adı giriniz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imoNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <IdCard className="h-4 w-4 text-muted-foreground" />
                                            IMO Numarası
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="IMO numarası" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mmsiNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            MMSI Numarası
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="MMSI numarası" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="callsign"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            Çağrı İşareti (Callsign)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Çağrı işareti" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Ship className="h-4 w-4 text-blue-500" />
                                            Gemi Tipi
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Gemi tipi" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="flag"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <FlagIcon className="h-4 w-4 text-muted-foreground" />
                                            Bayrak
                                        </FormLabel>
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
                        </div>

                        {/* Zaman Bilgileri */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="eta"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            ETA (Tahmini Varış)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="etd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            ETD (Tahmini Kalkış)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-sm text-blue-600 hover:underline"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? "Gelişmiş Bilgileri Gizle" : "Gelişmiş Bilgileri Göster"}
                        </Button>


                        {showAdvanced && (
                            <div className="mt-4 space-y-4">
                                {/* Liman Bilgileri */}
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lastPort"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Son Liman
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Son liman" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="currentPort"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Şu Anki Liman
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Şu anki liman" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="nextPort"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Sonraki Liman
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Sonraki liman" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Durum ve Sahiplik */}
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Durum
                                                </FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Durum Seçin" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="devam-eden">Devam Eden</SelectItem>
                                                            <SelectItem value="limanda">Limanda</SelectItem>
                                                            <SelectItem value="gecikme">Gecikme</SelectItem>
                                                            <SelectItem value="bekleme">Bekleme</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="shipOwner"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    Armatör
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Armatör" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="agent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    Agent
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Agent" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Müşteri ve Yük */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="customerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    İlgili Müşteri
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Müşteri ID" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="cargoDetails"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Yük Detayları
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Yük detayları" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Notlar */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <StickyNote className="h-4 w-4 text-muted-foreground" />
                                                Notlar
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Notlar" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="lat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Enlem (Latitude)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Enlem" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lon"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Boylam (Longitude)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Boylam" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="speed"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hız (knot)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Hız" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="course"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rota (derece)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Rota" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="builtYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>İnşa Yılı</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Yıl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="grossTonnage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gross Tonnage</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="GT" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="deadweight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Deadweight</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="DWT" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="draft"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Draft (m)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Draft" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="length"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Uzunluk (m)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Length" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="beam"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Genişlik (Beam)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Beam" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "İşleniyor..." : ship ? "Güncelle" : "Kaydet"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}