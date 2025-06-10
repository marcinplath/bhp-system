import { test, expect } from "@playwright/test";

test("Dodawanie nowego pytania w panelu administracyjnym", async ({ page }) => {
  await test.step("Logowanie jako admin", async () => {
    await page.goto("http://localhost:5173/");
    await page.getByRole("link", { name: "Zaloguj" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill("admin@test.com");
    await page.getByRole("textbox", { name: "Hasło" }).fill("goofy123#");
    await page.getByRole("button", { name: "Zaloguj" }).click();
  });

  await test.step('Przejście do panelu "Pytania"', async () => {
    await page.getByRole("link", { name: "Pytania" }).click();
    await expect(
      page.getByRole("heading", { name: "Panel pytań" })
    ).toBeVisible();
  });

  await test.step("Dodanie nowego pytania", async () => {
    await page.getByPlaceholder("Treść pytania").fill("Pytanie testowe");
    await page.getByPlaceholder("Odpowiedź A").fill("tekst A");
    await page.getByPlaceholder("Odpowiedź B").fill("tekst B");
    await page.getByPlaceholder("Odpowiedź C").fill("tekst C");
    await page.getByRole("combobox").selectOption("B");
    await page.getByRole("button", { name: "Dodaj pytanie" }).click();
  });

  await test.step("Sprawdzenie, czy pytanie zostało dodane do tabeli", async () => {
    const row = page.locator("table").locator("tr").nth(1); // Pierwszy wiersz po nagłówkach
    await expect(row.locator("td")).toContainText([
      "Pytanie testowe",
      "tekst A",
      "tekst B",
      "tekst C",
      "B",
    ]);
  });

  await test.step("Wylogowanie użytkownika", async () => {
    await page.getByRole("button", { name: "Wyloguj" }).click();
    await expect(page.getByRole("link", { name: "Zaloguj" })).toBeVisible();
  });
});
