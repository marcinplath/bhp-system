import { test, expect } from "@playwright/test";

test("Próba dodania użytkownika z istniejącym adresem e-mail", async ({
  page,
}) => {
  const email = "admin@test.com"; // używamy istniejącego maila

  // Wejście na stronę logowania
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email" }).fill("admin@test.com");
  await page.getByRole("textbox", { name: "Hasło" }).fill("goofy123#");
  await page.getByRole("button", { name: "Zaloguj" }).click();

  // Przejście do panelu użytkowników
  await page.getByRole("link", { name: "Zarządzaj użytkownikami" }).click();

  // Próba ponownego dodania istniejącego użytkownika
  await page.getByRole("textbox", { name: "np. user@example.com" }).fill(email);
  await page.getByPlaceholder("********").fill("dowolnehaslo123");
  await page.getByRole("combobox").selectOption("user");
  await page.getByRole("button", { name: "Utwórz" }).click();

  // Asercja – sprawdzenie komunikatu błędu
  await expect(
    page.locator("text=Użytkownik z tym emailem już istnieje")
  ).toBeVisible();

  // Wylogowanie
  await page.getByRole("button", { name: "Wyloguj" }).click();
});
