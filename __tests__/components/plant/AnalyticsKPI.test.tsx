import React from 'react';
import { render } from '@testing-library/react-native';
import { AnalyticsKPI } from '@/components/plant/AnalyticsKPI';
import { Droplets } from 'lucide-react-native';

describe('AnalyticsKPI', () => {
  it('renders correctly with required props', () => {
    const { getByText } = render(
      <AnalyticsKPI
        icon={<Droplets size={16} color="#3DB5FF" />}
        label="Water"
        value="2.5 L"
      />
    );

    expect(getByText('Water')).toBeTruthy();
    expect(getByText('2.5 L')).toBeTruthy();
  });

  it('renders delta value when provided', () => {
    const { getByText } = render(
      <AnalyticsKPI
        icon={<Droplets size={16} color="#3DB5FF" />}
        label="Water"
        value="2.5 L"
        delta="+0.5 L"
      />
    );

    expect(getByText('+0.5 L')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = render(
      <AnalyticsKPI
        icon={<Droplets size={16} color="#3DB5FF" />}
        label="Water"
        value="2.5 L"
        delta="+0.5 L"
      />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});