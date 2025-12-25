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
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        {/* Pulse Ring Effect */}
                        {!isOpen && isPulsing && (
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.6, 0, 0.6]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-primary rounded-full"
                            />
                        )}

                        {/* Main FAB Button */}
                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "relative h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
                                "bg-gradient-to-br from-primary via-primary to-primary/80",
                                "hover:shadow-primary/50 hover:shadow-2xl",
                                "border-2 border-white/20 backdrop-blur-sm",
                                "flex items-center justify-center",
                                "group overflow-hidden",
                                isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                            )}
                        >
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />

                            {/* Bot Icon */}
                            <Bot className="h-6 w-6 text-white relative z-10" />

                            {/* Online Status Dot - Butonun içinde kalacak şekilde */}
                            <div className="absolute bottom-2 right-2.5 h-1.5 w-1.5 bg-green-400 rounded-full z-20 ring-2 ring-primary">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-green-400 rounded-full"
                                />
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-24 right-6 w-[380px] h-[600px] bg-card/95 backdrop-blur-xl rounded-3xl flex flex-col z-50 overflow-hidden border border-border/50 shadow-2xl"
                        style={{
                            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-white p-5 flex justify-between items-center border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm"
                                    >
                                        <Bot className="h-5 w-5" />
                                    </motion.div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base">AI Asistanı</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="relative">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full"
                                            />
                                        </div>
                                        <span className="text-xs text-white/90 font-medium">Çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsOpen(false)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Kapat</span>
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-background via-background to-muted/30">
                            <div className="flex justify-center mb-5">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-muted/80 backdrop-blur-sm text-muted-foreground text-xs px-4 py-2 rounded-full flex items-center gap-2 border border-border/50"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="font-medium">Size nasıl yardımcı olabilirim?</span>
                                </motion.div>
                            </div>

                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "mb-4",
                                        message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[75%] px-4 py-3 rounded-2xl text-sm relative",
                                            message.sender === 'user'
                                                ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-md shadow-lg'
                                                : 'bg-muted/80 backdrop-blur-sm border border-border/50 rounded-tl-md shadow-sm text-foreground'
                                        )}
                                    >
                                        <p className="leading-relaxed">{message.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 border-t border-border/50 bg-background/60 backdrop-blur-xl flex-shrink-0"
                        >
                            <div className="relative flex items-center gap-2">
                                <div className="relative flex-1 min-w-0">
                                    <Input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Mesajınızı yazın..."
                                        className="pl-11 pr-3 py-6 rounded-2xl bg-background/90 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all w-full"
                                    />
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="h-11 w-11 flex-shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                                >
                                    <Send className="h-4 w-4 text-white" />
                                    <span className="sr-only">Gönder</span>
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatbotButton;