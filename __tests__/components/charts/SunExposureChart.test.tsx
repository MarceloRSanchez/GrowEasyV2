import React from 'react';
import { render } from '@testing-library/react-native';
import { SunExposureChart } from '@/components/charts/SunExposureChart';

const mockData = [
  { date: '2024-01-20', hours: 6.5 },
  { date: '2024-01-21', hours: 7.2 },
  { date: '2024-01-22', hours: 5.8 },
];

describe('SunExposureChart', () => {
  it('should render chart with data', () => {
    const { getByText } = render(
      <SunExposureChart data={mockData} />
    );

    expect(getByText('Sun Exposure')).toBeTruthy();
    expect(getByText('Average: 6.5 hours/day over 3 days')).toBeTruthy();
  });

  it('should render loading skeleton', () => {
    const { getByText } = render(
      <SunExposureChart data={[]} loading={true} />
    );

    expect(getByText('Sun Exposure')).toBeTruthy();
  });

  it('should render error state', () => {
    const { getByText } = render(
      <SunExposureChart data={[]} error={true} />
    );

    expect(getByText('Sun Exposure')).toBeTruthy();
    expect(getByText("Couldn't load analytics")).toBeTruthy();
  });

  it('should render empty state', () => {
    const { getByText } = render(
      <SunExposureChart data={[]} />
    );

    expect(getByText('Sun Exposure')).toBeTruthy();
    expect(getByText('No sun exposure data yet')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(<SunExposureChart data={mockData} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});