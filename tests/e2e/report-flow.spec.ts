import { test, expect, Page } from "@playwright/test";

test("user can generate a PDF report after adding rooms/walls", async ({ page }: { page: Page }) => {
  // TODO: 
  // 1. Navigate to app
  // 2. Add a room + walls
  // 3. Click "Generate Report"
  // 4. Expect download or PDF preview
});

test("report footnotes show manual overrides", async ({ page }: { page: Page }) => {
  // TODO:
  // 1. Add a room with surfaces
  // 2. Apply manual price override
  // 3. Generate report
  // 4. Expect footnote mentioning the override
});

test("adding >12 rooms triggers a soft warning but continues", async ({ page }: { page: Page }) => {
  // TODO:
  // 1. Add 13 rooms
  // 2. Expect a warning banner/modal
  // 3. But also expect that all rooms are still created
});
