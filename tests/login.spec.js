import { test, expect } from "@playwright/test";

test("Poprawne logowanie i wylogowanie", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email" }).fill("admin@test.com");
  await page.getByRole("textbox", { name: "Hasło" }).fill("goofy123#");
  await page.getByRole("button", { name: "Zaloguj" }).click();
  await expect(page.getByRole("button", { name: "Wyloguj" })).toBeVisible();
  await page.getByRole("button", { name: "Wyloguj" }).click();
  await expect(page.getByRole("button", { name: "Zaloguj" })).toBeVisible();
});
