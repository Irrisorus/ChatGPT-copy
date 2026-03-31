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
import { AuthMode } from "@/types";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!email || !password) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = mode === "login"
        ? await supabaseBrowser.auth.signInWithPassword({ email, password })
        : await supabaseBrowser.auth.signUp({ email, password });

      if (error) {
        const message = error.message === "Invalid login credentials"
          ? "Неверная почта или пароль"
          : error.message;
        toast.error(message);
      } else {
        if (mode === "register" && !data.session) {
          toast.success("Успешно!", {
            description: "Проверьте почту для подтверждения аккаунта.",
            duration: 5000,
          });
        } else {
          toast.success("Вход выполнен успешно");
          router.push("/chats");
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
        <Tabs 
          value={mode} 
          onValueChange={(v) => setMode(v as AuthMode)} 
          className="w-full"
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Gemini Chat</CardTitle>
            <CardDescription className="text-center">
              {mode === "login" ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login" className="cursor-pointer">Вход</TabsTrigger>
              <TabsTrigger value="register" className="cursor-pointer">Регистрация</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="hidden" />
            </form>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full cursor-pointer"
              onClick={handleAuth}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </Button>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
