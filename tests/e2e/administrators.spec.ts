import { test, expect } from '@playwright/test';
import { login } from './auth.spec'; // Assuming login function is exported from auth.spec.ts

test.describe('Administrators section E2E tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page); // Log in before each test
    await page.goto('/administrators'); // Navigate to the administrators page
    await expect(page.locator('h1')).toHaveText('Administrators'); // Verify page title
  });

  test('should create a new administrator', async ({ page }) => {
    await page.click('button:has-text("Create Administrator")');
    await page.fill('input[placeholder="Enter name"]', 'Test Administrator');
    await page.fill('input[placeholder="Enter email"]', 'test.admin@example.com');
    await page.selectOption('select[id="role"]', { label: 'Administrator' }); // Assuming 'Administrator' is a role option
    await page.click('button:has-text("Save")');

    // Wait for the success message or the new entry to appear
    await expect(page.locator('text=Administrator created successfully')).toBeVisible();
    await expect(page.locator('text=Test Administrator')).toBeVisible();
  });

  test('should read administrators', async ({ page }) => {
    // Since beforeEach navigates to the page and verifies the title,
    // this test mainly verifies that the data table is visible and has some content.
    await expect(page.locator('.p-datatable')).toBeVisible();
    await expect(page.locator('.p-datatable-tbody tr')).toBeGreaterThan(0); // Expect at least one row
  });

  test('should update an administrator', async ({ page }) => {
    // Assuming there's at least one administrator to update
    await page.locator('.p-datatable-tbody tr:first-child .pi-pencil').click(); // Click on the edit icon of the first row

    await expect(page.locator('h5')).toHaveText('Edit Administrator'); // Verify dialog title

    await page.fill('input[placeholder="Enter name"]', 'Updated Test Administrator');
    await page.click('button:has-text("Save")');

    // Wait for the success message or the updated entry to appear
    await expect(page.locator('text=Administrator updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Test Administrator')).toBeVisible();
  });

  test('should delete an administrator', async ({ page }) => {
    // Assuming there's at least one administrator to delete
    await page.locator('.p-datatable-tbody tr:first-child .pi-trash').click(); // Click on the delete icon of the first row

    await expect(page.locator('.p-confirm-dialog-message')).toHaveText('Are you sure you want to delete this record?'); // Verify confirmation dialog message
    await page.click('button:has-text("Yes")');

    // Wait for the success message
    await expect(page.locator('text=Administrator deleted successfully')).toBeVisible();
    // Optionally, verify that the deleted administrator is no longer in the table
  });
});