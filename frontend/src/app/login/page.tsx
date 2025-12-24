"use client";

import { LoginForm } from "@/components/login-form";
import InitUser from "@/components/providers/init-user";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full">
      {/* Hero Image Section - Asymmetric Left Side */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90">
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%),linear-gradient(-45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] bg-[length:60px_60px]"></div>
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-lines opacity-5"></div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 pr-45 text-primary-foreground w-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center items-center w-full">
            <div className="w-full max-w-2xl space-y-8 pl-8 pr-0">
              {/* Logo */}
              <div className="flex flex-col items-center mb-10 space-y-6">
                <img className="h-28 w-auto brightness-0 invert" src="/kmaritime-logo.png" alt="Marideck Logo" />
                <h1 className="text-5xl font-bold tracking-tight text-primary-foreground">
                  Marideck
                </h1>
              </div>

              <div className="space-y-6">
                <p className="text-xl text-primary-foreground/80 leading-relaxed text-center">
                  Denizcilikte verimlilik, güvenlik ve kontrol.
                  Tüm operasyonlarınız tek platformda.
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="flex gap-3 mt-10 justify-center">
                <div className="h-1.5 w-16 bg-primary-foreground/30"></div>
                <div className="h-1.5 w-12 bg-primary-foreground/20"></div>
                <div className="h-1.5 w-6 bg-primary-foreground/10"></div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-2xl pl-8 pr-0 space-y-4 border-t border-primary-foreground/10 pt-6">
              <div className="flex flex-col items-center gap-3 text-sm text-primary-foreground/70">
                <a
                  href="https://marideck.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground transition-colors font-medium"
                >
                  marideck.com
                </a>
                <div className="flex items-center gap-4 text-xs">
                  <span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/60">
                    BETA
                  </span>
                  <span className="text-primary-foreground/50">•</span>
                  <span className="text-primary-foreground/50">
                    © {new Date().getFullYear()} Marideck
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Asymmetric Cut */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-background [clip-path:polygon(0_0,100%_0,100%_100%,0_80%)]"></div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-background">
        <div className="w-full max-w-sm">
          <InitUser>
            <LoginForm />
          </InitUser>
        </div>
      </div>
    </div>
  );
}
