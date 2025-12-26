"use client"
import React, { useState, useEffect } from 'react';
import { Compass, Thermometer, Droplets, Eye, RefreshCw, MapPin, Wind, Navigation } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    windDirection: number;
    description: string;
    pressure: number;
    feelsLike: number;
    latitude: number;
    longitude: number;
}


export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [city, setCity] = useState<string>('Istanbul');
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

    const fetchWeather = async (cityName = city) => {
        setLoading(true);
        setError(null);

        try {
            // Koordinat formatı kontrolü (lat, lon veya lat,lon)
            const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
            const isCoordinate = coordPattern.test(cityName.trim());

            let apiUrl: string;
            let cacheKey: string;

            if (isCoordinate) {
                // Koordinat ile arama
                const [lat, lon] = cityName.trim().split(',').map(coord => coord.trim());
                apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=tr`;
                cacheKey = `weather_${lat}_${lon}`;
            } else {
                // Şehir adı ile arama
                apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=tr`;
                cacheKey = `weather_${cityName}`;
            }

            // Cache kontrolü
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTime = localStorage.getItem(`${cacheKey}_time`);

            if (cachedData && cacheTime) {
                const timeDiff = Date.now() - parseInt(cacheTime);
                // 10 dakika içindeyse cache'den kullan
                if (timeDiff < 600000) {
                    setWeather(JSON.parse(cachedData));
                    setLastUpdateTime(new Date(parseInt(cacheTime)));
                    setLoading(false);
                    return;
                }
            }

            // OpenWeatherMap API isteği
            const response = await fetch(apiUrl);

            if (!response.ok) {
                setError('Hava durumu bilgisi alınamadı.');
                setLoading(false);
                return;
            }

            const data = await response.json();

            const weatherData = {
                location: data.name,
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main.toLowerCase(),
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
                visibility: Math.round(data.visibility / 1000),
                windDirection: data.wind.deg,
                description: data.weather[0].description,
                pressure: data.main.pressure,
                feelsLike: Math.round(data.main.feels_like),
                latitude: data.coord.lat,
                longitude: data.coord.lon
            };

            // Cache'e kaydet
            localStorage.setItem(cacheKey, JSON.stringify(weatherData));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

            setWeather(weatherData);
            setLastUpdateTime(new Date());

        } catch (err) {
            setError('Gerçek hava durumu verisi alınamadı.');
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY) {
            setError('API anahtarı tanımlı değil. Lütfen yöneticinizle iletişime geçin.');
            setLoading(false);
            return;
        }

        const cacheKey = `weather_${city}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);

        if (cachedData && cacheTime) {
            const timeDiff = Date.now() - parseInt(cacheTime);
            if (timeDiff < 600000) { // 10 dakika
                setWeather(JSON.parse(cachedData));
                setLastUpdateTime(new Date(parseInt(cacheTime)));
                setLoading(false);
                return;
            }
        }

        fetchWeather();
    }, []);

    const getWeatherIcon = (condition: string, description?: string) => {
        // Gün/gece kontrolü için saat
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour < 20;
        const iconClassName = "w-25 h-25";

        // OpenWeatherMap condition mapping
        switch (condition.toLowerCase()) {
            case 'clear':
                return (
                    <img
                        src={isDay ? "/weather-icon/day.svg" : "/weather-icon/night.svg"}
                        alt="Açık"
                        className={iconClassName}
                    />
                );

            case 'clouds':
                // Açıklamaya göre bulut yoğunluğu
                const desc = description?.toLowerCase() || '';
                if (desc.includes('few') || desc.includes('az')) {
                    return (
                        <img
                            src={isDay ? "/weather-icon/cloudy-day-1.svg" : "/weather-icon/cloudy-night-1.svg"}
                            alt="Az Bulutlu"
                            className={iconClassName}
                        />
                    );
                } else if (desc.includes('scattered') || desc.includes('dağınık')) {
                    return (
                        <img
                            src={isDay ? "/weather-icon/cloudy-day-2.svg" : "/weather-icon/cloudy-night-2.svg"}
                            alt="Dağınık Bulutlu"
                            className={iconClassName}
                        />
                    );
                } else {
                    return (
                        <img
                            src={isDay ? "/weather-icon/cloudy-day-3.svg" : "/weather-icon/cloudy-night-3.svg"}
                            alt="Bulutlu"
                            className={iconClassName}
                        />
                    );
                }

            case 'rain':
                // Yağmur şiddetine göre
                const rainDesc = description?.toLowerCase() || '';
                if (rainDesc.includes('light') || rainDesc.includes('hafif')) {
                    return (
                        <img
                            src="/weather-icon/rainy-1.svg"
                            alt="Hafif Yağmurlu"
                            className={iconClassName}
                        />
                    );
                } else if (rainDesc.includes('moderate') || rainDesc.includes('orta')) {
                    return (
                        <img
                            src="/weather-icon/rainy-2.svg"
                            alt="Orta Şiddetli Yağmur"
                            className={iconClassName}
                        />
                    );
                } else {
                    return (
                        <img
                            src="/weather-icon/rainy-3.svg"
                            alt="Şiddetli Yağmur"
                            className={iconClassName}
                        />
                    );
                }

            case 'drizzle':
                return (
                    <img
                        src="/weather-icon/rainy-1.svg"
                        alt="Çiseleyen Yağmur"
                        className={iconClassName}
                    />
                );

            case 'snow':
                // Kar şiddetine göre
                const snowDesc = description?.toLowerCase() || '';
                if (snowDesc.includes('light') || snowDesc.includes('hafif')) {
                    return (
                        <img
                            src="/weather-icon/snowy-1.svg"
                            alt="Hafif Karlı"
                            className={iconClassName}
                        />
                    );
                } else if (snowDesc.includes('moderate') || snowDesc.includes('orta')) {
                    return (
                        <img
                            src="/weather-icon/snowy-2.svg"
                            alt="Orta Şiddetli Kar"
                            className={iconClassName}
                        />
                    );
                } else {
                    return (
                        <img
                            src="/weather-icon/snowy-3.svg"
                            alt="Yoğun Kar"
                            className={iconClassName}
                        />
                    );
                }

            case 'thunderstorm':
                return (
                    <img
                        src="/weather-icon/thunder.svg"
                        alt="Fırtına"
                        className={iconClassName}
                    />
                );

            case 'mist':
            case 'fog':
                return (
                    <img
                        src={isDay ? "/weather-icon/cloudy-day-3.svg" : "/weather-icon/cloudy-night-3.svg"}
                        alt="Sis"
                        className={iconClassName}
                    />
                );

            case 'haze':
                return (
                    <img
                        src={isDay ? "/weather-icon/cloudy-day-2.svg" : "/weather-icon/cloudy-night-2.svg"}
                        alt="Pus"
                        className={iconClassName}
                    />
                );

            case 'dust':
            case 'sand':
            case 'ash':
                return (
                    <img
                        src="/weather-icon/cloudy.svg"
                        alt="Toz/Kül"
                        className={iconClassName}
                    />
                );

            case 'squall':
                return (
                    <img
                        src="/weather-icon/thunder.svg"
                        alt="Şiddetli Rüzgar"
                        className={iconClassName}
                    />
                );

            case 'tornado':
                return (
                    <img
                        src="/weather-icon/thunder.svg"
                        alt="Tornado"
                        className={iconClassName}
                    />
                );

            default:
                return (
                    <img
                        src={isDay ? "/weather-icon/day.svg" : "/weather-icon/night.svg"}
                        alt="Bilinmeyen"
                        className={iconClassName}
                    />
                );
        }
    };

    const handleCityChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLInputElement;
            if (target.value.trim()) {
                fetchWeather(target.value.trim());
            }
        }
    };

    const getWindDirection = (deg: number) => {
        const directions = ['Kuzey', 'Kuzey-Kuzeybatı', 'Kuzeybatı', 'Batı-Kuzeybatı', 'Batı', 'Batı-Güneybatı', 'Güneybatı', 'Güney-Güneybatı', 'Güney', 'Güney-Kuzeybatı', 'Kuzey-Kuzeybatı', 'Kuzey'];
        const index = Math.round((deg + 11.25) / 22.5) % 12;
        return directions[index];
    };

    if (loading) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="flex items-center space-x-2">
                        <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!weather) {
        return (
            <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-sm text-muted-foreground mb-3">Hava durumu bilgisi alınamadı.</p>
                    <button
                        onClick={() => fetchWeather()}
                        className="text-sm text-primary hover:underline"
                    >
                        Tekrar Dene
                    </button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full !py-3 !gap-3">
            <CardHeader className="!px-4 !pb-1 pt-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Thermometer className="h-5 w-5 text-primary" />
                        <CardTitle className="text-[16px]">Hava Durumu</CardTitle>
                    </div>
                    {lastUpdateTime && (
                        <div className="text-xs text-muted-foreground">
                            (Son Güncellenme: {lastUpdateTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})
                        </div>
                    )}
                </div>
                <div className="h-[1px] w-full bg-border" />
            </CardHeader>
            <CardContent className="space-y-2 !px-4 !pt-0">
                {/* City Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Şehir adı veya koordinat (örn: 41.0082, 28.9784)"
                        className="w-full bg-gray-50 rounded-md px-3 py-1.5 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        onKeyUp={handleCityChange}
                        onBlur={(e) => setCity(e.target.value)}
                        aria-label="Şehir adı"
                    />
                    {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                </div>

                {/* Main Weather Info */}
                <div className="flex items-center gap-3 border-b -mt-5">
                    <div className="flex-shrink-0 mt-2">
                        {getWeatherIcon(weather.condition, weather.description)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            <div className="text-sm font-semibold text-gray-900  truncate">{weather.location}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground ">
                                <Navigation className="w-3 h-3" />
                                <span className="font-mono">
                                    {weather.latitude.toFixed(4)}, {weather.longitude.toFixed(4)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-xl font-bold text-gray-900">{weather.temperature}°C</div>
                            <div className="text-xs text-muted-foreground mt-1.5">(Hissedilen: {weather.feelsLike}°C)</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                            {weather.description}
                        </div>
                    </div>
                </div>

                {/* Detaylı bilgiler */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">Nem: {weather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">Rüzgar: {weather.windSpeed} km/sa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">Görüş: {weather.visibility} km</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">Yön: {getWindDirection(weather.windDirection)}</span>
                    </div>
                </div>

                {/* Update Button */}
                <button
                    onClick={() => fetchWeather()}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Güncelle</span>
                </button>
            </CardContent>
        </Card>
    );
}