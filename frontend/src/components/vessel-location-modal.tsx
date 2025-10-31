import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ship, ExternalLink, RefreshCw } from 'lucide-react';

interface VesselLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    vessel: {
        imo: string;
        name: string;
        type?: string;
        flag?: string;
    } | null;
}

const VesselLocationModal: React.FC<VesselLocationModalProps> = ({
    isOpen,
    onClose,
    vessel,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleIframeLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleIframeError = () => {
        setLoading(false);
        setError(true);
    };

    const refreshMap = () => {
        setLoading(true);
        setError(false);
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    if (!vessel) return null;

    // Create HTML content for VesselFinder embed
    const vesselFinderHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            #map-container { width: 100%; height: 400px; }
        </style>
    </head> 
    <body>
        <div id="map-container">
            <script type="text/javascript">
                // Map appearance
                var width="100%";         // width in pixels or percentage
                var height="400";         // height in pixels
                var names=false;           // always show ship names (defaults to false)

                // Single ship tracking
                var imo="${vessel.imo}";        // display latest position (by IMO)
                var show_track=false;      // display track line (last 24 hours)
            </script>
            <script type="text/javascript" src="https://www.vesselfinder.com/aismap.js"></script>
        </div>
    </body>
    </html>
  `;

    // Convert HTML to data URL for iframe
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(vesselFinderHTML)}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="lg:min-w-3xl max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Ship className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold">
                                    {vessel.name}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-600">
                                    IMO: {vessel.imo}
                                    {vessel.type && ` • ${vessel.type}`}
                                    {vessel.flag && ` • ${vessel.flag}`}
                                </DialogDescription>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshMap}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Yenile
                        </Button>
                    </div>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Embed Map */}
                    <div className="relative bg-gray-50 overflow-hidden border-b-1 border-white">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                                <div className="text-center">
                                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-600">Harita yükleniyor...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                                <div className="text-center">
                                    <div className="h-12 w-12 text-red-500 mx-auto mb-4">❌</div>
                                    <p className="text-gray-600 mb-2">Harita yüklenemedi</p>
                                    <Button variant="outline" size="sm" onClick={refreshMap}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Tekrar Dene
                                    </Button>
                                </div>
                            </div>
                        )}

                        <iframe
                            ref={iframeRef}
                            src={dataUrl}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            className="w-full h-[400px] relative"
                            scrolling="no"
                            style={{ overflow: 'hidden' }}
                        />

                        {/* CSS Manipulation */}
                        <div className="absolute top-0 left-0 right-0 h-5.5 bg-white z-20"></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="default" onClick={onClose}>
                            Kapat
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VesselLocationModal;