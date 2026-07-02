import type { Meta, StoryObj } from "@storybook/react";
import { DailyTile } from "./daily-tile";
import type { DailyForecast } from "@/core/spaces/domain/interfaces/daily-forecast.interface";

const forecast: DailyForecast = {
  date: "2026-07-02",
  temperatureMin: 18,
  temperatureMax: 29,
  precipitationSum: 0,
  weatherCode: 1,
};

const meta = {
  title: "Spaces/DailyTile",
  component: DailyTile,
  tags: ["autodocs"],
  args: { forecast, temperatureUnit: "°C", precipitationUnit: "mm" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof DailyTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sunny: Story = {};

export const Rainy: Story = {
  args: { forecast: { ...forecast, weatherCode: 63, precipitationSum: 4.2 } },
};
