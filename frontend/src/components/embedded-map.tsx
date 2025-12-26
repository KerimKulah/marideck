"use client"

import { useEffect, useRef, useState } from "react"
import { MapIcon, Info, Ship, Clock, MapPin, Bell } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, isAfter } from "date-fns"
import { tr } from "date-fns/locale"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/redux/store"
import { getShips } from "@/redux/slices/shipSlice"

type Ship = {
    id: string
    name: string
    imoNumber?: string
    eta?: string | Date
    destinationPort?: string
    status: 'Beklemede' | 'Limanda' | 'Yolda' | 'Demirde' | 'Gecikmeli' | 'Acil' | 'Bilinmiyor'
    newTime?: string
}

export const EmbeddedMap = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { ships, loading: shipsLoading } = useSelector((state: RootState) => state.ship);

    // Yaklaşan gemileri filtrele (önümüzdeki 7 gün içinde gelecek olanlar)
    const upcomingShips = ships.filter(ship => {
        if (!ship.eta) return false

        const etaDate = new Date(ship.eta)
        const today = new Date()
        const nextWeek = new Date()
        nextWeek.setDate(today.getDate() + 7)

        return isAfter(etaDate, today) && isAfter(nextWeek, etaDate)
    })

    const statusColors = {
        'Beklemede': 'bg-yellow-100 text-yellow-800',
        'Limanda': 'bg-green-100 text-green-800',
        'Yolda': 'bg-blue-100 text-blue-800',
        'Demirde': 'bg-purple-100 text-purple-800',
        'Gecikmeli': 'bg-orange-100 text-orange-800',
        'Acil': 'bg-red-100 text-red-800',
        'Bilinmiyor': 'bg-gray-100 text-gray-800'
    }

    // Gemileri fetch et (eğer henüz yüklenmemişse)
    useEffect(() => {
        if (ships.length === 0 && !shipsLoading) {
            dispatch(getShips({ page: 1, limit: 100 }));
        }
    }, [dispatch, ships.length, shipsLoading]);

    useEffect(() => {
        const handleIframeLoad = () => {
            setLoading(false);
            setError(false);
        };

        const handleIframeError = () => {
            setLoading(false);
            setError(true);
        };

        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', handleIframeLoad);
            iframe.addEventListener('error', handleIframeError);
        }

        return () => {
            if (iframe) {
                iframe.removeEventListener('load', handleIframeLoad);
                iframe.removeEventListener('error', handleIframeError);
            }
        };
    }, []);

    // Create HTML content for VesselFinder embed
    const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #map-container
      </style> 
    </head>
    <body>
      <div id="map-container">
        <script type="text/javascript">
          // Map appearance
          var width="100%";          // width in pixels or percentage
          var height="500";         // height in pixels
          var latitude="40.1553";   // center latitude (Çanakkale)
          var longitude="26.4142";  // center longitude (Çanakkale)
          var zoom="8";             // initial zoom level
        </script>
        <script type="text/javascript" src="https://www.vesselfinder.com/aismap.js"></script>
      </div>
    </body>
    </html>
  `;

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(mapHTML)}`;

    // Buranın tasarımı zor yapıldı responsive vs. kod yapısını değişme.

    return (
        <div className="md:col-span-4 bg-white rounded-lg border shadow p-4 pt-6 ">
            <div className="flex flex-col lg:flex-row gap-4 h-[620px] lg:h-[450px]">
                {/* Harita Bölümü - Sol Taraf */}
                <div className="flex-1 relative bg-gray-50 overflow-hidden min-h-[300px] md:max-h-[300px]  lg:max-h-[450px] lg:min-h-0" >
                    {loading && (
                        <div className="absolute inset-0 z-10 bg-white">
                            <Skeleton className="w-full h-full rounded-lg" />
                        </div>
                    )}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <div className="text-center">
                                <p className="text-gray-600 mb-2">Harita yüklenemedi</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                                >
                                    Tekrar Dene
                                </button>
                            </div>
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        src={dataUrl}
                        className="w-full h-full mt-5"
                        allowFullScreen
                        scrolling="no"
                    />
                    {/* OpenStreetMap attribution'ı gizlemek için overlay */}
                    {/* <div className="absolute bottom-0 left-0 right-0 h-8 bg-white z-20 pointer-events-none"></div> */}
                    <div className="absolute top-0 left-0 right-0 flex flex-col z-20 bg-white pb-2">
                        <div className="flex items-center gap-2 mb-2 px-2">
                            <MapIcon className="h-5 w-5" />
                            <h1 className="font-semibold">Gemi Trafiği Haritası</h1>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Harita VesselFinder tarafından sağlanmaktadır. Detaylar harici bağlantıda açılır.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="h-[1px] w-full bg-border"></div>
                    </div>
                </div>

                {/* Yaklaşan Gemiler Bölümü - Sağ Taraf */}
                <div className="lg:w-80 flex flex-col rounded-md min-h-[300px] lg:h-[450px]">
                    <div className="px-4 pb-2 border-b flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ship className="h-5 w-5 text-primary" />
                                <h1 className="font-semibold">Varışı (ETA) Yaklaşan Gemiler</h1>
                            </div>
                            <Badge variant="outline">
                                {shipsLoading ? '...' : upcomingShips.length}
                            </Badge>
                        </div>
                    </div>
                    {shipsLoading ? (
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="px-4 py-2 space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        </ScrollArea>
                    ) : upcomingShips.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center px-4">
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                                <Clock className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">Önümüzdeki 7 gün içinde gelecek gemi bulunamadı</p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="py-2">
                                <div className="space-y-3">
                                    {upcomingShips.slice(0, 5).map((ship: any) => {
                                        const etaDate = new Date(ship.eta)
                                        return (
                                            <div key={ship.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm truncate">{ship.name}</h4>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                                            <span className="truncate">{ship.destinationPort || 'Bilinmeyen Liman'}</span>
                                                        </div>
                                                    </div>
                                                    <Badge className={`${statusColors[ship.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'} flex-shrink-0 text-xs`}>
                                                        {ship.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs mt-2 text-muted-foreground">
                                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {format(etaDate, 'd MMMM yyyy HH:mm', { locale: tr })}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    );
};
