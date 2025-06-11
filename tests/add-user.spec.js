import { test, expect } from "@playwright/test";

test("Dodanie nowego użytkownika przez administratora", async ({ page }) => {
  const timestamp = Date.now();
  const email = `testuser+${timestamp}@user.com`;

  // Wejście na stronę logowania
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email" }).fill("admin@test.com");
  await page.getByRole("textbox", { name: "Hasło" }).fill("goofy123#");
  await page.getByRole("button", { name: "Zaloguj" }).click();

  // Przejście do panelu użytkowników
  await page.getByRole("link", { name: "Zarządzaj użytkownikami" }).click();

  // Dodanie nowego użytkownika
  await page.getByRole("textbox", { name: "np. user@example.com" }).fill(email);
  await page.getByPlaceholder("********").fill("goofy123#");
  await page.getByRole("combobox").selectOption("user");
  await page.getByRole("button", { name: "Utwórz" }).click();

  // Asercja – sprawdzenie czy pojawił się na liście
  await expect(page.getByRole("cell", { name: email })).toBeVisible();

  // Wylogowanie
  await page.getByRole("button", { name: "Wyloguj" }).click();
});
