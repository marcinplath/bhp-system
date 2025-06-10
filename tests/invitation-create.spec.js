import { test, expect } from "@playwright/test";

test("Wysłanie zaproszenia do gościa i weryfikacja obecności na liście", async ({
  page,
}) => {
  const timestamp = Date.now();
  const guestEmail = `gosc+${timestamp}@example.com`;

  // Logowanie jako admin
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email" }).fill("admin@test.com");
  await page.getByRole("textbox", { name: "Hasło" }).fill("goofy123#");
  await page.getByRole("button", { name: "Zaloguj" }).click();

  // Przejście do zakładki zaproszeń
  await page.getByRole("link", { name: "Zaproszenia" }).click();

  // Wysłanie zaproszenia
  await page.getByRole("textbox", { name: "E-mail gościa" }).fill(guestEmail);
  await page.getByRole("button", { name: "Wyślij zaproszenie" }).click();

  // Asercja – sprawdzenie, że adres e-mail gościa pojawił się w tabeli
  await expect(page.getByRole("cell", { name: guestEmail })).toBeVisible();

  // Wylogowanie
  await page.getByRole("button", { name: "Wyloguj" }).click();
});
