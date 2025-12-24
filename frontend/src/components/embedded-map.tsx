"use client"

import { useEffect, useRef, useState } from "react"
import { MapIcon, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

export const EmbeddedMap = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

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
        #map-container { width: 100%; height: 500px; }
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

    return (
        <div className="col-span-3 bg-white rounded-lg border shadow p-4 pt-6">
            <div className="relative bg-gray-50 overflow-hidden" style={{ height: '450px' }}>
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
                    className="mt-2 w-full h-full"
                    allowFullScreen
                    scrolling="no"
                />
                <div className="absolute -top-1 left-0 right-0 flex flex-col z-22">
                    <div className="flex items-center gap-2 mb-2">
                        <MapIcon className="h-5 w-5" />
                        <h1 className="font-semibold">Gemi Trafiği Haritası</h1>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Harita VesselFinder tarafından sağlanmaktadır. Details butonu harici bağlantıda açılır.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="h-[1px] w-full bg-border"></div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-white z-20"></div>
            </div>
        </div>
    );
};
