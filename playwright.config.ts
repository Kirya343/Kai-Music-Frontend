import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",

    use: {
        baseURL: "http://localhost:30000",
        ...devices["Desktop Chrome"],
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    reporter: "list",
});