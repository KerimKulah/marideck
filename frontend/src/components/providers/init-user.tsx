"use client";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { useEffect } from "react";
import { currentUser } from "../../redux/slices/authSlice";
import { clearError } from "../../redux/slices/authSlice";

/*
Bu provider, oturum açılmış kullanıcının bilgilerini sayfa yenilendiğinde tekrar yüklemek için kullanılır.
*/

export default function InitUser({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        console.log("InitUser çağrıldı");
        dispatch(clearError());
        dispatch(currentUser());
    }, [dispatch]);

    return <>{children}</>;
}