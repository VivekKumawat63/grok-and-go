import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  message: string;
  response: string;
  model: string;
  created_at: string;
}

interface ChatInterfaceProps {
  onMessageSent?: () => void;
}

const ChatInterface = ({ onMessageSent }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama3-8b-8192");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const groqModels = [
    { value: "llama3-8b-8192", label: "Llama 3 8B" },
    { value: "llama3-70b-8192", label: "Llama 3 70B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { value: "gemma-7b-it", label: "Gemma 7B" },
  ];

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error("Failed to load chat history");
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || loading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setLoading(true);

    try {
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to send messages");
        return;
      }

      // Build conversation history for context
      const conversationHistory = messages.slice(-10).flatMap(msg => [
        { role: "user", content: msg.message },
        { role: "assistant", content: msg.response }
      ]);

      // Call the Groq edge function
      const response = await supabase.functions.invoke('groq-chat', {
        body: {
          message: userMessage,
          model: selectedModel,
          conversation_history: conversationHistory
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { response: aiResponse, message_id } = response.data;

      // Add new message to the list
      const newMessage: Message = {
        id: message_id || crypto.randomUUID(),
        message: userMessage,
        response: aiResponse,
        model: selectedModel,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);
      onMessageSent?.();

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (initialLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>VN-AI Chat</span>
          </CardTitle>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groqModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p>Start a conversation with VN-AI!</p>
              <p className="text-sm mt-2">Ask me anything - I'm here to help.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Message */}
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted rounded-lg p-3">
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Model: {groqModels.find(m => m.value === msg.model)?.label || msg.model}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">VN-AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex space-x-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 min-h-[60px] resize-none"
              disabled={loading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={loading || !currentMessage.trim()}
              size="lg"
              className="h-[60px] px-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;