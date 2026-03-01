import { useState, useRef, useEffect } from "react";
import { useConversations, useCreateConversation, useChatStream } from "@/hooks/use-chat";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Plus, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

export default function Tutor() {
  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const createMutation = useCreateConversation();
  
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Set initial active conversation
  useEffect(() => {
    if (conversations?.length && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const { sendMessage, isStreaming, streamingContent } = useChatStream(activeId);
  
  // To keep UI simple, we'll manually track the current session's messages
  // in a real app, useConversation would fetch the history
  const [localMessages, setLocalMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'assistant', content: 'Hello! I am your AI Tutor. What concept would you like me to explain today?' }
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, streamingContent]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    const userMsg = input;
    setInput("");
    
    // Add user message to UI immediately
    setLocalMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    // Create new conversation if none exists
    let targetId = activeId;
    if (!targetId) {
      const newConv = await createMutation.mutateAsync("New Topic");
      targetId = newConv.id;
      setActiveId(targetId);
    }
    
    // Send to backend
    await sendMessage(userMsg);
    
    // Once streaming is done, it's captured in streamingContent. 
    // We append it to localMessages in a useEffect or handle it cleanly.
    // For simplicity, we just rely on streamingContent rendering live, 
    // and when isStreaming flips to false, we commit it.
  };

  useEffect(() => {
    if (!isStreaming && streamingContent) {
      setLocalMessages(prev => [...prev, { role: 'assistant', content: streamingContent }]);
    }
  }, [isStreaming]);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar for conversations */}
      <div className="hidden md:flex flex-col w-64 glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="p-4 border-b border-white/5">
          <Button 
            onClick={() => {
              setLocalMessages([{ role: 'assistant', content: 'New topic! What are we learning?' }]);
              setActiveId(null);
            }} 
            className="w-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
          >
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          {loadingConversations ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
          ) : conversations?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No past chats</div>
          ) : (
            <div className="space-y-1">
              {conversations?.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveId(conv.id);
                    // Reset local state - in a full app, fetch history
                    setLocalMessages([{ role: 'assistant', content: `Resumed chat: ${conv.title}` }]);
                  }}
                  className={`
                    w-full text-left px-3 py-3 rounded-xl text-sm flex items-center gap-3 transition-colors
                    ${activeId === conv.id ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-white/5 overflow-hidden relative">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center neon-glow">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Tutor Bot</h2>
            <p className="text-xs text-muted-foreground">Powered by AI - Ask anything!</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
          {localMessages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${msg.role === 'user' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}
              `}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`
                max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-secondary text-secondary-foreground rounded-tr-sm' 
                  : 'bg-white/5 border border-white/10 text-white rounded-tl-sm prose prose-invert max-w-none'
                }
              `}>
                {msg.role === 'assistant' ? (
                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {isStreaming && streamingContent && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed bg-white/5 border border-primary/30 text-white rounded-tl-sm prose prose-invert max-w-none neon-glow">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
              </div>
            </div>
          )}
          
          {isStreaming && !streamingContent && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-75" />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex gap-3 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary pr-12 text-white"
              disabled={isStreaming}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isStreaming}
              className="absolute right-1 top-1 h-10 w-10 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-[0_0_10px_-2px_hsl(var(--primary))]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
