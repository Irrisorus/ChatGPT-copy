"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Используем роутер Next.js
import { toast } from "sonner";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error: any) => {
        const status = error.status;

        if (status === 401) {
          toast.error("Вы не авторизованы");
          router.push("/login");
          return;
        }

        if (status === 404) {
          toast.error("Запрашиваемый ресурс не найден");
          router.push("/chats"); 
          return;
        }

        if (status === 403) {
          toast.error("У вас нет доступа к этому разделу");
          router.push("/chats");
          return;
        }
        toast.error(error.message || "Ошибка загрузки");
      },
    }),

    mutationCache: new MutationCache({
      onError: (error: any) => {
        if (error.status === 401) {
          router.push("/login");
        } else {
          toast.error(error.message || "Ошибка операции");
        }
      },
    }),

    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false, // При редиректах лучше отключать ретраи, чтобы не моргало
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
