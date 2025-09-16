import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Bot, LogOut, MessageSquare, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import ChatInterface from "@/components/ChatInterface";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);
      await fetchMessageCount(session.user.id);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/auth");
        } else if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
          fetchMessageCount(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchMessageCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching message count:', error);
    } else {
      setMessageCount(count || 0);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error("Error clearing chat history");
    } else {
      toast.success("Chat history cleared successfully");
      setMessageCount(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Bot className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">VN-AI Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {profile?.display_name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{messageCount} messages sent</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={handleClearHistory}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Models</CardTitle>
                <CardDescription>Available Groq models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• Llama 3 8B</div>
                  <div>• Llama 3 70B</div>
                  <div>• Mixtral 8x7B</div>
                  <div>• Gemma 7B</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="md:col-span-3">
            <ChatInterface onMessageSent={() => fetchMessageCount(user!.id)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;