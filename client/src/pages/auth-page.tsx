import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Bot, MessageSquare, FileText, Zap } from "lucide-react";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
const registerSchema = insertUserSchema;

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => setLocation("/"),
    });
  };

  const onRegister = (data: RegisterData) => {
    registerMutation.mutate(data, {
      onSuccess: () => setLocation("/"),
    });
  };

  if (user) {
    return null; // Redirect will happen via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to AI Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Sign in to access your personalized AI chatbot
            </p>
          </div>

          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Sign up to get started with AI Assistant
                  </CardDescription>
                </TabsContent>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="login">
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Choose a password"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-primary/10 dark:bg-primary/5 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            AI-Powered Chat Assistant
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Experience the future of conversational AI with GPT-4 and advanced RAG capabilities
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Smart Conversations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Powered by GPT-4 for intelligent responses
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Document Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload and chat about your documents
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                RAG Technology
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Context-aware responses using your data
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Chat
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Instant responses with WebSocket connection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
