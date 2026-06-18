import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SpaceWeather } from '@/core/spaces/domain/interfaces/space-weather.interface';
import { SpaceWeatherWidget } from './space-weather-widget.component';

const mockUseSpaceWeather = vi.fn();

vi.mock('@/core/spaces/presentation/hooks/use-space-weather/use-space-weather.hook', () => ({
  useSpaceWeather: (...args: unknown[]) => mockUseSpaceWeather(...args),
}));

const weatherDict = {
  title: 'Weather',
  forecast: '7-day forecast',
  temperatureUnit: '°C',
  precipitationUnit: 'mm',
  setLocationForWeather: 'Set a location in space settings to see the weather forecast.',
  loading: 'Loading weather...',
  error: 'Could not load weather data. Please try again later.',
  noData: 'No weather data available for this location.',
};

const mockWeather: SpaceWeather = {
  latitude: 40.4,
  longitude: -3.7,
  timezone: 'Europe/Madrid',
  daily: [
    {
      date: '2026-06-18',
      temperatureMin: 15.4,
      temperatureMax: 28.6,
      precipitationSum: 2.5,
      weatherCode: 0,
    },
    {
      date: '2026-06-19',
      temperatureMin: 14,
      temperatureMax: 25,
      precipitationSum: 0,
      weatherCode: 999,
    },
  ],
};

describe('SpaceWeatherWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows set location prompt when hasGeolocation is false', () => {
    mockUseSpaceWeather.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    render(
      <SpaceWeatherWidget spaceId="space-1" hasGeolocation={false} weatherDict={weatherDict} />,
    );

    expect(screen.getByText(weatherDict.setLocationForWeather)).toBeInTheDocument();
    expect(mockUseSpaceWeather).toHaveBeenCalledWith(null);
  });

  it('shows loading skeletons when fetching weather', () => {
    mockUseSpaceWeather.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { container } = render(
      <SpaceWeatherWidget spaceId="space-1" weatherDict={weatherDict} />,
    );

    expect(screen.getByText(weatherDict.title)).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(7);
  });

  it('shows error message when fetch fails', () => {
    mockUseSpaceWeather.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<SpaceWeatherWidget spaceId="space-1" weatherDict={weatherDict} />);

    expect(screen.getByText(weatherDict.error)).toBeInTheDocument();
  });

  it('shows no data message when weather is null', () => {
    mockUseSpaceWeather.mockReturnValue({ data: null, isLoading: false, isError: false });

    render(<SpaceWeatherWidget spaceId="space-1" weatherDict={weatherDict} />);

    expect(screen.getByText(weatherDict.noData)).toBeInTheDocument();
  });

  it('shows no data message when daily forecast is empty', () => {
    mockUseSpaceWeather.mockReturnValue({
      data: { ...mockWeather, daily: [] },
      isLoading: false,
      isError: false,
    });

    render(<SpaceWeatherWidget spaceId="space-1" weatherDict={weatherDict} />);

    expect(screen.getByText(weatherDict.noData)).toBeInTheDocument();
  });

  it('renders forecast tiles with rounded temperatures and timezone', () => {
    mockUseSpaceWeather.mockReturnValue({ data: mockWeather, isLoading: false, isError: false });

    render(<SpaceWeatherWidget spaceId="space-1" weatherDict={weatherDict} />);

    expect(screen.getByText(`${weatherDict.forecast} · ${mockWeather.timezone}`)).toBeInTheDocument();
    expect(screen.getByText('15°C / 29°C')).toBeInTheDocument();
    expect(screen.getByText('2.5 mm')).toBeInTheDocument();
    expect(screen.getByLabelText('Weather code 0')).toHaveTextContent('☀️');
    expect(screen.getByLabelText('Weather code 999')).toHaveTextContent('🌡️');
  });
});
