export const Loading = () => {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
            <div className="relative mb-6">
                {/* Ana logo container */}
                <div className="w-24 h-24 relative">
                    <img
                        src="/kmaritime-logo.png"
                        alt="K-Maritime Logo"
                        className="w-full h-full object-contain animate-pulse"
                    />
                </div>

                {/* Çevresinde dönen ring */}
                <div className="absolute inset-0 border-2 border-transparent border-t-black border-r-black rounded-full animate-spin"></div>

                {/* Glow efekti */}
                <div className="absolute inset-0 bg-black/10 rounded-full animate-pulse"></div>
            </div>

            {/* Loading text */}
            <div className="text-center">
                <p className="text-lg font-medium text-gray-700 mb-2">Yükleniyor</p>
                <div className="flex space-x-1 justify-center">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};