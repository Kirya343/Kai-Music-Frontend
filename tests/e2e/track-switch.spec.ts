import { test, expect } from "@playwright/test";

test("switching tracks starts playback of the new track", async ({ page }) => {
    await page.goto("/room");

    // TODO: авторизоваться, если это необходимо.
    // TODO: подключиться к комнате, если это не происходит автоматически.

    // Выбираем первый трек.
    await page.getByTestId("mini-player")
              .getByRole("button", { name: "Play Next Track" })
              .click();

    const audio = page.locator("audio");

    await expect(audio).toHaveCount(1);

    // Ждём начала воспроизведения.
    await expect.poll(
        () => audio.evaluate((element: HTMLAudioElement) => ({
            paused: element.paused,
            readyState: element.readyState,
        })),
        { timeout: 15_000 },
    ).toMatchObject({
        paused: false,
    });

    // Запоминаем текущее время воспроизведения.
    await expect.poll(
        () => audio.evaluate(
            (element: HTMLAudioElement) => element.currentTime,
        ),
        { timeout: 5_000 },
    ).toBeGreaterThan(0);

    // Переключаемся на второй трек.
    await page.getByRole("button", { name: "Play Track B" }).click();

    // Проверяем, что воспроизведение продолжается.
    await expect.poll(
        () => audio.evaluate((element: HTMLAudioElement) => ({
            paused: element.paused,
            readyState: element.readyState,
        })),
        { timeout: 15_000 },
    ).toMatchObject({
        paused: false,
    });

    // Проверяем, что время воспроизведения продвигается.
    const timeAfterSwitch = await audio.evaluate(
        (element: HTMLAudioElement) => element.currentTime,
    );

    await expect.poll(
        () => audio.evaluate(
            (element: HTMLAudioElement) => element.currentTime,
        ),
        { timeout: 5_000 },
    ).toBeGreaterThan(timeAfterSwitch);
});