import type { Meta, StoryObj } from "@storybook/react";
import { SpaceWeatherWidget } from "./space-weather-widget";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { SpaceWeather } from "@/core/spaces/domain/interfaces/space-weather.interface";

const weatherDict = getDictionary("es").spaces.weather;

const mockWeather: SpaceWeather = {
  latitude: 40.4168,
  longitude: -3.7038,
  timezone: "Europe/Madrid",
  daily: Array.from({ length: 7 }, (_, i) => ({
    date: `2026-07-0${i + 1}`,
    temperatureMin: 16 + i,
    temperatureMax: 27 + i,
    precipitationSum: i === 3 ? 3.5 : 0,
    weatherCode: i === 3 ? 61 : 1,
  })),
};

const meta = {
  title: "Spaces/SpaceWeatherWidget",
  component: SpaceWeatherWidget,
  tags: ["autodocs"],
  args: { spaceId: "space-1", weatherDict },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SpaceWeatherWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithForecast: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["space-weather", "space-1"], mockWeather))],
};

export const NoGeolocation: Story = {
  args: { hasGeolocation: false },
};

export const Loading: Story = {
  decorators: [withQueryClient()],
};
