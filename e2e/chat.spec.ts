import { test, expect } from "@playwright/test";

test("visitor can reach the AI assistant and prepare a message from an example prompt", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /home/i })).toBeVisible();

  await page.getByRole("link", { name: /try the ai assistant/i }).click();
  await page.waitForURL(/\/ai$/);

  await expect(
    page.getByRole("heading", { name: /ask about my work/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /no conversation yet/i })
  ).toBeVisible();

  const examplePrompt = page.getByRole("button", {
    name: /what technologies do you use\?/i,
  });
  await examplePrompt.click();

  const textbox = page.getByRole("textbox", { name: /ask a question/i });
  await expect(textbox).toHaveValue(/what technologies do you use/i);

  await expect(page.getByRole("button", { name: /send/i })).toBeEnabled();
});