import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">VN-AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <Bot className="mx-auto h-20 w-20 text-primary mb-8" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Advanced AI Chatbot
            <span className="text-primary"> Powered by Groq</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Experience lightning-fast AI conversations with state-of-the-art language models. 
            Built for speed, accuracy, and seamless user experience.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth">
              <Button size="lg" className="px-8">
                Start Chatting
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="px-8">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground">
            Everything you need for advanced AI conversations
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Powered by Groq's ultra-fast inference engine for instant responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Sub-second response times</li>
                <li>• Multiple model options</li>
                <li>• Real-time streaming</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Smart Conversations</CardTitle>
              <CardDescription>
                Context-aware AI that remembers your conversation history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Persistent chat history</li>
                <li>• Context understanding</li>
                <li>• Natural conversations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your conversations are protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• End-to-end encryption</li>
                <li>• User authentication</li>
                <li>• Data privacy focused</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience the Future of AI?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users already chatting with VN-AI. 
            Sign up now and start your first conversation.
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-8">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-8 text-center text-muted-foreground">
          <p>&copy; 2024 VN-AI. Powered by Groq and built with Lovable.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
