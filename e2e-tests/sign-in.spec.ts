import { expect, test } from '@playwright/test';
import { NotificationProperties, User } from '@stevenkellner/team-conduct-api';
import { Guid, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunctionsMock } from './FirebaseFunctionsMock';

const defaultUser = new User(
    User.Id.builder.build(Guid.generate().flatten),
    UtcDate.now,
    new User.SignInType.Email('testuser@team-conduct.com'),
    new User.Properties('Test', 'User'),
    new User.Settings(new NotificationProperties())
);

test('email login | should validate required fields', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('email-error-message')).toContainText('Email is required to log in');
    await expect(page.getByTestId('password-error-message')).toContainText('Password is required to log in');
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid email or password. Please try again.');
});

test('email login | should validate malformed email addresses', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('email-input').fill('invalid-email');
    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('email-error-message')).toContainText('Please enter a valid email address');
});

test('email login | should show internal error on login failure', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('email-input').fill('testuser@team-conduct.com');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    await FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');

    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('email login | should navigate after successful login', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('email-input').fill('testuser@team-conduct.com');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    await FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser);

    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page).toHaveURL('http://localhost:4200/dashboard');
});

test('email registration | should switch to register mode when user is not found', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('email-input').fill('new.user@team-conduct.com');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    await FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');

    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('sign-in-title')).toContainText('Create Account');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your first name, last name, email, and password to create your account.');
    await expect(page.getByTestId('first-name-input')).toBeVisible();
    await expect(page.getByTestId('last-name-input')).toBeVisible();
    await expect(page.getByTestId('email-input')).toHaveValue('new.user@team-conduct.com');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('ValidPass123!');
    await expect(page.getByTestId('register-button').getByRole('button')).toBeVisible();
    await expect(page.getByTestId('cancel-register-button').getByRole('button')).toBeVisible();
});
