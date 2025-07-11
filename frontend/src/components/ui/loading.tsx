
export const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <div className="relative w-24 h-24">
                <img
                    src="/kmaritime-logo.png"
                    alt="K-Maritime Logo"
                    className="w-full h-full object-contain animate-pulse"
                />
            </div>
            <p className="text-sm text-gray-600">Yükleniyor...</p>
        </div>
    );
};
