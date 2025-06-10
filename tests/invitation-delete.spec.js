import { test, expect } from "@playwright/test";

test("Usunięcie zaproszenia i potwierdzenie zniknięcia z listy", async ({
  page,
}) => {
  const timestamp = Date.now();
  const guestEmail = `gosc-${timestamp}@example.com`;

  await test.step("Logowanie jako admin", async () => {
    await page.goto("http://localhost:5173/login");
    await page.getByRole("textbox", { name: "Email" }).fill("admin@test.com");
    await page.getByRole("textbox", { name: "Hasło" }).fill("goofy123#");
    await page.getByRole("button", { name: "Zaloguj" }).click();
  });

  await test.step("Przejście do zakładki Zaproszenia", async () => {
    await page.getByRole("link", { name: "Zaproszenia" }).click();
  });

  await test.step("Dodanie nowego zaproszenia", async () => {
    await page.getByRole("textbox", { name: "E-mail gościa" }).fill(guestEmail);
    await page.getByRole("button", { name: "Wyślij zaproszenie" }).click();
    const row = page.locator("tr", {
      has: page.getByRole("cell", { name: guestEmail }),
    });
    await expect(row).toBeVisible();
  });

  await test.step("Usunięcie zaproszenia", async () => {
    const row = page.locator("tr", {
      has: page.getByRole("cell", { name: guestEmail }),
    });
    await row.getByRole("button", { name: "Usuń" }).click();

    const confirmButton = page.getByRole("button", {
      name: "Usuń",
      exact: true,
    });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  });

  await test.step("Weryfikacja, że zaproszenie zniknęło z listy", async () => {
    await expect(
      page.getByRole("cell", { name: guestEmail })
    ).not.toBeVisible();
  });

  await test.step("Wylogowanie", async () => {
    await page.getByRole("button", { name: "Wyloguj" }).click();
  });
});
