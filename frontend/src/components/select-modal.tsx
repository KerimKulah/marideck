"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Loader2, Search, X } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getCustomers } from "@/redux/slices/customerSlice"
import { getShips } from "@/redux/slices/shipSlice"

interface SelectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: "customer" | "ship"
    onSelect: (item: any) => void
}

export function SelectModal({ open, onOpenChange, type, onSelect }: SelectModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [search, setSearch] = useState("")
    const [selectedItem, setSelectedItem] = useState<any>(null)

    // Redux state'lerini al
    const {
        items,
        loading,
        page,
        totalPages,
        totalItems
    } = useSelector((state: RootState) =>
        type === "customer"
            ? {
                items: state.customer.customers,
                loading: state.customer.loading,
                page: state.customer.page,
                totalPages: state.customer.totalPages,
                totalItems: state.customer.totalCustomers
            }
            : {
                items: state.ship.ships,
                loading: state.ship.loading,
                page: state.ship.page,
                totalPages: state.ship.totalPages,
                totalItems: state.ship.totalShips
            }
    )

    // Arama ve sayfalama için verileri yükle
    useEffect(() => {
        const fetchData = async () => {
            const action = type === "customer" ? getCustomers : getShips
            await dispatch(action({
                page: 1,
                limit: 10,
                search
            }))
        }

        const timer = setTimeout(() => {
            fetchData()
        }, 500)

        return () => clearTimeout(timer)
    }, [search, dispatch, type])

    // Sayfa değişikliğinde verileri yükle
    const handlePageChange = (newPage: number) => {
        const action = type === "customer" ? getCustomers : getShips
        dispatch(action({
            page: newPage,
            limit: 10,
            search
        }))
    }

    // Öğe seçildiğinde
    const handleSelect = () => {
        if (selectedItem) {
            onSelect(selectedItem)
            onOpenChange(false)
            setSelectedItem(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {type === "customer" ? "Müşteri Seç" : "Gemi Seç"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={type === "customer" ? "Müşteri ara..." : "Gemi ara..."}
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <X
                                className="absolute right-3 top-3 h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                                onClick={() => setSearch("")}
                            />
                        )}
                    </div>

                    <div className="border rounded-md flex-1 overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead>Seç</TableHead>
                                    <TableHead>{type === "customer" ? "Müşteri Adı" : "Gemi Adı"}</TableHead>
                                    {type === "customer" ? (
                                        <TableHead>Şirket</TableHead>
                                    ) : (
                                        <TableHead>IMO</TableHead>
                                    )}
                                    {/* <TableHead>Oluşturulma Tarihi</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Veri bulunamadı
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className={selectedItem?.id === item.id ? "bg-accent" : "cursor-pointer hover:bg-accent/50"}
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <TableCell>
                                                <input
                                                    type="radio"
                                                    checked={selectedItem?.id === item.id}
                                                    onChange={() => { }}
                                                    className="h-4 w-4"
                                                />
                                            </TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                {type === "customer" ? item.company || "-" : item.imoNumber || "-"}
                                            </TableCell>
                                            {/* <TableCell>
                                                {new Date(item.mail).toLocaleDateString("tr-TR")}
                                            </TableCell> */}
                                        </TableRow>
                                    ))  
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Toplam {totalItems} kayıttan {items.length} tanesi gösteriliyor
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    disabled={page <= 1}
                                >
                                    Önceki
                                </Button>
                                <div className="text-sm">
                                    Sayfa {page} / {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                    disabled={page >= totalPages}
                                >
                                    Sonraki
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleSelect}
                        disabled={!selectedItem}
                    >
                        Seç
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}