# BHP System – Dokumentacja Techniczna

## Opis projektu

BHP System to webowa aplikacja umożliwiająca łatwe przeprowadzenie krótkiego **testu BHP** dla gości lub pracowników danej firmy oraz zarządzanie tym procesem przez administratorów. System pozwala administratorom tworzyć i edytować **pytania testowe BHP**, zarządzać **użytkownikami** (kontami adminów i zwykłych użytkowników) oraz **zapraszać gości** do wypełnienia testu online. 

Proces wygląda następująco: administrator (lub uprawniony użytkownik) wysyła zaproszenie e-mail do gościa zawierające unikalny link do testu BHP. Gość, korzystając z linku, rozwiązuje test jednokrotnego wyboru. Po pomyślnym ukończeniu testu system generuje dla gościa **kod dostępu**, potwierdzający zaliczenie szkolenia – kod ten jest wysyłany e-mailem. Dla ułatwienia weryfikacji, aplikacja udostępnia także mechanizm sprawdzania ważności kodu dostępu (pracownik w portierni firmy sprawdza czy gość ma ważny kod upoważniający do pozyskania badge'a pozwalającego wejść na teren hali produkcyjnej). Aplikacja składa się z części **backend** (API serwera + baza danych) oraz **frontend** (interfejs webowy) działających razem jako kompletny system.

## Instrukcja instalacji i uruchomienia

Aby uruchomić projekt lokalnie, wykonaj poniższe kroki:

1. **Klonowanie repozytorium** – Upewnij się, że masz zainstalowane wymagane narzędzia: **Node.js** (np. w wersji 16 lub wyższej) wraz z npm lub yarn oraz bazę danych **PostgreSQL**. Następnie sklonuj repozytorium i przejdź do katalogu projektu:
   ```bash
   git clone https://github.com/marcinplath/bhp-system.git
   cd bhp-system
   ```

2. **Konfiguracja bazy danych** – Utwórz nową bazę w PostgreSQL (np. o nazwie `bhp_system`). W katalogu głównym projektu znajduje się plik **`SQL_COMMANDS.txt`**, który zawiera skrypt SQL tworzący tabele i dodający konto administratora. Wykonaj ten skrypt na utworzonej bazie, aby zainicjować strukturę bazy:
   ```sql
   -- przykładowo, w psql:
   \c bhp_system;
   \i SQL_COMMANDS.txt;
   ```
   > **Uwaga:** Skrypt korzysta z funkcji `gen_random_uuid()` do generowania UUID – upewnij się, że w bazie włączono rozszerzenie `pgcrypto` (komenda `CREATE EXTENSION pgcrypto;`), jeśli to konieczne.

3. **Konfiguracja zmiennych środowiskowych (backend)** – W katalogu `backend/` utwórz plik **`.env`** z następującymi zmiennymi (dostosuj wartości do swojej konfiguracji):
   ```env
   PORT=5000               # port, na którym wystartuje backend
   DB_HOST=localhost       # host bazy danych PostgreSQL
   DB_PORT=5432            # port bazy (domyślnie 5432)
   DB_NAME=bhp_system      # nazwa utworzonej bazy danych
   DB_USER=postgres        # nazwa użytkownika bazy danych
   DB_PASSWORD=haslo_db    # hasło użytkownika bazy danych
   JWT_SECRET=...          # tajny klucz do podpisywania tokenów JWT (access token)
   REFRESH_SECRET=...      # tajny klucz do podpisywania refresh tokenów JWT
   SMTP_HOST=smtp.example.com   # (opcjonalnie) konfiguracja SMTP dla wysyłki e-mail
   SMTP_PORT=587               # port SMTP (np. 587 dla TLS)
   SMTP_USER=noreply@example.com   # użytkownik (login) konta e-mail
   SMTP_PASS=superHaslo          # hasło do konta e-mail
   ```
   Wartości `JWT_SECRET` i `REFRESH_SECRET` powinny być losowymi ciągami znaków (to klucze zabezpieczające JWT). Jeśli nie planujesz testować funkcji wysyłania maili, zmienne `SMTP_*` nie muszą być ustawione – w przeciwnym razie podaj dane swojego serwera pocztowego SMTP.

4. **Instalacja i uruchomienie backendu** – Przejdź do katalogu `backend/`, zainstaluj zależności i uruchom serwer:
   ```bash
   cd backend
   npm install         # lub yarn install
   npm start           # start wg skryptu w package.json, lub:
   # npm run dev       # (jeśli zdefiniowano tryb developerski z np. nodemon)
   # npx nodemon server.js   # ewentualnie ręczne uruchomienie w trybie dev
   ```
   Po poprawnym uruchomieniu, backend powinien nasłuchiwać na porcie określonym w zmiennej `PORT` (np. `http://localhost:5000`).

5. **Instalacja i uruchomienie frontendu** – Otwórz nowe okno terminala i przejdź do folderu `frontend/`. Zainstaluj zależności projektu React i uruchom aplikację:
   ```bash
   cd frontend
   npm install        # lub yarn install
   npm run dev        # uruchomienie serwera deweloperskiego Vite
   ```
   Domyślnie aplikacja frontend uruchomi się pod adresem `http://localhost:5173`. Po wejściu pod ten adres w przeglądarce powinna wyświetlić się strona logowania do systemu. Upewnij się, że **backend jest uruchomiony równolegle**, aby zapytania z frontendu mogły być obsłużone (w środowisku deweloperskim frontend jest domyślnie skonfigurowany do komunikacji z API pod `http://localhost:5000` lub innym wskazanym portem backendu).

6. **Logowanie do aplikacji** – Po zainstalowaniu bazy danych z kroku 2, masz już utworzone przykładowe konto administratora. Możesz zalogować się na konto admina używając e-maila `admin@test.com` oraz ustalonego hasła (zahashowane hasło jest zapisane w bazie – domyślnie to hasło to prawdopodobnie **`admin123`**. Po zalogowaniu masz możliwość zmiany hasła. Uzyskasz dostęp do panelu administratora, gdzie można zarządzać użytkownikami, pytaniami i zaproszeniami.

Po wykonaniu powyższych kroków powinieneś mieć działające oba komponenty aplikacji.

## Struktura projektu

Projekt podzielony jest na część serwerową (**backend**) oraz część kliencką (**frontend**). Poniżej opis najważniejszych katalogów i plików:

- **backend/** – kod źródłowy serwera aplikacji (Node.js + Express):
  - `backend/server.js` – główny plik uruchamiający aplikację Express. Konfiguruje middleware, definicje tras i uruchamia nasłuchiwanie na wskazanym porcie.
  - `backend/controllers/` – logika biznesowa podzielona na moduły kontrolerów. Znajduje się tu m.in. `authController.js` z funkcjami rejestracji, logowania i zmiany hasła użytkownika.
  - `backend/routes/` – definicje tras (endpointów API REST):
    - `routes/auth.js` – trasy uwierzytelnienia (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/change-password` itp.).
    - `routes/api.js` – trasy ogólne API dla użytkowników/guestów (np. `/api/test/:link` – pobranie pytań dla testu z danego linku, `/api/test/:link/submit` – przesłanie odpowiedzi, `/api/verify-access/:code` – weryfikacja kodu dostępu, itp.).
    - `routes/admin.js` – trasy dostępne dla administratora (prefiks `/admin`) do zarządzania danymi: tworzenie użytkowników (`POST /admin/create-user`), pobieranie i usuwanie użytkowników, wysyłanie zaproszeń (`POST /admin/send-invitation`), ponowna wysyłka lub usuwanie zaproszeń, zarządzanie pytaniami testowymi (`GET/POST/PUT/DELETE /admin/questions`).
  - `backend/middleware/` – middleware Express zabezpieczające wybrane trasy:
    - `authMiddleware.js` – sprawdza obecność i poprawność tokenu JWT w nagłówku **Authorization** (format "Bearer \<token\>"). Jeśli token jest prawidłowy, dołącza odszyfrowane dane użytkownika do obiektu `req.user`, co pozwala na identyfikację zalogowanego użytkownika w dalszych etapach.
    - `roleMiddleware.js` – sprawdza, czy zalogowany użytkownik ma rolę administratora. Wykorzystywane na trasach administracyjnych – jeśli użytkownik nie jest adminem, zwraca błąd 403 (Brak uprawnień).
  - `backend/database/` – konfiguracja połączenia z bazą danych:
    - `db.js` – ustanawia pulę połączeń do PostgreSQL przy użyciu biblioteki **pg**. Korzysta ze zmiennych środowiskowych `DB_HOST`, `DB_USER` itd. do nawiązania połączenia. Ten moduł jest importowany wszędzie tam, gdzie wykonywane są zapytania SQL.
  - `backend/utils/` – pomocnicze moduły narzędziowe:
    - `emailSender.js` – funkcje do wysyłania wiadomości e-mail za pomocą **nodemailer**. Zawiera dwie funkcje: `sendInvitationEmail(recipient, link)` wysyłającą zaproszenie z linkiem do testu oraz `sendCompletionEmail(recipient, accessCode)` wysyłającą informację o zdanym teście wraz z kodem dostępu. Dane SMTP pobierane są ze zmiennych `SMTP_HOST`, `SMTP_USER` etc.
  
- **frontend/** – kod źródłowy aplikacji frontendowej (React + Vite):
  - `frontend/index.html` – główny plik HTML dla aplikacji React (Vite automatycznie go wykorzystuje).
  - `frontend/tailwind.config.js` – konfiguracja Tailwind CSS (np. wskazanie ścieżek do plików źródłowych, z których mają być zbierane klasy CSS).
  - `frontend/vite.config.js` – konfiguracja Vite (np. port deweloperski, ewentualne proxy do API – w tym projekcie brak dedykowanego proxy, komunikacja odbywa się na pełne URL backendu).
  - `frontend/src/` – główny kod aplikacji React:
    - `src/main.jsx` – punkt wejścia React. Inicjalizuje aplikację, np. montuje `<App />` do drzewa DOM, prawdopodobnie opakowując całość w `<BrowserRouter>` (React Router) i dostawcę kontekstu autoryzacji.
    - `src/App.jsx` – główny komponent React definiujący strukturę nawigacji/routing. Zapewne zawiera konfigurację tras (np. użycie biblioteki **React Router** do zdefiniowania ścieżek takich jak logowanie, panel admina, strona testu itp.).
    - `src/pages/` – komponenty odpowiadające poszczególnym podstronom aplikacji:
      - Przykładowo, można tu oczekiwać stron takich jak `Login.jsx`, `AdminPanel.jsx`, `Invitations.jsx`, `Questions.jsx`, `ManageUsers.jsx`, `Test.jsx` (rozpoczęcie testu przez gościa), `TestResult.jsx` (wynik testu), czy `VerifyCode.jsx` (formularz weryfikacji kodu dostępu). **(Nazwy plików są przypuszczalne na podstawie funkcjonalności – należy sprawdzić rzeczywiste komponenty w katalogu** `pages`**.)**
    - `src/components/` – mniejsze, wielokrotnie używane komponenty UI. Mogą tu być komponenty formularzy (np. pola logowania), przyciski, nagłówek, itp., które są wykorzystywane przez strony.
    - `src/context/` – definicje kontekstu React dla globalnego stanu:
      - `AuthContext.jsx` – kontekst uwierzytelnienia. Prawdopodobnie zarządza stanem bieżącego użytkownika (tokenem JWT, informacjami o roli itp.) i udostępnia metody logowania, wylogowania, automatycznego odświeżania tokenu. Komponenty aplikacji mogą korzystać z tego kontekstu, aby np. przekierować niezalogowanych użytkowników lub dołączyć token do zapytań.
      - `PublicRoute.jsx` – komponent trasy publicznej/chronionej. Możliwe, że warunkuje dostęp do pewnych podstron: np. przekierowuje zalogowanych użytkowników z powrotem do panelu, jeśli wejdą na stronę logowania (lub odwrotnie – chroni strony admina przed dostępem niezalogowanych).
    - `src/api/` – moduły do komunikacji z backendowym API (rozbicie logiki wywołań fetch/axios na osobne pliki):
      - `api.js` – konfiguracja klienta API (np. ustawienie bazowego URL dla zapytań do backendu). Może eksportować funkcje pomocnicze do wykonywania żądań HTTP.
      - `auth.js` – funkcje wywołujące endpointy uwierzytelnienia: np. `login(email, password)` (POST na `/auth/login`), `register(data)` (POST `/auth/register`), `logout()` itp.  
      - `invitations.js` – funkcje do obsługi zaproszeń: np. pobieranie listy zaproszeń (GET `/admin/invitations`), wysyłanie nowego zaproszenia (POST `/admin/send-invitation`), ponowne wysłanie lub usunięcie zaproszenia.
      - `questions.js` – funkcje do zarządzania pytaniami testowymi: pobieranie wszystkich pytań (GET `/admin/questions`), dodawanie nowego pytania (POST), edycja pytania (PUT), usunięcie (DELETE).
      - `manageUsers.js` – funkcje do zarządzania użytkownikami systemu: pobieranie listy użytkowników (GET `/admin/users`), tworzenie nowego konta (POST `/admin/create-user`), usuwanie użytkownika (DELETE).
      - `tests.js` – funkcje związane z przebiegiem testu BHP dla gościa: pobranie pytań na podstawie linku zaproszenia (GET `/api/test/:link`), przesłanie odpowiedzi (POST `/api/test/:link/submit`), sprawdzenie kodu dostępu (GET `/api/verify-access/:code`).
    - `src/index.css` – główny plik CSS wykorzystywany przez Tailwind (prawdopodobnie importowany do aplikacji; Tailwind generuje style na podstawie użytych klas w plikach `.jsx`).
  
- **screenshots/** – katalog z zrzutami ekranu aplikacji (pomocnicze grafiki dokumentujące interfejs, np. formularz logowania, panel zaproszeń, itp.). **Nie jest to część działania aplikacji**, ale może pomóc zrozumieć wygląd i przepływ działania systemu. Przykładowe pliki: `login.png` (ekran logowania), `invitations.png` (zarządzanie zaproszeniami), `questions.png` (zarządzanie pytaniami), `test.png` (ekran wypełniania testu przez gościa), `test-success.png` / `test-fail.png` (wynik testu), `access-code-mail.png` (przykład e-maila z kodem dostępu), `verify-access-code.png` (ekran weryfikacji kodu dostępu).

- **SQL_COMMANDS.txt** – skrypt SQL inicjujący bazę danych (omówiony w kroku instalacji). Tworzy tabele: `users` (użytkownicy systemu), `refresh_tokens` (przechowywane refresh tokeny JWT), `invitations` (zaproszenia wysłane do gości, zawierające m.in. adres e-mail gościa, kto zaprosił, unikalny link i kod dostępu oraz status zaproszenia) oraz `questions` (pytania testowe z trzema opcjami A, B, C i oznaczeniem poprawnej odpowiedzi). Na końcu skrypt dodaje konto administratora z domyślnymi danymi. 

## Technologie i zależności

Projekt wykorzystuje następujące główne technologie i biblioteki:

- **Backend (Node.js + Express):**
  - **Node.js** – środowisko uruchomieniowe JavaScript (aplikacja powinna działać na Node 14+, zalecany Node 16 LTS lub nowszy).
  - **Express 4.x** – framework webowy do stworzenia API REST.
  - **PostgreSQL** – relacyjna baza danych przechowująca dane aplikacji (użytkownicy, pytania, zaproszenia, itp.).
  - **pg (node-postgres)** – sterownik/biblioteka do komunikacji z bazą PostgreSQL z poziomu Node.js.
  - **dotenv** – ładowanie zmiennych środowiskowych z pliku `.env` (konfiguracja aplikacji, dane dostępowe).
  - **cors** – middleware Express do obsługi CORS (Cross-Origin Resource Sharing). W projekcie skonfigurowany tak, by frontend działający pod `localhost:5173` mógł komunikować się z API backendu.
  - **cookie-parser** – middleware Express do parsowania ciasteczek. Wykorzystywany do odczytu `refreshToken` zapisanego w ciasteczku HTTP (podczas odświeżania tokenu dostępowego lub wylogowania).
  - **jsonwebtoken (JWT)** – biblioteka do generowania i weryfikacji tokenów JWT. Używana do tworzenia **access tokenów** (krótkotrwałych tokenów uwierzytelniających do zabezpieczania API) oraz **refresh tokenów** (długotrwałych tokenów do odnawiania sesji). Access token zawiera m.in. ID i rolę użytkownika i jest podpisany kluczem `JWT_SECRET`. Refresh token zawiera ID użytkownika i jest podpisany kluczem `REFRESH_SECRET`.
  - **bcrypt** – biblioteka do haszowania haseł. Hasła użytkowników przechowywane są w postaci zahashowanej (z salt, 10 rund). Podczas tworzenia nowego uzytkownika/zmiany hasła generowany jest hash, a podczas logowania porównywany hash z hasłem podanym.
  - **nodemailer** – biblioteka do wysyłania e-maili. Używana do wysyłki wiadomości z zaproszeniem oraz z kodem dostępu po ukończeniu testu. Wymaga poprawnej konfiguracji SMTP w zmiennych środowiskowych.

- **Frontend (React + Vite):**
  - **JavaScript (ES6+) / JSX** – język użyty do tworzenia komponentów React.
  - **React** – biblioteka do budowy interfejsu użytkownika. Struktura aplikacji dzieli interfejs na komponenty i strony. Wykorzystano również:
    - **React Router Dom** – do obsługi routingu na stronie (nawigacja między widokami logowania, panelu admina, testu itp., a także zabezpieczanie tras – np. przekierowanie na login gdy brak autoryzacji).
    - **React Context API** – do zarządzania stanem globalnym (np. informacje o zalogowanym użytkowniku i tokenach) bez potrzeby dodatkowych bibliotek typu Redux. `AuthContext` dostarcza te dane całej aplikacji.
  - **Vite** – nowoczesne narzędzie build/development dla frontendu. Zapewnia szybki serwer deweloperski (na porcie 5173) oraz budowanie zoptymalizowanej wersji produkcyjnej. W projekcie skonfigurowany jest minimalnie (patrz `vite.config.js`); domyślnie Vite obsługuje bundling modułów ES i integrację z React.
  - **Tailwind CSS** – framework CSS. W projekcie używany do stylowania interfejsu – zamiast tradycyjnych plików CSS, w kodzie JSX komponentów pojawiają się klasy Tailwind (np. `className="bg-blue-500 text-white ..."`) generujące odpowiednie style. Tailwind upraszcza utrzymanie spójnego stylu i responsywności interfejsu.
  - **Biblioteki pomocnicze**: W zależnościach frontendu znajdują się pakiety takie jak:
    - **axios** – do wykonywania zapytań HTTP. W plikach `src/api/*.js` zdefiniowano funkcje wysyłające żądania do backendu i zwracające wyniki.

## Uwagi dotyczące rozwoju

Mimo że projekt jest funkcjonalny, istnieją obszary, które warto dopracować podczas dalszego rozwoju oraz rozbudować go o nowe możliwości:

- **Bezpieczeństwo i konfiguracja produkcyjna:**  
  - Obecnie aplikacja jest skonfigurowana pod kątem środowiska deweloperskiego. Należy zadbać o odpowiednią konfigurację do środowiska produkcyjnego:
    - **CORS:** W `server.js` domena frontendowa jest na sztywno ustawiona na `http://localhost:5173`. W środowisku produkcyjnym trzeba to zmienić na adres docelowy frontendu lub zezwolić na odpowiednie originy.
    - **Cookies i JWT:** Aktualnie refresh token jest wysyłany w ciasteczku **niezabezpieczonym** (`secure: false`, `sameSite: "Strict"`). Przed wdrożeniem produkcyjnym ustaw `secure: true` (wymaga HTTPS). Istotne może być między innymi wprowadzenie mechanizmu unieważniania wszystkich sesji użytkownika po zmianie hasła.
    - **Hasła i polityka haseł:** Warto dodać *walidację siły hasła* przy rejestracji/zmianie hasła oraz mechanizm **resetowania hasła** (obecnie brak).
    - **Ustawienia SMTP:** Obecnie konfiguracja SMTP jest wymagana do wysyłki e-maili. W razie braku SMTP, wysyłka e-mail zakończy się błędem – warto zaimplementować obsługę takiego błędu i np. umożliwić pracę systemu nawet bez wysyłania maili.
    - **Adresy URL w wiadomościach:** Link do testu wysyłany e-mailem jest zdefiniowany jako `http://localhost:5173/test/<UUID>`. Należy go parametryzować (np. na podstawie zmiennej środowiskowej FRONTEND_URL), aby w środowisku produkcji wskazywał prawidłową domenę aplikacji frontendu.
  
- **Testy automatyczne:**  
  Aktualnie brak jest testów jednostkowych lub integracyjnych. Dla dalszego rozwoju warto wprowadzić testy:
    - **Backend:** Można dodać testy jednostkowe dla kontrolerów (np. czy logika rejestracji poprawnie obsługuje istniejącego użytkownika, czy logowanie zwraca poprawne kody statusu przy złym haśle itp.).
    - **Frontend:** Warto dodać testy komponentów i widoków, aby upewnić się, że interakcje działają zgodnie z założeniami (np. kliknięcie przycisku "Wyślij zaproszenie" faktycznie wywołuje zapytanie i pokazuje komunikat sukcesu).
  
- **Poprawki i usprawnienia funkcjonalne:**  
  - **Obsługa błędów i walidacja:** Aplikacja wykonuje podstawową walidację (np. sprawdzenie czy e-mail ma poprawny format przy wysyłaniu zaproszenia, czy wszystkie pola pytania są uzupełnione). W przyszłości warto rozbudować walidację po stronie frontendu (np. wykorzystać biblioteki pokroju Formik lub Yup do walidacji formularzy) oraz bardziej szczegółowo po stronie backendu (zwracanie spójnych komunikatów błędów). Dodatkowo, globalny handling błędów na backendzie (middleware `errorHandler`) mógłby ujednolicić strukturę odpowiedzi błędów.
  - **UI/UX:** Interfejs oparty o Tailwind jest prosty i czytelny, ale można go rozbudować: np. dodać wyświetlanie spinnera podczas ładowania danych, potwierdzenia akcji usunięcia (modal “Czy na pewno usunąć?”), paginację lub wyszukiwarkę w listach użytkowników/pytań jeśli tych danych będzie dużo.
  - **Rozszerzenie funkcjonalności testu:** Obecny test BHP zawiera pytania jednokrotnego wyboru z trzema opcjami. Można rozważyć:
    - Losowanie ograniczonej liczby pytań z bazy (np. 5 losowych pytań z puli) – obecnie wygląda na to, że zapytanie pobiera wszystkie pytania (`ORDER BY RANDOM()` sugeruje losową kolejność, ale nie ogranicza liczby).
  - **Zarządzanie sesją:** Projekt zakłada, że jeden użytkownik może mieć jeden refresh token (podczas logowania sprawdzane jest, czy w tabeli `refresh_tokens` istnieje już token dla danego użytkownika – jeśli tak, wymuszane jest wylogowanie przed ponownym logowaniem). W przyszłości można umożliwić logowanie na wielu urządzeniach jednocześnie, wtedy należałoby zmodyfikować to ograniczenie (np. przechowywać wiele refresh tokenów per użytkownik lub identyfikować urządzenia).
  
- **Optymalizacja i utrzymanie:**  
  - **Kwestie wydajności:** Dla obecnej skali (kilka tabel) rozwiązanie jest wystarczające. Jeśli danych będzie bardzo dużo, można wprowadzić indeksy w bazie (np. na kolumnie `expires_at` w `invitations` do szybkiego czyszczenia wygasłych zaproszeń, indeks na `user_id` w `refresh_tokens` itp.). 
    - Revokowanie/usuwanie refresh tokenów po wygaśnięciu (np. okresowo usuwać tokeny przeterminowane – chociaż ich obecność nie wpływa mocno na wydajność, to utrzymywanie czystości bazy jest dobrą praktyką).
    - Można wprowadzić funckje do informowania o wygasłych zaproszeniach podczas każdego logowania admina.
  - **Refaktoryzacja kodu backend:** Plik `admin.js` ma dużą liczbę linii z logiką. Można rozważyć przeniesienie części logiki do modułów **controllers** (analogicznie jak zrobiono dla uwierzytelniania). Np. stworzyć `InvitationController`, `QuestionController`, które zawierałyby funkcje do obsługi zaproszeń i pytań. Ułatwi to testowanie tych funkcji i zmniejszy złożoność pojedynczych plików.
  
Podsumowując, **BHP System** stanowi solidną bazę do dalszego rozwoju
