import { test, expect, Page } from "@playwright/test";

test("user can create a room and see 4 default walls", async ({ page }: { page: Page }) => {
  // TODO:
  // 1. Go to app home
  // 2. Click "Add Room"
  // 3. Expect new room card with 4 walls shown by default
});

test("user can add up to 8 walls per room", async ({ page }: { page: Page }) => {
  // TODO:
  // 1. Open room detail
  // 2. Add walls until there are 8
  // 3. Expect 8 wall items visible in UI
});

test("user cannot add more than 8 walls", async ({ page }: { page: Page }) => {
  // TODO:
  // 1. Try adding 9th wall
  // 2. Expect error message or disabled button
  // 3. Verify wall count stays at 8
});
