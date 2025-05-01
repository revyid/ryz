"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, MessageSquare, Send, Bot, User, ChevronRight, Sparkles, Loader2, Copy, Check, Eraser } from 'lucide-react';
import { useAuth, UserButton, SignInButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import "@/styles/components/NavBar.css";
type NavItem = {
    label: string;
    href: string;
};
type MessageType = 'user' | 'bot';
interface ChatMessage {
    type: MessageType;
    text: string;
    id: string;
}
type FloatingNavbarProps = {
    navItems: NavItem[];
};
interface OpenRouterMessage {
    role: "user" | "assistant";
    content: string;
}
interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
}
export default function FloatingNavbar({ navItems }: FloatingNavbarProps) {
    const { isSignedIn, isLoaded } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [navbarOffset, setNavbarOffset] = useState(0);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { type: 'bot', text: 'Hello! I\'m your AI assistant. How can I help you today?', id: 'initial-message' },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState<{
        [key: string]: boolean;
    }>({});
    const [textareaRows, setTextareaRows] = useState(1);
    const navbarRef = useRef<HTMLDivElement>(null);
    const chatButtonRef = useRef<HTMLButtonElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);
    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
    const OPENROUTER_MODEL = "deepseek/deepseek-chat:free";
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const newOffset = Math.min(currentScrollY * 0.03, 6);
            setNavbarOffset(newOffset);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    useEffect(() => {
        if (messagesEndRef.current && isChatOpen) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isChatOpen]);
    useEffect(() => {
        if (isChatOpen && chatInputRef.current) {
            setTimeout(() => {
                chatInputRef.current?.focus();
            }, 300);
        }
    }, [isChatOpen]);
    useEffect(() => {
        if (chatInputRef.current) {
            const currentInput = chatInputRef.current;
            currentInput.style.height = 'auto';
            const newRows = Math.min(Math.max(Math.ceil(currentInput.scrollHeight / 24), 1), 4);
            setTextareaRows(newRows);
        }
    }, [chatMessage]);
    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (isMobileMenuOpen)
            setIsMobileMenuOpen(false);
    };
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isChatOpen)
            setIsChatOpen(false);
    };
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied({ ...isCopied, [id]: true });
            setTimeout(() => {
                setIsCopied({ ...isCopied, [id]: false });
            }, 2000);
        });
    };
    const clearChat = () => {
        setChatMessages([
            { type: 'bot', text: 'Chat cleared. How else can I assist you?', id: generateId() },
        ]);
    };
    const formatChatHistory = (messages: ChatMessage[]): OpenRouterMessage[] => {
        return messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));
    };
    const sendToOpenRouter = async (messages: OpenRouterMessage[]): Promise<string> => {
        if (!OPENROUTER_API_KEY) {
            return "I cannot connect to the AI service at the moment.";
        }
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://your-site.com',
        'X-Title': 'AI Vision Assistant'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: messages
      } as OpenRouterRequest)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API returned ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('OpenRouter Error:', error);
    throw error; // opsional, bisa dihapus jika tidak ingin lanjut melempar error
  }
};

const sendMessage = async () => {
  if (chatMessage.trim()) {
    const userMsgId = generateId();
    const userMessage = {
      type: 'user' as MessageType,
      text: chatMessage.trim(),
      id: userMsgId
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsLoading(true);

    const messageHistory = formatChatHistory([...chatMessages, userMessage]);

    try {
      const aiResponse = await sendToOpenRouter(messageHistory);
      setChatMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: aiResponse,
          id: generateId()
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }
};
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && chatMessage.trim()) {
                sendMessage();
            }
        }
    };
    return (<div className="relative w-full font-sans">
      
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-black">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-purple-700 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-blue-700 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYwNSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIj48L3JlY3Q+PC9zdmc+')] opacity-30"></div>
        </div>
      </div>

      
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-4 py-3 md:px-6" style={{
            transform: isVisible ? `translateY(${navbarOffset}px)` : 'translateY(-100%)',
            opacity: isVisible ? 1 : 0
        }}>
        <nav ref={navbarRef} className="mx-auto max-w-7xl relative">
          
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl"></motion.div>
          
          <div className="backdrop-blur-sm bg-black/30 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 text-white flex items-center justify-between h-16 px-4 md:px-6 relative overflow-hidden">
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 animate-glow"></div>
              <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-purple-500/30 via-fuchsia-500/20 to-purple-500/0 animate-pulse" style={{ animationDuration: '3s' }}></div>
            </div>
            
            
            <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-105">
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg w-8 h-8 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                    <Sparkles size={16} className="text-white group-hover:scale-110 transition-all duration-300"/>
                  </div>
                  <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 text-xl">
                    <span className="flex items-center gap-1">
                      <span className="hidden md:inline">AI</span>
                      <span>Vision</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            
            <div className="hidden md:flex items-center space-x-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {navItems.map((item) => (<Link key={item.label} href={item.href} className="text-slate-200 hover:text-white text-sm font-medium relative group py-1.5">
                  <span className="transition-all duration-300 ease-out group-hover:text-white relative z-10">
                    {item.label}
                  </span>
                  <span className="absolute inset-0 h-full w-full">
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out group-hover:w-full rounded-full"></span>
                  </span>
                </Link>))}
            </div>

            
            <div className="flex items-center gap-3">
              
              <motion.button ref={chatButtonRef} onClick={toggleChat} whileTap={{ scale: 0.95 }} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 ${isChatOpen
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20'
            : 'bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10'}`}>
                <MessageSquare size={16} className={`transition-all duration-300 ${isChatOpen ? 'rotate-12' : ''}`}/>
                <span className="hidden md:inline">Chat</span>
              </motion.button>
              
              
              {isLoaded && (<div className="flex items-center">
                  {isSignedIn ? (<UserButton appearance={{
                    elements: {
                        userButtonAvatarBox: "w-8 h-8 border-2 border-indigo-500/30",
                        userButtonTrigger: "hover:opacity-80 transition-opacity"
                    }
                }} afterSignOutUrl="/"/>) : (<SignInButton mode="modal">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white/5 backdrop-blur-md text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 border border-white/10 flex items-center gap-1.5">
                        <span>Sign in</span>
                      </motion.button>
                    </SignInButton>)}
                </div>)}

              
              <motion.button className="md:hidden bg-white/5 backdrop-blur-md p-2 rounded-lg text-slate-200 hover:text-white transition-all hover:bg-white/10 border border-white/10" onClick={toggleMobileMenu} whileTap={{ scale: 0.95 }}>
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (<motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X size={18}/>
                    </motion.div>) : (<motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu size={18}/>
                    </motion.div>)}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          
          <AnimatePresence>
            {isMobileMenuOpen && (<motion.div className="md:hidden mt-2" initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
                <div className="backdrop-blur-sm bg-black/30 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 overflow-hidden">
                  <div className="flex flex-col p-2 space-y-1">
                    {navItems.map((item, index) => (<motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.2 }}>
                        <Link href={item.href} className="text-slate-200 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                          {item.label}
                          <ChevronRight size={14} className="text-slate-400"/>
                        </Link>
                      </motion.div>))}
                    
                  </div>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </nav>
      </header>

      
      <AnimatePresence>
        {isChatOpen && (<motion.div className="fixed top-24 md:top-20 inset-x-0 z-40 px-4 md:px-0 md:right-6 md:left-auto md:w-[450px]" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}>
            <div className="mx-auto max-w-md md:max-w-none relative">
              
              <div className="absolute -inset-10 pointer-events-none overflow-hidden opacity-50">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-500 rounded-full animate-float"></div>
                <div className="absolute top-3/4 left-1/2 w-1 h-1 bg-purple-500 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
              </div>
              
              
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-70 blur-sm"></div>
              
              <div className=" bg-black/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 overflow-hidden relative">
                
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0"></div>
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-purple-500/30 via-fuchsia-500/10 to-purple-500/0"></div>
                
                
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h3 className="font-medium text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                      <Bot size={16} className="text-indigo-300"/>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Ryz Assistant</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                        </span>
                        <span>Online</span>
                      </div>
                    </div>
                  </h3>
                  <div className="flex items-center gap-1">
                    <motion.button onClick={clearChat} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all" title="Clear chat">
                      <Eraser size={14}/>
                    </motion.button>
                    <motion.button onClick={toggleChat} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all">
                      <X size={16}/>
                    </motion.button>
                  </div>
                </div>
                
                
                <div className="h-[350px] md:h-[500px] overflow-y-auto px-4 py-5 space-y-4 chat-messages">
                  <AnimatePresence initial={false}>
                    {chatMessages.map((msg) => (<motion.div key={msg.id} className={`flex items-start gap-2.5 group ${msg.type === 'bot' ? 'max-w-[85%]' : 'ml-auto max-w-[85%] flex-row-reverse'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.type === 'bot'
                    ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30'
                    : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30'}`}>
                          {msg.type === 'bot' ? (<Bot size={12} className="text-indigo-300"/>) : (<User size={12} className="text-blue-300"/>)}
                        </div>
                        <div className="relative">
                          <div className={`py-2.5 px-3.5 rounded-2xl text-sm message-bubble relative ${msg.type === 'bot'
                    ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm text-slate-200 rounded-tl-none border border-indigo-500/20'
                    : 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm text-white rounded-tr-none border border-blue-500/20'}`}>
                            {msg.text}
                          </div>
                          
                          
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(msg.text, msg.id)} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors">
                              {isCopied[msg.id] ? <Check size={10}/> : <Copy size={10}/>}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>))}
                  </AnimatePresence>
                  
                  
                  <AnimatePresence>
                    {isLoading && (<motion.div className="flex items-start gap-2.5 max-w-[85%]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-purple-500/30">
                          <Bot size={12} className="text-indigo-300"/>
                        </div>
                        <div className="py-2.5 px-3.5 rounded-2xl text-sm bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm text-slate-200 rounded-tl-none border border-indigo-500/20">
                          <div className="flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin text-indigo-400"/>
                            <span className="text-xs text-slate-300">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>)}
                  </AnimatePresence>

                  <div ref={messagesEndRef}/>
                </div>
                
                
                <div className="p-3 border-t border-white/5 bg-black/20">
                  <div className="relative">
                    <textarea ref={chatInputRef} value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={handleKeyDown} rows={textareaRows} placeholder="Message AI Assistant..." className="w-full bg-white/5 text-white placeholder-slate-400 rounded-lg py-2.5 px-3.5 pr-12 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/10 resize-none text-sm transition-all duration-200"/>
                    <motion.button onClick={sendMessage} disabled={!chatMessage.trim() || isLoading} whileHover={chatMessage.trim() && !isLoading ? { scale: 1.05 } : {}} whileTap={chatMessage.trim() && !isLoading ? { scale: 0.95 } : {}} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${chatMessage.trim() && !isLoading
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}`}>
                      {isLoading ? (<Loader2 size={14} className="animate-spin"/>) : (<Send size={14}/>)}
                    </motion.button>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 text-center">
                    Press Enter to send • Shift+Enter for new line
                  </div>
                </div>
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}