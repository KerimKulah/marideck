import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ship, ExternalLink, RefreshCw } from 'lucide-react';

interface VesselLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    vessel: {
        imo: string;
        mmsi?: string;
        name: string;
        type?: string;
        flag?: string;
    } | null;
}

// Memoized Loading Component
const LoadingSpinner = React.memo(() => (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
        <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
    </div>
));

// Memoized Error Component
const ErrorDisplay = React.memo<{ onRetry: () => void }>(({ onRetry }) => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
        <div className="text-center">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">❌</div>
            <p className="text-gray-600 mb-2">Harita yüklenemedi</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
            </Button>
        </div>
    </div>
));

const VesselLocationModal: React.FC<VesselLocationModalProps> = ({
    isOpen,
    onClose,
    vessel,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Memoized iframe load handler
    const handleIframeLoad = useCallback(() => {
        setLoading(false);
        setError(false);
    }, []);

    // Memoized iframe error handler
    const handleIframeError = useCallback(() => {
        setLoading(false);
        setError(true);
    }, []);

    // Memoized refresh function
    const refreshMap = useCallback(() => {
        setLoading(true);
        setError(false);
        if (iframeRef.current) {
            // Force reload by changing src
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = '';
            setTimeout(() => {
                if (iframeRef.current) {
                    iframeRef.current.src = currentSrc;
                }
            }, 100);
        }
    }, []);

    // Memoized external link handler
    const handleExternalLink = useCallback(() => {
        if (!vessel) return;
        const url = vessel.mmsi
            ? `https://www.myshiptracking.com/vessels/mmsi-${vessel.mmsi}`
            : `https://www.myshiptracking.com/vessels/imo-${vessel.imo}`;
        window.open(url, '_blank');
    }, [vessel]);

    // Reset states when modal opens/closes - optimized
    useEffect(() => {
        if (isOpen && vessel) {
            setLoading(true);
            setError(false);
        }
    }, [isOpen, vessel?.mmsi]); // Only depend on mmsi changes

    // Memoized HTML content generation
    const myShipTrackingHTML = useMemo(() => {
        if (!vessel) return '';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif; 
            background-color: #f5f5f5;
        }
        #map-container { 
            width: 100%; 
            height: 400px; 
            position: relative;
            overflow: hidden;
        }
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-message {
            text-align: center;
            color: #666;
            padding: 20px;
        }
        .widget-container {
            width: 100%;
            height: 100%;
            border: none;
            overflow: hidden;
        }
    </style>
</head> 
<body>
    <div id="map-container">
        <div class="loading-overlay" id="loading">
            <div class="spinner"></div>
        </div>
        <div id="widget-container"></div>
        <script>
            var mmsi = "${vessel.mmsi || ''}";
            
            if (!mmsi) {
                document.getElementById('loading').innerHTML = 
                    '<div class="error-message">' +
                    '<div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>' +
                    '<p>MMSI bilgisi bulunamadı</p>' +
                    '<p style="font-size: 12px;">Bu gemi için harita gösterilemiyor</p>' +
                    '</div>';
            } else {
                var embedUrl = 'https://embed.myshiptracking.com/embed?' + 
                    'myst&' +
                    'mmsi=' + encodeURIComponent(mmsi) + '&' +
                    'zoom=&' +
                    'lat=&' +
                    'lng=&' +
                    'fleet_id=&' +
                    'show_menu=0&' +
                    'show_info=false&' +
                    'show_track=false&' +
                    'show_names=0&' +
                    'scroll_wheel=0&' +
                    'map_style=simple';
                
                var iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.width = '100%';
                iframe.height = '400';
                iframe.style.border = 'none';
                iframe.style.overflow = 'hidden';
                iframe.scrolling = 'no';
                iframe.frameBorder = '0';
                
                iframe.onload = function() {
                    setTimeout(function() {
                        var loading = document.getElementById('loading');
                        if (loading) {
                            loading.style.display = 'none';
                        }
                        // Notify parent window that iframe loaded
                        window.parent.postMessage({ type: 'iframe-loaded' }, '*');
                    }, 1000); // Reduced timeout
                };
                
                iframe.onerror = function() {
                    document.getElementById('loading').innerHTML = 
                        '<div class="error-message">' +
                        '<div style="font-size: 24px; margin-bottom: 10px;">❌</div>' +
                        '<p>Harita yüklenemedi</p>' +
                        '<p style="font-size: 12px;">MyShipTracking servisi erişilemez</p>' +
                        '</div>';
                    // Notify parent window of error
                    window.parent.postMessage({ type: 'iframe-error' }, '*');
                };
                
                document.getElementById('widget-container').appendChild(iframe);
                
                // Reduced fallback timeout
                setTimeout(function() {
                    var loading = document.getElementById('loading');
                    if (loading && loading.style.display !== 'none') {
                        loading.innerHTML = 
                            '<div class="error-message">' +
                            '<div style="font-size: 24px; margin-bottom: 10px;">⏱️</div>' +
                            '<p>Harita yükleniyor...</p>' +
                            '<p style="font-size: 12px;">Lütfen bekleyin veya sayfayı yenileyin</p>' +
                            '</div>';
                    }
                }, 8000); // Reduced from 10000
            }
        </script>
    </div>
</body>
</html>`;
    }, [vessel]);

    // Memoized data URL
    const dataUrl = useMemo(() => {
        if (!myShipTrackingHTML) return '';
        return `data:text/html;charset=utf-8,${encodeURIComponent(myShipTrackingHTML)}`;
    }, [myShipTrackingHTML]);

    // Memoized vessel description
    const vesselDescription = useMemo(() => {
        if (!vessel) return '';

        const parts = [`IMO: ${vessel.imo}`];
        if (vessel.mmsi) parts.push(`MMSI: ${vessel.mmsi}`);
        if (vessel.type) parts.push(vessel.type);
        if (vessel.flag) parts.push(vessel.flag);

        return parts.join(' • ');
    }, [vessel]);

    // Listen for postMessage from iframe
    useEffect(() => {
        if (!isOpen) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'iframe-loaded') {
                handleIframeLoad();
            } else if (event.data.type === 'iframe-error') {
                handleIframeError();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isOpen, handleIframeLoad, handleIframeError]);

    if (!vessel) return null;

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
                                    {vesselDescription}
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
                    <div className="relative bg-gray-50 overflow-hidden border rounded-lg">
                        {loading && <LoadingSpinner />}
                        {error && <ErrorDisplay onRetry={refreshMap} />}

                        <iframe
                            ref={iframeRef}
                            src={dataUrl}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            className="w-full h-[400px] relative"
                            scrolling="no"
                            style={{ overflow: 'hidden' }}
                            loading="lazy"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleExternalLink}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            MyShipTracking'de Aç
                        </Button>
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