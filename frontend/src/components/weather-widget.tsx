"use client"
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Compass, Thermometer, Droplets, Eye, RefreshCw, MapPin, Wind } from 'lucide-react';
import { Arrow } from '@radix-ui/react-tooltip';

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
}


export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [city, setCity] = useState<string>('Istanbul');

    const fetchWeather = async (cityName = city) => {
        setLoading(true);
        setError(null);

        try {
            // Cache kontrolü
            const cacheKey = `weather_${cityName}`;
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTime = localStorage.getItem(`${cacheKey}_time`);

            if (cachedData && cacheTime) {
                const timeDiff = Date.now() - parseInt(cacheTime);
                // 10 dakika içindeyse cache'den kullan
                if (timeDiff < 600000) {
                    setWeather(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                }
            }

            // OpenWeatherMap ücretsiz API kullanıyoruz
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=tr`
            );

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
                feelsLike: Math.round(data.main.feels_like)
            };

            // Cache'e kaydet
            localStorage.setItem(cacheKey, JSON.stringify(weatherData));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

            setWeather(weatherData);

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
                setLoading(false);
                return;
            }
        }

        fetchWeather();
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'clear':
                return <Sun className="w-12 h-12" />;
            case 'clouds':
                return <Cloud className="w-12 h-12" />;
            case 'rain':
            case 'drizzle':
                return <CloudRain className="w-12 h-12" />;
            case 'snow':
                return <CloudSnow className="w-12 h-12" />;
            case 'mist':
            case 'fog':
                return <Cloud className="w-12 h-12" />;
            default:
                return <Sun className="w-12 h-12" />;
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
            <div className="bg-white rounded-lg border shadow-sm p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center h-40">
                    <RefreshCw className="w-8 h-8 text-black animate-spin" />
                    <span className=" text-black ml-2">Hava durumu yükleniyor...</span>
                </div>
            </div>
        );
    }

    if (!weather) {
        return (
            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg border shadow-sm p-6 text-white max-w-md mx-auto">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Hata</h2>
                    <p>Hava durumu bilgisi alınamadı.</p>
                    <button
                        onClick={() => fetchWeather()}
                        className="mt-4 bg-white/30 hover:bg-white/40 transition-colors duration-200 rounded-lg px-4 py-2"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm w-full">
            <div className="mb-1">
                <div className="flex items-center space-x-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Şehir adı..."
                        className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-black placeholder-gray-400 border border-gray-200 outline-none flex-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyUp={handleCityChange}
                        onBlur={(e) => setCity(e.target.value)}
                        aria-label="Şehir adı"
                    />
                </div>
                <h2 className="text-sm font-medium text-gray-900">{weather.location}</h2>
                {error && (
                    <p className="text-red-500 text-[11px] mt-0.5">{error}</p>
                )}
            </div>

            <div className="border-b pb-2 flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    {getWeatherIcon(weather.condition)}
                    <div>
                        <div className="text-xl font-bold text-gray-900">{weather.temperature}°C</div>
                        <div className="text-xs text-gray-600 capitalize">{weather.description}</div>
                        <div className="text-xs text-gray-500">Hissedilen: {weather.feelsLike}°C</div>
                    </div>
                </div>
            </div>

            {/* Detaylı bilgiler */}
            <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center space-x-1.5">
                    <Droplets className="w-3.5 h-3.5 text-black" />
                    <span className="text-xs text-gray-600">Nem: {weather.humidity}%</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Wind className="w-3.5 h-3.5 text-black" />
                    <span className="text-xs text-gray-600">Rüzgar: {weather.windSpeed} km/sa</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Eye className="w-3.5 h-3.5 text-black" />
                    <span className="text-xs text-gray-600">Görüş: {weather.visibility} km</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-black" />
                    <span className="text-xs text-gray-600">Yön: {getWindDirection(weather.windDirection)}</span>
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                <button
                    onClick={() => fetchWeather()}
                    disabled={loading}
                    className="flex-1 bg-black hover:bg-neutral-800 cursor-pointer text-white disabled:opacity-50 transition-colors rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center space-x-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Güncelle</span>
                </button>
            </div>

            <div className="mt-3 text-center text-xs text-black/60">
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
            </div>
        </div>
    );
}