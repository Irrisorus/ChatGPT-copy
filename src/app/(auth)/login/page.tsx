"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-client";
import { toast } from "sonner"; 

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent, type: "login" | "register") => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }
    //----------------------------НУЖЕН РЕФАКТОРИНГ ------------------------------
    setIsLoading(true);
    
    try {
      const { data, error } = type === "login" 
        ? await supabaseBrowser.auth.signInWithPassword({ email, password })
        : await supabaseBrowser.auth.signUp({ email, password });

      if (error) {
        toast.error(error.message === "Invalid login credentials" 
          ? "Неверная почта или пароль" 
          : error.message
        );
      } else {
        if (type === "register" && !data.session) {
          toast.success("Успешно!", {
            description: "Проверьте почту для подтверждения аккаунта.",
            duration: 5000,
          });
        } else {
          toast.success("Вход выполнен успешно");
          router.push("/");
          router.refresh();
        }
      }
    } catch (err) {
      toast.error("Произошла непредвиденная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 px-4 font-sans">
      <Card className="w-full max-w-md shadow-lg border-none md:border">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Gemini Chat</CardTitle>
            <CardDescription className="text-center">
              Войдите или создайте аккаунт
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <form 
              id="auth-form" 
              className="space-y-4" 
              onSubmit={(e) => {
                const activeTab = document.querySelector('[data-state="active"][role="tabpanel"]')?.id;
                handleAuth(e, activeTab?.includes("register") ? "register" : "login");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col">
            <TabsContent value="login" className="w-full m-0">
              <Button 
                className="w-full" 
                onClick={(e) => handleAuth(e, "login")} 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Войти
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="w-full m-0">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={(e) => handleAuth(e, "register")} 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Создать аккаунт
              </Button>
            </TabsContent>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
