import { test, expect } from '@playwright/test';
import { FirebaseFunctionsMock } from './FirebaseFunctionsMock';
import { User } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

const defaultUser = new User(User.Id.builder.build('testuser'), UtcDate.now, new User.SignInTypeEmail('testuser@team-conduct.com'));

test('username-password login | should show error message if username input is invalid', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    // Username too short
    await page.getByTestId('username-input').fill('ab');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username must be between 4 and 24 characters long');

    // Username with invalid characters
    await page.getByTestId('username-input').fill('invalid*user');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username can only contain letters, numbers, dots (.), hyphens (-), and underscores (_)');

    // Username starting with special character
    await page.getByTestId('username-input').fill('.invaliduser');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username cannot start and end with a special character (., -, _)');

    // Username with consecutive special characters
    await page.getByTestId('username-input').fill('invalid__user');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username cannot contain consecutive special characters (., -, _)');

    // Username empty, input dirty
    await page.getByTestId('username-input').fill('');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('Username is required to log in');

    // Username valid
    await page.getByTestId('username-input').fill('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible()
});

test('username-password login | should show error message if password input is invalid', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    // Password too short
    await page.getByTestId('password-input').getByRole('textbox').fill('asdf');
    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('The password must be at least 8 characters long');

    // Password empty, input dirty
    await page.getByTestId('password-input').getByRole('textbox').fill('');
    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('Password is required to log in');

    // Password valid
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();
});

test('username-password login | navigate the login form with tab and enter', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your credentials to access your account.');

    await page.getByTestId('username-input').click();
    await expect(page.getByTestId('username-input')).toBeFocused();
    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('username-input').press('Tab');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toBeFocused();
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');

    FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await page.getByTestId('password-input').getByRole('textbox').press('Enter');

    await expect(page.getByTestId('login-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('username-password login | should show error message on required input', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible();
    await expect(page.getByTestId('username-error-message')).toContainText('Username is required to log in');

    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('Password is required to log in');

    await expect(page.getByTestId('login-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid username or password. Please try again.');
});

test('username-password login | should show error message on invalid input', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('ab');
    await page.getByTestId('password-input').getByRole('textbox').fill('abcd');
    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible();
    await expect(page.getByTestId('username-error-message')).toContainText('he username must be between 4 and 24 characters long');
    await expect(page.getByTestId('username-input')).toHaveValue('ab');

    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('The password must be at least 8 characters long');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('abcd');

    await expect(page.getByTestId('login-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid username or password. Please try again.');
});

test('username-password login | should show internal error message on login failure', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');
    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');

    FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('ValidPass123!');

    await expect(page.getByTestId('login-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('username-password login | should show wrong password error message', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    // Make sure the user exists in firebase auth
    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser);
    await page.getByTestId('login-button').getByRole('button').click();

    await page.getByTestId('password-input').getByRole('textbox').fill('IncorrectPass123!');
    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('IncorrectPass123!');

    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('The password is incorrect');

    await expect(page.getByTestId('login-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Incorrect password for the given username. Please input the correct password and try again.');
});

test('username-password login | button should be loading, other methods disabled during login', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 10_000);
    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('login-button').getByRole('button')).toHaveClass(/p-button-loading/);
    await expect(page.getByTestId('login-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).toBeDisabled();
});

test('username-password login | button should not be loading, other methods not disabled anymore after login', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 1_000);
    await page.getByTestId('login-button').getByRole('button').click();

    await new Promise((resolve) => setTimeout(resolve, 1_500));

    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-loading/);
    await expect(page.getByTestId('login-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).not.toBeDisabled();
});

test('username-password login | should clear errors after successful login', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await page.getByTestId('login-button').getByRole('button').click();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('google-error-message')).not.toBeVisible();

    await page.getByTestId('username-input').fill('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser);
    await page.getByTestId('login-button').getByRole('button').click();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
});

test('username-password register | should leave username and password in register form, cancel and register button enabled', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(page.getByTestId('sign-in-title')).toContainText('Create Account');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Choose a username and password to create your account.');

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('ValidPass123!');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    await expect(page.getByTestId('login-button')).not.toBeVisible();

    await expect(page.getByTestId('cancel-register-button').getByRole('button')).toBeVisible();
    await expect(page.getByTestId('cancel-register-button').getByRole('button')).not.toBeDisabled();

    await expect(page.getByTestId('register-button').getByRole('button')).toBeVisible();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toHaveClass(/p-button-danger/);

    await expect(page.getByTestId('form-error-message')).not.toBeVisible();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).toBeDisabled();
});

test('username-password register | should show error message if username input is invalid', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Username too short
    await page.getByTestId('username-input').fill('ab');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username must be between 4 and 24 characters long');

    // Username with invalid characters
    await page.getByTestId('username-input').fill('invalid*user');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username can only contain letters, numbers, dots (.), hyphens (-), and underscores (_)');

    // Username starting with special character
    await page.getByTestId('username-input').fill('.invaliduser');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username cannot start and end with a special character (., -, _)');

    // Username with consecutive special characters
    await page.getByTestId('username-input').fill('invalid__user');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username cannot contain consecutive special characters (., -, _)');

    // Username empty, input dirty
    await page.getByTestId('username-input').fill('');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('Username is required to sign up');

    // Username valid
    await page.getByTestId('username-input').fill('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible()
});

test('username-password register | should show error message if password input is invalid', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Password too short
    await page.getByTestId('password-input').getByRole('textbox').fill('asdf');
    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('The password must be at least 8 characters long');

    // Password empty, input dirty
    await page.getByTestId('password-input').getByRole('textbox').fill('');
    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('Password is required to sign up');

    // Password valid
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();
});

test('username-password register | navigate the register form with tab and enter', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.getByTestId('username-input').fill('');
    await page.getByTestId('password-input').getByRole('textbox').fill('');

    await page.getByTestId('username-input').click();
    await expect(page.getByTestId('username-input')).toBeFocused();
    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('username-input').press('Tab');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toBeFocused();
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');

    FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await page.getByTestId('password-input').getByRole('textbox').press('Enter');

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('username-password register | should show error message on required input', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('');
    await page.getByTestId('password-input').getByRole('textbox').fill('');
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible();
    await expect(page.getByTestId('username-error-message')).toContainText('Username is required to sign up');

    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('Password is required to sign up');
    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid username or password. Please try again.');
});

test('username-password register | should show error message on invalid input', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('ab');
    await page.getByTestId('password-input').getByRole('textbox').fill('abcd');
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible();
    await expect(page.getByTestId('username-error-message')).toContainText('he username must be between 4 and 24 characters long');
    await expect(page.getByTestId('username-input')).toHaveValue('ab');

    await expect(page.getByTestId('password-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).toBeVisible();
    await expect(page.getByTestId('password-error-message')).toContainText('The password must be at least 8 characters long');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('abcd');

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid username or password. Please try again.');
});

test('username-password register | should show internal error message on register failure', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('ValidPass123!');

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('username-password register | should revert back to login, if cancel button is clicked', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('otherValidUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('OtherValidPass123!');
    await page.getByTestId('cancel-register-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your credentials to access your account.');

    await expect(page.getByTestId('username-input')).toHaveValue('otherValidUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('OtherValidPass123!');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    await expect(page.getByTestId('login-button')).toBeVisible();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);

    await expect(page.getByTestId('cancel-register-button').getByRole('button')).not.toBeVisible();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeVisible();

    await expect(page.getByTestId('form-error-message')).not.toBeVisible();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).not.toBeDisabled();
});

test('username-password register | button should be loading, other methods still disabled during register', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 10_000);
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-loading/);
    await expect(page.getByTestId('register-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).toBeDisabled();
});

test('username-password register | back to login, other methods not disabled anymore after register', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('otherValidUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('OtherValidPass123!');
    FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 1_000);
    await page.getByTestId('register-button').getByRole('button').click();

    await new Promise((resolve) => setTimeout(resolve, 1_500));

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your credentials to access your account.');

    await expect(page.getByTestId('username-input')).toHaveValue('otherValidUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('OtherValidPass123!');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    await expect(page.getByTestId('login-button')).toBeVisible();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);

    await expect(page.getByTestId('cancel-register-button').getByRole('button')).not.toBeVisible();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeVisible();

    await expect(page.getByTestId('form-error-message')).not.toBeVisible();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).not.toBeDisabled();
});

test('username-password register | should clear errors after successful register', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page.getByTestId('login-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('');
    await page.getByTestId('password-input').getByRole('textbox').fill('');
    await page.getByTestId('register-button').getByRole('button').click();

    await page.getByTestId('username-input').fill('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser);
    await page.getByTestId('register-button').getByRole('button').click();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeVisible();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
});

test('third-party login | should clear username-password error messages', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('login-button').getByRole('button', { name: 'Sign in' }).click();

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-dirty/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-dirty/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
});

test('third-party login | username-password form should be leaved as is', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('ValidPass123!');
});

test('third-party login | should display a error message if popup is closed', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.close();
    await new Promise((resolve) => setTimeout(resolve, 10000));

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('google-error-message')).toBeVisible();
    await expect(page.getByTestId('google-error-message')).toContainText('Google sign in was cancelled. Please try again.');
});

test('third-party login | should display a error message if internal error occurred', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('google-error-message')).toBeVisible();
    await expect(page.getByTestId('google-error-message')).toContainText('An internal error occurred with Google sign in. Please try again later.');
});

test('third-party login | button should be loading, other methods disabled during login', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 10_000);
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(page.getByTestId('login-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toHaveClass(/p-button-loading/);
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).toBeDisabled();

});

test('third-party login | button should not be loading, other methods not disabled anymore after login', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 1_000);
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await new Promise((resolve) => setTimeout(resolve, 1_500));

    await expect(page.getByTestId('login-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toHaveClass(/p-button-loading/);
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).not.toBeDisabled();
});

test('third-party login | should clear errors after successful login', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('login-button').getByRole('button').click();

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-dirty/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-dirty/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');

    const page2Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page2 = await page2Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page2.getByRole('button', { name: 'Add new account' }).click();
    await page2.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser);
    await page2.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');
    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('ValidPass123!');

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('google-error-message')).not.toBeVisible();
});

test('third-party register | password input should be cleared and hidden, username input should be leaved as is', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('abcd');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(page.getByTestId('password-input')).not.toBeVisible();
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('username-input')).toHaveValue('validUser');

    FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await page.getByTestId('register-button').getByRole('button').click();

    expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('third-party register | should leave username, cancel and register button enabled', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(page.getByTestId('sign-in-title')).toContainText('Create Account');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Choose a username to create your account.');

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await expect(page.getByTestId('login-button')).not.toBeVisible();

    await expect(page.getByTestId('cancel-register-button').getByRole('button')).toBeVisible();
    await expect(page.getByTestId('cancel-register-button').getByRole('button')).not.toBeDisabled();

    await expect(page.getByTestId('register-button').getByRole('button')).toBeVisible();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toHaveClass(/p-button-danger/);

    await expect(page.getByTestId('form-error-message')).not.toBeVisible();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).toBeDisabled();
});

test('third-party register | should show error message if username input is invalid', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Username too short
    await page.getByTestId('username-input').fill('ab');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username must be between 4 and 24 characters long');

    // Username with invalid characters
    await page.getByTestId('username-input').fill('invalid*user');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username can only contain letters, numbers, dots (.), hyphens (-), and underscores (_)');

    // Username starting with special character
    await page.getByTestId('username-input').fill('.invaliduser');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username cannot start and end with a special character (., -, _)');

    // Username with consecutive special characters
    await page.getByTestId('username-input').fill('invalid__user');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('The username cannot contain consecutive special characters (., -, _)');

    // Username empty, input dirty
    await page.getByTestId('username-input').fill('');
    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible()
    await expect(page.getByTestId('username-error-message')).toContainText('Username is required to sign up');

    // Username valid
    await page.getByTestId('username-input').fill('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible()
});

test('third-party register | navigate the register form with tab and enter', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').click();
    await expect(page.getByTestId('username-input')).toBeFocused();
    await page.getByTestId('username-input').fill('validUser');
    FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await page.getByTestId('username-input').press('Enter');

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('third-party register | should show error message on required input', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('');
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible();
    await expect(page.getByTestId('username-error-message')).toContainText('Username is required to sign up');

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid username. Please try again.');
});

test('third-party register | should show error message on invalid input', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('ab');
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).toBeVisible();
    await expect(page.getByTestId('username-error-message')).toContainText('he username must be between 4 and 24 characters long');
    await expect(page.getByTestId('username-input')).toHaveValue('ab');

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid username. Please try again.');
});

test('third-party register | should show internal error message on register failure', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('validUser');
    FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('username-input')).toHaveValue('validUser');

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('third-party register | should revert back to login, if cancel button is clicked', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    await page.getByTestId('username-input').fill('validUser');
    await page.getByTestId('password-input').getByRole('textbox').fill('ValidPass123!');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('otherValidUser');
    await page.getByTestId('cancel-register-button').getByRole('button').click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your credentials to access your account.');

    await expect(page.getByTestId('username-input')).toHaveValue('otherValidUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-dirty/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    await expect(page.getByTestId('login-button')).toBeVisible();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);

    await expect(page.getByTestId('cancel-register-button').getByRole('button')).not.toBeVisible();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeVisible();

    await expect(page.getByTestId('form-error-message')).not.toBeVisible();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).not.toBeDisabled();
});

test('third-party register | button should be loading, other methods still disabled during register', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('validUser');
    FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 10_000);
    await page.getByTestId('register-button').getByRole('button').click();

    await expect(page.getByTestId('register-button').getByRole('button')).toHaveClass(/p-button-loading/);
    await expect(page.getByTestId('register-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).toBeDisabled();
});

test('third-party register | back to login, other methods not disabled anymore after register', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('otherValidUser');
    FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 1_000);
    await page.getByTestId('register-button').getByRole('button').click();

    await new Promise((resolve) => setTimeout(resolve, 1_500));

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your credentials to access your account.');

    await expect(page.getByTestId('username-input')).toHaveValue('otherValidUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    await expect(page.getByTestId('password-input').getByRole('textbox')).toHaveValue('');
    await expect(page.getByTestId('password-input')).not.toHaveClass(/ng-dirty/);
    await expect(page.getByTestId('password-error-message')).not.toBeVisible();

    await expect(page.getByTestId('login-button')).toBeVisible();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);

    await expect(page.getByTestId('cancel-register-button').getByRole('button')).not.toBeVisible();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeVisible();

    await expect(page.getByTestId('form-error-message')).not.toBeVisible();

    await expect(page.getByTestId('google-sign-in-button').getByRole('button')).not.toBeDisabled();
    await expect(page.getByTestId('apple-sign-in-button').getByRole('button')).not.toBeDisabled();
});

test('third-party register | should clear errors after successful register', async ({ page }) => {
    await page.goto('http://localhost:4200/sign-in');

    const page1Promise = page.waitForEvent('popup');
    await page.getByTestId('google-sign-in-button').getByRole('button').click();
    const page1 = await page1Promise;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page1.getByRole('button', { name: 'Add new account' }).click();
    await page1.getByRole('button', { name: 'Auto-generate user information' }).click();
    FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await page.getByTestId('username-input').fill('');
    await page.getByTestId('register-button').getByRole('button').click();

    await page.getByTestId('username-input').fill('validUser');
    await expect(page.getByTestId('username-input')).not.toHaveClass(/ng-invalid/);
    await expect(page.getByTestId('username-error-message')).not.toBeVisible();

    FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser);
    await page.getByTestId('register-button').getByRole('button').click();
    await expect(page.getByTestId('register-button').getByRole('button')).not.toBeVisible();
    await expect(page.getByTestId('login-button').getByRole('button')).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
});
