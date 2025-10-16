import { test, expect, Page } from "@playwright/test";

test("user can add 2 doors per wall", async ({ page }: { page: Page }) => {
  // TODO: navigate, add doors, verify UI updates
});

test("adding a 3rd door shows validation error", async ({ page }: { page: Page }) => {
  // TODO: try to add 3rd door, assert error message
});

test("user can add up to 3 windows per wall", async ({ page }: { page: Page }) => {
  // TODO: navigate, add 3 windows, check they render
});

test("adding a 4th window shows validation error", async ({ page }: { page: Page }) => {
  // TODO: try to add 4th window, assert error
});
