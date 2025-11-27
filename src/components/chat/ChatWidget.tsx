'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

const WELCOME_MESSAGES: Message[] = [
    {
        role: 'assistant',
        content: 'Olá! 👋 Sou o assistente do Alzheimer Care. Como posso ajudar você hoje?',
        timestamp: new Date().toISOString(),
    },
    {
        role: 'assistant',
        content: 'Posso ajudar com:\n• Consultar localização atual\n• Criar zonas seguras\n• Explicar como usar o sistema\n• Ver histórico de alertas\n• Responder dúvidas sobre Alzheimer',
        timestamp: new Date().toISOString(),
    },
];

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Carregar mensagens do localStorage
    useEffect(() => {
        const saved = localStorage.getItem('chat-history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch {
                setMessages(WELCOME_MESSAGES);
            }
        } else {
            setMessages(WELCOME_MESSAGES);
        }
    }, []);

    // Salvar mensagens no localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat-history', JSON.stringify(messages));
        }
    }, [messages]);

    // Auto-scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: content.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = () => {
        setMessages(WELCOME_MESSAGES);
        localStorage.removeItem('chat-history');
    };

    return (
        <>
            {/* Botão Flutuante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50 group"
                    aria-label="Abrir assistente virtual"
                >
                    <Sparkles className="h-7 w-7 text-primary-foreground group-hover:rotate-12 transition-transform" />
                </button>
            )}

            {/* Modal do Chat */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-card rounded-2xl shadow-2xl border border-border z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary-foreground">Assistente IA</h3>
                                <p className="text-xs text-primary-foreground/80">Sempre pronto para ajudar</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                            aria-label="Fechar chat"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                        {messages.map((message, index) => (
                            <ChatMessage key={index} message={message} />
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Pensando...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border bg-card">
                        <ChatInput onSend={handleSendMessage} disabled={isLoading} />

                        {messages.length > 2 && (
                            <button
                                onClick={handleClearHistory}
                                className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
                            >
                                Limpar histórico
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
