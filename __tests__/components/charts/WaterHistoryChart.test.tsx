import React from 'react';
import { render } from '@testing-library/react-native';
import { WaterHistoryChart } from '@/components/charts/WaterHistoryChart';

const mockData = [
  { date: '2024-01-20', ml: 250 },
  { date: '2024-01-21', ml: 300 },
  { date: '2024-01-22', ml: 200 },
];

describe('WaterHistoryChart', () => {
  it('should render chart with data', () => {
    const { getByText } = render(
      <WaterHistoryChart data={mockData} />
    );

    expect(getByText('Watering History')).toBeTruthy();
    expect(getByText('Total: 750ml over 3 days')).toBeTruthy();
  });

  it('should render loading skeleton', () => {
    const { getByText } = render(
      <WaterHistoryChart data={[]} loading={true} />
    );

    expect(getByText('Watering History')).toBeTruthy();
  });

  it('should render error state', () => {
    const { getByText } = render(
      <WaterHistoryChart data={[]} error={true} />
    );

    expect(getByText('Watering History')).toBeTruthy();
    expect(getByText("Couldn't load analytics")).toBeTruthy();
  });

  it('should render empty state', () => {
    const { getByText } = render(
      <WaterHistoryChart data={[]} />
    );

    expect(getByText('Watering History')).toBeTruthy();
    expect(getByText('No watering records yet')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(<WaterHistoryChart data={mockData} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});