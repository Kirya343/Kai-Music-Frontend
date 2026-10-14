# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: track-switch.spec.ts >> switching tracks starts playback of the new track
- Location: tests/e2e/track-switch.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('mini-player').getByRole('button', { name: 'Play Next Track' })

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e6]:
      - img [ref=e7] [cursor=pointer]
      - link "Sign In" [ref=e8] [cursor=pointer]:
        - /url: /login
  - main [ref=e9]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - heading "Welcome to Kai Music" [level=1] [ref=e15]
          - paragraph [ref=e16]: Kai Music connects friends through shared music experiences. Create rooms, listen together, and find new tracks with your community.
        - generic [ref=e17]:
          - heading "Community Buzz" [level=2] [ref=e18]
          - generic [ref=e27]:
            - text: "Currently Listening:"
            - strong [ref=e28]: 0 people
          - generic [ref=e33]:
            - text: "Total Rooms Active:"
            - strong [ref=e34]: "0"
      - generic [ref=e35]:
        - generic [ref=e36]:
          - button "Create New Room" [ref=e37] [cursor=pointer]
          - button "Join a Room" [ref=e44] [cursor=pointer]
        - heading "Public rooms to join" [level=3] [ref=e49]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("switching tracks starts playback of the new track", async ({ page }) => {
  4  |     await page.goto("/room");
  5  | 
  6  |     // TODO: авторизоваться, если это необходимо.
  7  |     // TODO: подключиться к комнате, если это не происходит автоматически.
  8  | 
  9  |     // Выбираем первый трек.
  10 |     await page.getByTestId("mini-player")
  11 |               .getByRole("button", { name: "Play Next Track" })
> 12 |               .click();
     |                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  13 | 
  14 |     const audio = page.locator("audio");
  15 | 
  16 |     await expect(audio).toHaveCount(1);
  17 | 
  18 |     // Ждём начала воспроизведения.
  19 |     await expect.poll(
  20 |         () => audio.evaluate((element: HTMLAudioElement) => ({
  21 |             paused: element.paused,
  22 |             readyState: element.readyState,
  23 |         })),
  24 |         { timeout: 15_000 },
  25 |     ).toMatchObject({
  26 |         paused: false,
  27 |     });
  28 | 
  29 |     // Запоминаем текущее время воспроизведения.
  30 |     await expect.poll(
  31 |         () => audio.evaluate(
  32 |             (element: HTMLAudioElement) => element.currentTime,
  33 |         ),
  34 |         { timeout: 5_000 },
  35 |     ).toBeGreaterThan(0);
  36 | 
  37 |     // Переключаемся на второй трек.
  38 |     await page.getByRole("button", { name: "Play Track B" }).click();
  39 | 
  40 |     // Проверяем, что воспроизведение продолжается.
  41 |     await expect.poll(
  42 |         () => audio.evaluate((element: HTMLAudioElement) => ({
  43 |             paused: element.paused,
  44 |             readyState: element.readyState,
  45 |         })),
  46 |         { timeout: 15_000 },
  47 |     ).toMatchObject({
  48 |         paused: false,
  49 |     });
  50 | 
  51 |     // Проверяем, что время воспроизведения продвигается.
  52 |     const timeAfterSwitch = await audio.evaluate(
  53 |         (element: HTMLAudioElement) => element.currentTime,
  54 |     );
  55 | 
  56 |     await expect.poll(
  57 |         () => audio.evaluate(
  58 |             (element: HTMLAudioElement) => element.currentTime,
  59 |         ),
  60 |         { timeout: 5_000 },
  61 |     ).toBeGreaterThan(timeAfterSwitch);
  62 | });
```