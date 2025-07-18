"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X } from 'lucide-react';
import Image from 'next/image';

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
                        <motion.div
                            animate={isPulsing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: 'reverse',
                            }}
                            className="absolute inset-0 rounded-full"
                        />
                        <Image
                            src="/chatbot.gif"
                            alt="Chatbot"
                            width={64}
                            height={64}
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative object-cover hover:scale-120 transition-all duration-300 cursor-pointer "
                            unoptimized={true}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-28 right-8 w-96 h-[500px] bg-white rounded-lg flex flex-col z-50 overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-primary text-white p-4 flex justify-between items-center">
                            <h3 className="font-semibold text-lg">Yardımcı Asistan</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-4 ${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs p-3 rounded-lg ${message.sender === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white border border-gray-200 rounded-tl-none'
                                            }`}
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Bir mesaj yazın..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Send size={18} />
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