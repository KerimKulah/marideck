"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { login, clearError } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, loading, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  // Oturum açıksa dashboard'a yönlendir
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log("Kullanıcı authenticated, dashboard'a yönlendiriliyor");
      router.replace("/");
    } 
  }, [isInitialized, isAuthenticated, router]);

  // Eğer kullanıcı authenticated ise hiç renderlanma
  if (isAuthenticated) {
    return ( 
      <Loading />
    );
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ email, password }));
    if (result.meta.requestStatus === "fulfilled") {
      router.push("/"); //ls
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value);
    if (error) dispatch(clearError());
  };

  // Henüz initialize edilmemişse loading göster
  if (!isInitialized) {
    return (
      <Loading />
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img className="h-16 w-auto" src="/kmaritime-logo.png" alt="MaritimeDesk Logo" />
          </div>
          <div className="space-y-2">
            <CardTitle>Maritime Desk Yönetim Sistemine Hoşgeldiniz</CardTitle>
            <CardDescription>Lütfen email adresinizi ve şifrenizi girin.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="personel@kmaritime.com"
                  required
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Şifre</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Şifrenizi mi unuttunuz?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange(e, setPassword)}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
