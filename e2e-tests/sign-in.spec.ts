import { expect, test, type Locator, type Page } from '@playwright/test';
import { NotificationProperties, User } from '@stevenkellner/team-conduct-api';
import { Guid, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunctionsMock } from './FirebaseFunctionsMock';

const signInUrl = 'http://localhost:4200/sign-in';
const dashboardUrl = 'http://localhost:4200/dashboard';
const defaultEmail = 'valid.user@mail.com';
const otherEmail = 'other.valid.user@mail.com';
const defaultPassword = 'ValidPass123!';
const otherPassword = 'OtherValidPass123!';
const wrongPassword = 'IncorrectPass123!';
const defaultFirstName = 'Taylor';
const defaultLastName = 'Jordan';
const otherFirstName = 'Morgan';
const otherLastName = 'Lee';

const defaultUser = new User(
    User.Id.builder.build(Guid.generate().guidString),
    UtcDate.now,
    new User.SignInType.Email('testuser@mail.com'),
    new User.Properties('Test', 'User'),
    new User.Settings(new NotificationProperties())
);

function emailInput(page: Page): Locator {
    return page.getByTestId('email-input');
}

function emailError(page: Page): Locator {
    return page.getByTestId('email-error-message');
}

function passwordInput(page: Page): Locator {
    return page.getByTestId('password-input');
}

function passwordTextbox(page: Page): Locator {
    return passwordInput(page).getByRole('textbox');
}

function passwordError(page: Page): Locator {
    return page.getByTestId('password-error-message');
}

function firstNameInput(page: Page): Locator {
    return page.getByTestId('first-name-input');
}

function firstNameError(page: Page): Locator {
    return page.getByTestId('first-name-error-message');
}

function lastNameInput(page: Page): Locator {
    return page.getByTestId('last-name-input');
}

function lastNameError(page: Page): Locator {
    return page.getByTestId('last-name-error-message');
}

function loginButton(page: Page): Locator {
    return page.getByTestId('login-button').getByRole('button');
}

function registerButton(page: Page): Locator {
    return page.getByTestId('register-button').getByRole('button');
}

function cancelRegisterButton(page: Page): Locator {
    return page.getByTestId('cancel-register-button').getByRole('button');
}

function googleButton(page: Page): Locator {
    return page.getByTestId('google-sign-in-button').getByRole('button');
}

function appleButton(page: Page): Locator {
    return page.getByTestId('apple-sign-in-button').getByRole('button');
}

async function openSignInPage(page: Page): Promise<void> {
    await page.goto(signInUrl);
}

async function waitForUi(page: Page, timeoutMs: number = 500): Promise<void> {
    await page.waitForTimeout(timeoutMs);
}

async function enterEmailPasswordRegisterMode(page: Page): Promise<void> {
    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(defaultPassword);
    await FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await loginButton(page).click();
    await waitForUi(page);
}

async function startGooglePopup(page: Page): Promise<Page> {
    const popupPromise = page.waitForEvent('popup');
    await googleButton(page).click();
    const popup = await popupPromise;

    await waitForUi(page);
    await popup.getByRole('button', { name: 'Add new account' }).click();
    await popup.getByRole('button', { name: 'Auto-generate user information' }).click();

    return popup;
}

async function enterThirdPartyRegisterMode(page: Page): Promise<void> {
    const popup = await startGooglePopup(page);
    await FirebaseFunctionsMock.create(page).user.login.mockFailure('not-found');
    await popup.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await waitForUi(page);
}

async function fillRegisterIdentity(page: Page, firstName: string = defaultFirstName, lastName: string = defaultLastName): Promise<void> {
    await firstNameInput(page).fill(firstName);
    await lastNameInput(page).fill(lastName);
}

test('email-password login | should show error message if email input is invalid', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill('invalid-email');
    await expect(emailInput(page)).toHaveClass(/ng-invalid/);
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Please enter a valid email address');

    await emailInput(page).fill('');
    await expect(emailInput(page)).toHaveClass(/ng-invalid/);
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Email is required to log in');

    await emailInput(page).fill(defaultEmail);
    await expect(emailInput(page)).not.toHaveClass(/ng-invalid/);
    await expect(emailError(page)).not.toBeVisible();
});

test('email-password login | should show error message if password input is invalid', async ({ page }) => {
    await openSignInPage(page);

    await passwordTextbox(page).fill('asdf');
    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('The password must be at least 8 characters long');

    await passwordTextbox(page).fill('');
    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('Password is required to log in');

    await passwordTextbox(page).fill(defaultPassword);
    await expect(passwordInput(page)).not.toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).not.toBeVisible();
});

test('email-password login | navigate the login form with tab and enter', async ({ page }) => {
    await openSignInPage(page);

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your email and password to access your account.');

    await emailInput(page).click();
    await expect(emailInput(page)).toBeFocused();
    await emailInput(page).fill(defaultEmail);
    await emailInput(page).press('Tab');
    await expect(passwordTextbox(page)).toBeFocused();
    await passwordTextbox(page).fill(defaultPassword);

    await FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await passwordTextbox(page).press('Enter');

    await expect(loginButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('email-password login | should show error message on required input', async ({ page }) => {
    await openSignInPage(page);

    await loginButton(page).click();

    await expect(emailInput(page)).toHaveClass(/ng-invalid/);
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Email is required to log in');

    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('Password is required to log in');

    await expect(loginButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid email or password. Please try again.');
});

test('email-password login | should show error message on invalid input', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill('invalid-email');
    await passwordTextbox(page).fill('abcd');
    await loginButton(page).click();

    await expect(emailInput(page)).toHaveClass(/ng-invalid/);
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Please enter a valid email address');
    await expect(emailInput(page)).toHaveValue('invalid-email');

    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('The password must be at least 8 characters long');
    await expect(passwordTextbox(page)).toHaveValue('abcd');

    await expect(loginButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid email or password. Please try again.');
});

test('email-password login | should show internal error message on login failure', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(defaultPassword);

    await FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await loginButton(page).click();

    await expect(emailInput(page)).toHaveValue(defaultEmail);
    await expect(passwordTextbox(page)).toHaveValue(defaultPassword);

    await expect(loginButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('email-password login | should show wrong password error message', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(defaultPassword);
    await FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser);
    await loginButton(page).click();

    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(wrongPassword);
    await loginButton(page).click();

    await expect(emailInput(page)).toHaveValue(defaultEmail);
    await expect(passwordTextbox(page)).toHaveValue(wrongPassword);

    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('The password is incorrect');

    await expect(loginButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Incorrect password for the given email address. Please input the correct password and try again.');
});

test('email-password login | button should be loading, other methods disabled during login', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(defaultPassword);
    await FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 10_000);
    await loginButton(page).click();

    await expect(loginButton(page)).toHaveClass(/p-button-loading/);
    await expect(loginButton(page)).toBeDisabled();
    await expect(googleButton(page)).toBeDisabled();
    await expect(appleButton(page)).toBeDisabled();
});

test('email-password login | should navigate after login', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(defaultPassword);
    await FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 1_000);
    await loginButton(page).click();
    await waitForUi(page);

    await expect(page).toHaveURL(dashboardUrl);
});

test('email-password register | should leave email and password in register form, show name inputs, and enable actions', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await expect(page.getByTestId('sign-in-title')).toContainText('Create Account');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your first name, last name, email, and password to create your account.');

    await expect(firstNameInput(page)).toBeVisible();
    await expect(firstNameInput(page)).toHaveValue('');
    await expect(firstNameError(page)).not.toBeVisible();

    await expect(lastNameInput(page)).toBeVisible();
    await expect(lastNameInput(page)).toHaveValue('');
    await expect(lastNameError(page)).not.toBeVisible();

    await expect(emailInput(page)).toHaveValue(defaultEmail);
    await expect(emailInput(page)).not.toHaveClass(/ng-invalid/);
    await expect(emailError(page)).not.toBeVisible();

    await expect(passwordTextbox(page)).toHaveValue(defaultPassword);
    await expect(passwordInput(page)).not.toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).not.toBeVisible();

    await expect(page.getByTestId('login-button')).not.toBeVisible();
    await expect(cancelRegisterButton(page)).toBeVisible();
    await expect(cancelRegisterButton(page)).not.toBeDisabled();
    await expect(registerButton(page)).toBeVisible();
    await expect(registerButton(page)).not.toBeDisabled();
    await expect(registerButton(page)).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
    await expect(googleButton(page)).toBeDisabled();
    await expect(appleButton(page)).toBeDisabled();
});

test('email-password register | should show error message if email input is invalid', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await emailInput(page).fill('invalid-email');
    await expect(emailInput(page)).toHaveClass(/ng-invalid/);
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Please enter a valid email address');

    await emailInput(page).fill('');
    await expect(emailInput(page)).toHaveClass(/ng-invalid/);
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Email is required to sign up');

    await emailInput(page).fill(defaultEmail);
    await expect(emailInput(page)).not.toHaveClass(/ng-invalid/);
    await expect(emailError(page)).not.toBeVisible();
});

test('email-password register | should show error message if password input is invalid', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await passwordTextbox(page).fill('asdf');
    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('The password must be at least 8 characters long');

    await passwordTextbox(page).fill('');
    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('Password is required to sign up');

    await passwordTextbox(page).fill(defaultPassword);
    await expect(passwordInput(page)).not.toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).not.toBeVisible();
});

test('email-password register | should show required errors for first and last name', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await firstNameInput(page).fill('');
    await lastNameInput(page).fill('');
    await registerButton(page).click();

    await expect(firstNameInput(page)).toHaveClass(/ng-invalid/);
    await expect(firstNameError(page)).toBeVisible();
    await expect(firstNameError(page)).toContainText('Registering requires your first name');

    await expect(lastNameInput(page)).toHaveClass(/ng-invalid/);
    await expect(lastNameError(page)).toBeVisible();
    await expect(lastNameError(page)).toContainText('Registering requires your last name');

    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid email or password. Please try again.');
});

test('email-password register | navigate the register form with tab and enter', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await emailInput(page).fill('');
    await passwordTextbox(page).fill('');

    await firstNameInput(page).click();
    await expect(firstNameInput(page)).toBeFocused();
    await firstNameInput(page).fill(defaultFirstName);
    await firstNameInput(page).press('Tab');
    await expect(lastNameInput(page)).toBeFocused();
    await lastNameInput(page).fill(defaultLastName);
    await lastNameInput(page).press('Tab');
    await expect(emailInput(page)).toBeFocused();
    await emailInput(page).fill(defaultEmail);
    await emailInput(page).press('Tab');
    await expect(passwordTextbox(page)).toBeFocused();
    await passwordTextbox(page).fill(defaultPassword);

    await FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await passwordTextbox(page).press('Enter');

    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('email-password register | should show error message on required input', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await emailInput(page).fill('');
    await passwordTextbox(page).fill('');
    await registerButton(page).click();

    await expect(firstNameError(page)).toBeVisible();
    await expect(firstNameError(page)).toContainText('Registering requires your first name');
    await expect(lastNameError(page)).toBeVisible();
    await expect(lastNameError(page)).toContainText('Registering requires your last name');
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Email is required to sign up');
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('Password is required to sign up');
    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid email or password. Please try again.');
});

test('email-password register | should show error message on invalid input', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await firstNameInput(page).fill(defaultFirstName);
    await lastNameInput(page).fill(defaultLastName);
    await emailInput(page).fill('invalid-email');
    await passwordTextbox(page).fill('abcd');
    await registerButton(page).click();

    await expect(emailInput(page)).toHaveClass(/ng-invalid/);
    await expect(emailError(page)).toBeVisible();
    await expect(emailError(page)).toContainText('Please enter a valid email address');
    await expect(emailInput(page)).toHaveValue('invalid-email');

    await expect(passwordInput(page)).toHaveClass(/ng-invalid/);
    await expect(passwordError(page)).toBeVisible();
    await expect(passwordError(page)).toContainText('The password must be at least 8 characters long');
    await expect(passwordTextbox(page)).toHaveValue('abcd');

    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Invalid email or password. Please try again.');
});

test('email-password register | should show internal error message on register failure', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);
    await fillRegisterIdentity(page);

    await FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await registerButton(page).click();

    await expect(firstNameInput(page)).toHaveValue(defaultFirstName);
    await expect(lastNameInput(page)).toHaveValue(defaultLastName);
    await expect(emailInput(page)).toHaveValue(defaultEmail);
    await expect(passwordTextbox(page)).toHaveValue(defaultPassword);

    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('email-password register | should revert back to login if cancel button is clicked', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await fillRegisterIdentity(page, otherFirstName, otherLastName);
    await emailInput(page).fill(otherEmail);
    await passwordTextbox(page).fill(otherPassword);
    await cancelRegisterButton(page).click();
    await waitForUi(page);

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your email and password to access your account.');

    await expect(firstNameInput(page)).not.toBeVisible();
    await expect(lastNameInput(page)).not.toBeVisible();
    await expect(emailInput(page)).toHaveValue(otherEmail);
    await expect(emailError(page)).not.toBeVisible();
    await expect(passwordTextbox(page)).toHaveValue(otherPassword);
    await expect(passwordError(page)).not.toBeVisible();
    await expect(loginButton(page)).toBeVisible();
    await expect(loginButton(page)).not.toBeDisabled();
    await expect(loginButton(page)).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('cancel-register-button')).not.toBeVisible();
    await expect(page.getByTestId('register-button')).not.toBeVisible();
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
    await expect(googleButton(page)).not.toBeDisabled();
    await expect(appleButton(page)).not.toBeDisabled();
});

test('email-password register | button should be loading, other methods still disabled during register', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);
    await fillRegisterIdentity(page);

    await FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 10_000);
    await registerButton(page).click();

    await expect(registerButton(page)).toHaveClass(/p-button-loading/);
    await expect(registerButton(page)).toBeDisabled();
    await expect(googleButton(page)).toBeDisabled();
    await expect(appleButton(page)).toBeDisabled();
});

test('email-password register | should navigate after register', async ({ page }) => {
    await openSignInPage(page);
    await enterEmailPasswordRegisterMode(page);

    await fillRegisterIdentity(page, otherFirstName, otherLastName);
    await emailInput(page).fill(otherEmail);
    await passwordTextbox(page).fill(otherPassword);
    await FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 1_000);
    await registerButton(page).click();
    await waitForUi(page);

    await expect(page).toHaveURL(dashboardUrl);
});

test('third-party login | should clear email-password error messages', async ({ page }) => {
    await openSignInPage(page);

    await loginButton(page).click();

    const popup = await startGooglePopup(page);
    await FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await popup.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(emailInput(page)).not.toHaveClass(/ng-dirty/);
    await expect(emailError(page)).not.toBeVisible();
    await expect(passwordInput(page)).not.toHaveClass(/ng-dirty/);
    await expect(passwordError(page)).not.toBeVisible();
    await expect(loginButton(page)).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
});

test('third-party login | email-password form should be left as is', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(defaultPassword);

    const popup = await startGooglePopup(page);
    await FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await popup.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(emailInput(page)).toHaveValue(defaultEmail);
    await expect(passwordTextbox(page)).toHaveValue(defaultPassword);
});

test('third-party login | should display an error message if popup is closed', async ({ page }) => {
    await openSignInPage(page);

    const popupPromise = page.waitForEvent('popup');
    await googleButton(page).click();
    const popup = await popupPromise;
    await waitForUi(page);
    await popup.close();
    await waitForUi(page, 10_000);

    await expect(googleButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('google-error-message')).toBeVisible();
    await expect(page.getByTestId('google-error-message')).toContainText('Google sign in was cancelled. Please try again.');
});

test('third-party login | should display an error message if internal error occurred', async ({ page }) => {
    await openSignInPage(page);

    const popup = await startGooglePopup(page);
    await FirebaseFunctionsMock.create(page).user.login.mockFailure('internal');
    await popup.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(googleButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('google-error-message')).toBeVisible();
    await expect(page.getByTestId('google-error-message')).toContainText('An internal error occurred with Google sign in. Please try again later.');
});

test('third-party login | button should be loading, other methods disabled during login', async ({ page }) => {
    await openSignInPage(page);

    const popup = await startGooglePopup(page);
    await FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 10_000);
    await popup.getByRole('button', { name: 'Sign in with Google.com' }).click();

    await expect(loginButton(page)).toBeDisabled();
    await expect(googleButton(page)).toHaveClass(/p-button-loading/);
    await expect(googleButton(page)).toBeDisabled();
    await expect(appleButton(page)).toBeDisabled();
});

test('third-party login | should navigate after login', async ({ page }) => {
    await openSignInPage(page);

    const popup = await startGooglePopup(page);
    await FirebaseFunctionsMock.create(page).user.login.mockSuccess(defaultUser, 1_000);
    await popup.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await waitForUi(page);

    await expect(page).toHaveURL(dashboardUrl);
});

test('third-party register | should hide password and email inputs and show first and last name inputs', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill('abcd');
    await enterThirdPartyRegisterMode(page);

    await expect(page.getByTestId('sign-in-title')).toContainText('Create Account');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your first name and last name to create your account.');
    await expect(passwordInput(page)).not.toBeVisible();
    await expect(emailInput(page)).not.toBeVisible();
    await expect(firstNameInput(page)).toBeVisible();
    await expect(lastNameInput(page)).toBeVisible();
});

test('third-party register | should leave name inputs empty and keep register actions enabled', async ({ page }) => {
    await openSignInPage(page);
    await enterThirdPartyRegisterMode(page);

    await expect(page.getByTestId('sign-in-title')).toContainText('Create Account');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your first name and last name to create your account.');

    await expect(firstNameInput(page)).toHaveValue('');
    await expect(firstNameError(page)).not.toBeVisible();
    await expect(lastNameInput(page)).toHaveValue('');
    await expect(lastNameError(page)).not.toBeVisible();

    await expect(page.getByTestId('login-button')).not.toBeVisible();
    await expect(cancelRegisterButton(page)).toBeVisible();
    await expect(cancelRegisterButton(page)).not.toBeDisabled();
    await expect(registerButton(page)).toBeVisible();
    await expect(registerButton(page)).not.toBeDisabled();
    await expect(registerButton(page)).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
    await expect(googleButton(page)).toBeDisabled();
    await expect(appleButton(page)).toBeDisabled();
});

test('third-party register | should show error message on required input', async ({ page }) => {
    await openSignInPage(page);
    await enterThirdPartyRegisterMode(page);

    await registerButton(page).click();

    await expect(firstNameInput(page)).toHaveClass(/ng-invalid/);
    await expect(firstNameError(page)).toBeVisible();
    await expect(firstNameError(page)).toContainText('Registering requires your first name');

    await expect(lastNameInput(page)).toHaveClass(/ng-invalid/);
    await expect(lastNameError(page)).toBeVisible();
    await expect(lastNameError(page)).toContainText('Registering requires your last name');

    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('Please check the highlighted fields and try again.');
});

test('third-party register | navigate the register form with tab and enter', async ({ page }) => {
    await openSignInPage(page);
    await enterThirdPartyRegisterMode(page);

    await firstNameInput(page).click();
    await expect(firstNameInput(page)).toBeFocused();
    await firstNameInput(page).fill(defaultFirstName);
    await firstNameInput(page).press('Tab');
    await expect(lastNameInput(page)).toBeFocused();
    await lastNameInput(page).fill(defaultLastName);

    await FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await lastNameInput(page).press('Enter');

    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('third-party register | should show internal error message on register failure', async ({ page }) => {
    await openSignInPage(page);
    await enterThirdPartyRegisterMode(page);
    await fillRegisterIdentity(page);

    await FirebaseFunctionsMock.create(page).user.register.mockFailure('internal');
    await registerButton(page).click();

    await expect(firstNameInput(page)).toHaveValue(defaultFirstName);
    await expect(lastNameInput(page)).toHaveValue(defaultLastName);
    await expect(registerButton(page)).toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('form-error-message')).toBeVisible();
    await expect(page.getByTestId('form-error-message')).toContainText('An internal error occurred. Please try again later.');
});

test('third-party register | should revert back to login if cancel button is clicked', async ({ page }) => {
    await openSignInPage(page);

    await emailInput(page).fill(defaultEmail);
    await passwordTextbox(page).fill(defaultPassword);
    await enterThirdPartyRegisterMode(page);

    await fillRegisterIdentity(page, otherFirstName, otherLastName);
    await cancelRegisterButton(page).click();
    await waitForUi(page);

    await expect(page.getByTestId('sign-in-title')).toContainText('Sign In');
    await expect(page.getByTestId('sign-in-instruction')).toContainText('Enter your email and password to access your account.');

    await expect(firstNameInput(page)).not.toBeVisible();
    await expect(lastNameInput(page)).not.toBeVisible();
    await expect(emailInput(page)).toHaveValue(defaultEmail);
    await expect(emailError(page)).not.toBeVisible();
    await expect(passwordTextbox(page)).toHaveValue('');
    await expect(passwordInput(page)).not.toHaveClass(/ng-dirty/);
    await expect(passwordError(page)).not.toBeVisible();
    await expect(loginButton(page)).toBeVisible();
    await expect(loginButton(page)).not.toBeDisabled();
    await expect(loginButton(page)).not.toHaveClass(/p-button-danger/);
    await expect(page.getByTestId('cancel-register-button')).not.toBeVisible();
    await expect(page.getByTestId('register-button')).not.toBeVisible();
    await expect(page.getByTestId('form-error-message')).not.toBeVisible();
    await expect(googleButton(page)).not.toBeDisabled();
    await expect(appleButton(page)).not.toBeDisabled();
});

test('third-party register | button should be loading, other methods still disabled during register', async ({ page }) => {
    await openSignInPage(page);
    await enterThirdPartyRegisterMode(page);
    await fillRegisterIdentity(page);

    await FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 10_000);
    await registerButton(page).click();

    await expect(registerButton(page)).toHaveClass(/p-button-loading/);
    await expect(registerButton(page)).toBeDisabled();
    await expect(googleButton(page)).toBeDisabled();
    await expect(appleButton(page)).toBeDisabled();
});

test('third-party register | should navigate after register', async ({ page }) => {
    await openSignInPage(page);
    await enterThirdPartyRegisterMode(page);

    await fillRegisterIdentity(page, otherFirstName, otherLastName);
    await FirebaseFunctionsMock.create(page).user.register.mockSuccess(defaultUser, 1_000);
    await registerButton(page).click();
    await waitForUi(page);

    await expect(page).toHaveURL(dashboardUrl);
});
