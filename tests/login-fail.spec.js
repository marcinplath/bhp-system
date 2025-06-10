import { test, expect } from "@playwright/test";

test("Logowanie z błędnym hasłem – wyświetlenie komunikatu o błędzie", async ({
  page,
}) => {
  await page.goto("http://localhost:5173/login");

  // Wprowadzenie poprawnego e-maila, ale błędnego hasła
  await page.getByRole("textbox", { name: "Email" }).fill("admin@test.com");
  await page.getByRole("textbox", { name: "Hasło" }).fill("zlehaslo123");
  await page.getByRole("button", { name: "Zaloguj" }).click();

  // Sprawdzenie, że pojawia się komunikat o błędzie
  await expect(
    page.locator("text=Nieprawidłowy email lub hasło.")
  ).toBeVisible();
});
