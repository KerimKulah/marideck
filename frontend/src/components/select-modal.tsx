"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Loader2, Search, X, Check } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getCustomers } from "@/redux/slices/customerSlice"
import { getShips } from "@/redux/slices/shipSlice"
import { getUsers } from "@/redux/slices/userSlice"

interface SelectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: "customer" | "ship" | "user"
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
    } = useSelector((state: RootState) => {
        if (type === "customer") {
            return {
                items: state.customer.customers,
                loading: state.customer.loading,
                page: state.customer.page,
                totalPages: state.customer.totalPages,
                totalItems: state.customer.totalCustomers
            }
        } else if (type === "ship") {
            return {
                items: state.ship.ships,
                loading: state.ship.loading,
                page: state.ship.page,
                totalPages: state.ship.totalPages,
                totalItems: state.ship.totalShips
            }
        } else {
            // User type
            return {
                items: state.user.users,
                loading: state.user.loading,
                page: state.user.page,
                totalPages: state.user.totalPages,
                totalItems: state.user.totalUsers
            }
        }
    })

    // Arama ve sayfalama için verileri yükle
    useEffect(() => {
        const fetchData = async () => {
            let action;
            if (type === "customer") {
                action = getCustomers;
            } else if (type === "ship") {
                action = getShips;
            } else {
                action = getUsers;
            }

            await dispatch(action({
                page: 1,
                limit: 10,
                search
            }));
        }

        const timer = setTimeout(() => {
            fetchData()
        }, 500)

        return () => clearTimeout(timer)
    }, [search, dispatch, type])

    // Sayfa değişikliğinde verileri yükle
    const handlePageChange = (newPage: number) => {
        let action;
        if (type === "customer") {
            action = getCustomers;
        } else if (type === "ship") {
            action = getShips;
        } else {
            action = getUsers;
        }

        dispatch(action({
            page: newPage,
            limit: 10,
            search
        }));
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
                        {type === "customer" ? "Müşteri Seç" :
                            type === "ship" ? "Gemi Seç" : "Personel Seç"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={type === "customer" ? "Müşteri ara..." :
                                type === "ship" ? "Gemi ara..." : "Personel ara..."}
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
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Seç</TableHead>
                                    <TableHead>{type === "customer" ? "Müşteri Adı" :
                                        type === "ship" ? "Gemi Adı" : "Personel"}</TableHead>
                                    {type === "customer" ? (
                                        <TableHead>Şirket</TableHead>
                                    ) : type === "ship" ? (
                                        <TableHead>IMO</TableHead>
                                    ) : (
                                        <TableHead>E-posta</TableHead>
                                    )}
                                    <TableHead>Telefon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                                Yükleniyor...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Veri bulunamadı.
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
                                            <TableCell>
                                                {type === "user" ? `${item.firstName} ${item.lastName}` : item.name}
                                            </TableCell>
                                            {type === "customer" ? (
                                                <TableCell>{item.company || "-"}</TableCell>
                                            ) : type === "ship" ? (
                                                <TableCell>{item.imoNumber || "-"}</TableCell>
                                            ) : (
                                                <TableCell>{item.email || "-"}</TableCell>
                                            )}
                                            <TableCell>{item.phone || "-"}</TableCell>
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

                <DialogFooter className="sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                    </div>
                    <div className="space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            İptal
                        </Button>
                        <Button
                            onClick={handleSelect}
                            disabled={!selectedItem}
                        >
                            Seç
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}