import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, User, Clock, Image as ImageIcon, Paperclip } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthContext";
import { format } from "date-fns";

type ChatMessage = {
    id: string;
    user: string;
    role: string;
    text: string;
    timestamp: Date;
};

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: "1",
        user: "Rafael Técnico",
        role: "Técnico N1",
        text: "Alguém sabe quem pegou o Switch reserva do estoque? Fui procurar e não achei.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
        id: "2",
        user: "Admin TI",
        role: "Administrador",
        text: "Foi emprestado para o comercial para o evento de hoje. Volta amanhã.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5)
    },
    {
        id: "3",
        user: "Rafael Técnico",
        role: "Técnico N1",
        text: "Ah, beleza! Acabei de fechar o chamado de lentidão do ERP também.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
    }
];

export function GlobalChat() {
    const { userRole } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            user: userRole === "Administrador" ? "Admin TI" : userRole === "Técnico N1" ? "Novo Técnico" : "Auditoria",
            role: userRole,
            text: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-1 right-2 flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-zinc-200 dark:border-zinc-800">
                <SheetHeader className="p-4 border-b bg-muted/30">
                    <SheetTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" /> Colaboração IT
                    </SheetTitle>
                    <SheetDescription>
                        Timeline global de alertas e comunicações da equipe.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((msg, idx) => {
                        const isMe = msg.role === userRole;
                        const isSystem = msg.user === "Sistema";

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSystem ? 'items-center my-4' : ''}`}>
                                {isSystem ? (
                                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {msg.text}
                                    </div>
                                ) : (
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm border'}`}>
                                        {!isMe && (
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="font-bold text-xs text-foreground/80">{msg.user}</span>
                                                <span className="text-[10px] text-muted-foreground">{format(msg.timestamp, "HH:mm")}</span>
                                            </div>
                                        )}
                                        <p className="leading-relaxed">{msg.text}</p>
                                        {isMe && (
                                            <div className="text-[10px] opacity-70 flex justify-end mt-1">
                                                {format(msg.timestamp, "HH:mm")}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="p-3 border-t bg-background shrink-0">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escreva uma anotação..."
                            className="bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:bg-background"
                        />
                        <Button type="submit" size="icon" disabled={!inputValue.trim()} className="h-9 w-9 shrink-0 rounded-full">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
