"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, Sparkles, Bot, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatbotButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isPulsing, setIsPulsing] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Merhaba! Size nasıl yardımcı olabilirim?', sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        const pulseInterval = setInterval(() => {
            setIsPulsing(prev => !prev);
        }, 2000);

        return () => {
            clearTimeout(timer);
            clearInterval(pulseInterval);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const newUserMessage = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user' as const
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');

        // Simulate bot response after a short delay
        setTimeout(() => {
            const botResponses = [
                'Anladım, size nasıl yardımcı olabilirim?',
                'Bu konuda daha fazla bilgi verebilir misiniz?',
                'Bu isteğinizi değerlendiriyorum...',
                'Size en kısa sürede dönüş yapacağım.'
            ];
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

            setMessages(prev => [
                ...prev,
                {
                    id: prev.length + 2,
                    text: randomResponse,
                    sender: 'bot'
                }
            ]);
        }, 1000);
    };

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        {!isOpen && (
                            <motion.div
                                animate={isPulsing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                }}
                                className="absolute inset-0 bg-primary/20 rounded-full"
                            />
                        )}
                        <Button
                            onClick={() => setIsOpen(!isOpen)}
                            size="lg"
                            className={cn(
                                "relative h-16 w-64 rounded-full shadow-xl transition-all duration-300 overflow-hidden group",
                                "bg-primary hover:bg-primary/90 text-white",
                                isOpen ? "opacity-0" : "opacity-100"
                            )}
                        >
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot className="h-8 w-8 text-white" />
                            </div>
                            <div className="ml-8 text-left">
                                <div className="text-xs font-medium text-white/80">Yapay Zeka Asistanı</div>
                                <div className="text-sm font-semibold flex items-center gap-1">
                                    <span>Bana Sorun</span>
                                    <Sparkles className="h-3 w-3 text-amber-300" />
                                </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="fixed bottom-32 right-8 w-96 h-[500px] bg-card rounded-2xl flex flex-col z-50 overflow-hidden border border-border shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-primary text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-white/20 rounded-full blur"></div>
                                    <div className="relative bg-white/10 p-2 rounded-full">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Yapay Zeka Asistanı</h3>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs text-white/80">Çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Kapat</span>
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-card to-muted/20">
                            <div className="flex justify-center mb-4">
                                <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                    <span>Yapay Zeka Asistanı size yardımcı olmaktan mutluluk duyar</span>
                                </div>
                            </div>

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "mb-4",
                                        message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-xs p-3 rounded-2xl text-sm relative",
                                            message.sender === 'user'
                                                ? 'bg-primary text-white rounded-br-none shadow-md'
                                                : 'bg-background border border-border rounded-tl-none shadow-sm'
                                        )}
                                    >
                                        {message.text}
                                        {message.sender === 'bot' && (
                                            <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-background border-l border-b border-border transform rotate-45"></div>
                                        )}
                                        {message.sender === 'user' && (
                                            <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary transform rotate-45"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 border-t border-border bg-background/80 backdrop-blur-sm"
                        >
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Mesajınızı yazın..."
                                    className="pl-10 pr-12 py-5 rounded-xl bg-background border-border/50 focus-visible:ring-2 focus-visible:ring-primary"
                                />
                                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                                >
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Gönder</span>
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatbotButton;