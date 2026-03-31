# Gemini Chat Clone 

Профессиональный клон интерфейса чат-бота (типа ChatGPT), построенный на стеке **Next.js**, **Supabase** и **Gemini AI**. Проект ориентирован на высокую производительность, безопасность и плавный UX.

## Основные возможности

* **Интеллектуальные диалоги:** Стриминг ответов в реальном времени с использованием Gemini LLM.
* **Мультимодальность:** Поддержка вставки и загрузки изображений/документов для контекста.
* **Умная навигация:** История чатов в боковой панели с сохранением в базе данных.
* **Авторизация:** Полноценная аутентификация пользователей через Supabase Auth.
* **Анонимный доступ:** Возможность задать до 3 вопросов без регистрации.
* **Realtime Sync:** Синхронизация новых чатов и сообщений между открытыми вкладками через Supabase Realtime.
* **Адаптивный дизайн:** Полная поддержка мобильных устройств(Shadcn UI + Tailwind).

## Технический стек

* **Frontend:** React / Next.js (App Router), Tanstack Query.
* **UI/UX:** Shadcn UI, Tailwind CSS, Lucide Icons.
* **State Management:** **Zustand** (используется для управления вложениями, глобальных статусов отправки `isSending` и синхронизации данных между роутами).
* **Backend:** Next.js REST API (Route Handlers).
* **Database & Auth:** Supabase (PostgreSQL).
* **Realtime:** Supabase Realtime.
* **AI:** Google Generative AI SDK (Gemini 2.0 Flash).


## Архитектура и оптимизация

### Безопасность и разделение слоев (Separation of Concerns)
Проект строго следует правилам безопасной архитектуры:
1.  **Client-side:** Компоненты не делают прямых вызовов к БД. Весь обмен данными идет исключительно через API Routes (`/api/...`).
2.  **API Layer:** Общается с Supabase на стороне сервера, используя `SUPABASE_SERVICE_ROLE_KEY`. Это полностью исключает утечку ключей и обход RLS на клиенте.
3.  **No Public Client:** Доступ к данным через публичный клиент разрешен только для прослушивания Realtime-событий, как того требует архитектура Supabase.

### Проблемы и решения
При работе с длинными списками сообщений часто необходимо было виртуализировать сообщения. Из-за неисвестной высоты подгружаемых сообщений и возможной вложенности фото происходили
проскакивания из-за перерасчета высоты.
* **Решение:** Я выбрал виртуализировать пачки сообщений как оптимальный баланс между скоростью разработки и плавностью UI, но все равно остались небольшие рывки.


## Установка и запуск

### 1. Подготовка Supabase
1.  Создайте проект на [Supabase](https://supabase.com/).
2.  В разделе **Project Settings > API** получите URL и ключи.
3.  В разделе **Authentication** настройте провайдер (Email/Password).

### 2. Переменные окружения
Создайте файл `.env` в корне проекта и заполните его следующими данными:

```env
# Публичные ключи для инициализации клиента и Realtime
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Приватный ключ (только для сервера)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Google AI SDK
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```
### 3. Настройка базы данных
Для работы приложения необходимо создать таблицы. Запустите следующие SQL-запросы в консоли Supabase (SQL Editor):
```SQL
DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Таблица профилей
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Триггер для авто-создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Таблица чатов
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id TEXT,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    role message_role NOT NULL, 
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица вложений
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_guest_id ON public.chats(guest_id);

-- Включение Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.chats, public.messages;
COMMIT;
```

### 4. Запуск локально
```Bash
# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev
```
Проект разработан в качестве демонстрации навыков работы с Fullstack Next.js приложениями.
