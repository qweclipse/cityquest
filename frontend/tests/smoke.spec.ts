import {
  expect,
  test,
  type APIRequestContext,
  type Page,
  type TestInfo,
} from "@playwright/test";

type ApiCollection<T> = {
  data: T[];
};

type ApiMapPlaces<T> = {
  places: T[];
};

type PlaceSummary = {
  description: string;
  id: number;
  name: string;
  short_description: string | null;
  slug: string;
};

type RouteSummary = {
  id: number;
  slug: string;
  title: string;
};

type AuthSession = {
  token: string;
  user: {
    email: string;
    id: number;
    name: string;
  };
};

const apiBaseURL = process.env.CITYQUEST_E2E_API_URL ?? "http://127.0.0.1:8000/api";

test.describe("public beta smoke", () => {
  test("home loads and theme switch works", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();

    const root = page.locator("html");
    const themeButtons = page.locator("button[title]");
    await expect(themeButtons.first()).toBeVisible();

    await themeButtons.nth(1).click();
    await expect(root).toHaveClass(/dark/);

    await themeButtons.first().click();
    await expect(root).toHaveClass(/light/);
  });

  test("collections, places, place detail, and route detail open", async ({ page, request }) => {
    const place = await firstPlace(request);
    const route = await firstRoute(request);

    await page.goto("/collections");
    await expect(page.locator("main")).toBeVisible();

    await page.goto("/places");
    await expect(page.locator("main")).toContainText(place.name);

    await page.goto(`/places/${place.id}`);
    await expect(page.locator("main")).toContainText(place.name);

    await page.goto(`/routes/${route.id}`);
    await expect(page.locator("main")).toContainText(route.title);
  });

  test("place names, descriptions, interests, and route titles follow language", async ({
    page,
    request,
  }) => {
    const place = await placeBySlug(request, "stefan-cel-mare-central-park");
    const route = await routeBySlug(request, "evening-classic");

    await setClientLanguage(page, "en");
    await page.goto("/routes/create");
    await expect(page.locator("main")).toContainText("Architecture");
    await expect(page.locator("main")).toContainText("Food");
    await expect(page.locator("main")).not.toContainText("Архитектура");
    await expect(page.locator("main")).not.toContainText("Еда");

    await page.goto(`/places/${place.id}`);

    await expect(page.locator("main")).toContainText("Stephen the Great Central Park");
    await expect(page.locator("main")).not.toContainText(place.name);
    await expect(page.locator("main")).toContainText(
      "The city's oldest central park with shady alleys.",
    );
    await expect(page.locator("main")).not.toContainText(
      place.short_description ?? place.description,
    );

    await page.goto(`/routes/${route.id}`);
    await expect(page.locator("main")).toContainText("Evening Classic");
    await expect(page.locator("main")).not.toContainText(route.title);
  });

  test("map loads and status/category filters are interactive", async ({ page }) => {
    await page.goto("/map");
    await expect(page.locator("main")).toBeVisible();

    const filterButtons = page.locator("main button[aria-pressed]");
    await expect(filterButtons.first()).toBeVisible();

    if ((await filterButtons.count()) > 1) {
      await filterButtons.nth(1).click();
      await expect(filterButtons.nth(1)).toHaveAttribute("aria-pressed", "true");
    }

    const statusButtons = page.locator("main button[aria-pressed]").filter({
      hasNotText: /^\d/,
    });
    await statusButtons.last().click();
    await expect(statusButtons.last()).toHaveAttribute("aria-pressed", "true");

    await expect(page.locator("main")).toBeVisible();
  });

  test("route creation, random route, login, and register pages load", async ({ page }) => {
    for (const path of ["/routes/create", "/routes/random", "/login", "/register"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("add-place page asks guests to sign in", async ({ page }) => {
    await clearClientSession(page);
    await page.goto("/places/new");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test("admin moderation page is protected for guests", async ({ page }) => {
    await clearClientSession(page);
    await page.goto("/admin/places");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test("authenticated users can complete a route and see it in profile history", async ({
    page,
    request,
  }, testInfo) => {
    const route = await firstRoute(request);
    const session = await registerE2eUser(request, testInfo);

    await authenticateClient(page, session.token);
    await page.goto(`/routes/${route.id}`);

    const progressAction = page.getByTestId("route-progress-action");
    await expect(progressAction).toHaveAttribute("data-status", "idle");

    await progressAction.click();
    await expect(progressAction).toHaveAttribute("data-status", "started");

    await progressAction.click();
    await expect(progressAction).toHaveAttribute("data-status", "completed");
    await expect(progressAction).toBeDisabled();

    await page.goto("/profile");
    await expect(page.locator("main")).toContainText(route.title);

    await page.goto("/history");
    await expect(page.locator("main")).toContainText(route.title);
  });
});

async function registerE2eUser(
  request: APIRequestContext,
  testInfo: TestInfo,
): Promise<AuthSession> {
  const nonce = `${Date.now()}-${testInfo.workerIndex}-${testInfo.retry}`;
  const password = "CityQuest123!";
  const response = await request.post(`${apiBaseURL}/register`, {
    data: {
      device_name: "cityquest-e2e",
      email: `cityquest-e2e-${nonce}@example.test`,
      name: `CityQuest E2E ${nonce}`,
      password,
      password_confirmation: password,
      preferred_language: "en",
      preferred_theme: "light",
    },
  });

  expect(response.status()).toBe(201);

  return (await response.json()) as AuthSession;
}

async function firstPlace(request: APIRequestContext): Promise<PlaceSummary> {
  const response = await request.get(`${apiBaseURL}/places?per_page=1`);
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as ApiCollection<PlaceSummary>;
  expect(body.data.length).toBeGreaterThan(0);

  return body.data[0];
}

async function placeBySlug(
  request: APIRequestContext,
  slug: string,
): Promise<PlaceSummary> {
  const response = await request.get(`${apiBaseURL}/map/places?per_page=500&status_filter=all`);
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as ApiMapPlaces<PlaceSummary>;
  const place = body.places.find((candidate) => candidate.slug === slug);
  expect(place).toBeTruthy();

  return place as PlaceSummary;
}

async function firstRoute(request: APIRequestContext): Promise<RouteSummary> {
  const response = await request.get(`${apiBaseURL}/routes/public?per_page=1`);
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as ApiCollection<RouteSummary>;
  expect(body.data.length).toBeGreaterThan(0);

  return body.data[0];
}

async function routeBySlug(
  request: APIRequestContext,
  slug: string,
): Promise<RouteSummary> {
  const response = await request.get(`${apiBaseURL}/routes/public?per_page=50`);
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as ApiCollection<RouteSummary>;
  const route = body.data.find((candidate) => candidate.slug === slug);
  expect(route).toBeTruthy();

  return route as RouteSummary;
}

async function authenticateClient(page: Page, token: string): Promise<void> {
  await page.addInitScript((authToken) => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem("cityquest.authToken", authToken);
  }, token);
}

async function setClientLanguage(page: Page, language: "en" | "ro" | "ru"): Promise<void> {
  await page.addInitScript((nextLanguage) => {
    window.localStorage.setItem("cityquest.language", nextLanguage);
  }, language);
}

async function clearClientSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}
