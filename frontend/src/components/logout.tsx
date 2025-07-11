"use client"

import { useDispatch, useSelector } from "react-redux"
import { logout } from "../redux/slices/authSlice"
import { LogOut } from "lucide-react"
import { AppDispatch, RootState } from "../redux/store"
import { useRouter } from "next/navigation"
import { DropdownMenuItem } from "./ui/dropdown-menu"

export const Logout = () => {
    const { loading } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const handleLogout = async () => {

        if (loading) return
        try {
            await dispatch(logout()).unwrap()
            router.push("/login")
        } catch (err) {
            console.error("Çıkışta hata:", err)
        }
    }

    return (
        <DropdownMenuItem
            className={`flex items-center gap-2 
            ${loading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{loading ? "Çıkış yapılıyor..." : "Çıkış Yap"}</span>
        </DropdownMenuItem>
    )
}
