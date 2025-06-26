import React from 'react';
import { render } from '@testing-library/react-native';
import { SoilHumidityDial } from '@/components/charts/SoilHumidityDial';

describe('SoilHumidityDial', () => {
  it('should render optimal humidity', () => {
    const { getByText } = render(
      <SoilHumidityDial humidity={50} />
    );

    expect(getByText('Soil Humidity')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('Optimal')).toBeTruthy();
  });

  it('should render too dry state', () => {
    const { getByText } = render(
      <SoilHumidityDial humidity={20} />
    );

    expect(getByText('20%')).toBeTruthy();
    expect(getByText('Too dry')).toBeTruthy();
  });

  it('should render too wet state', () => {
    const { getByText } = render(
      <SoilHumidityDial humidity={80} />
    );

    expect(getByText('80%')).toBeTruthy();
    expect(getByText('Too wet')).toBeTruthy();
  });

  it('should render no data state', () => {
    const { getByText } = render(
      <SoilHumidityDial humidity={null} />
    );

    expect(getByText('—')).toBeTruthy();
    expect(getByText('No data')).toBeTruthy();
  });

  it('should render loading skeleton', () => {
    const { getByText } = render(
      <SoilHumidityDial humidity={null} loading={true} />
    );

    expect(getByText('Soil Humidity')).toBeTruthy();
  });

  it('should render error state', () => {
    const { getByText } = render(
      <SoilHumidityDial humidity={null} error={true} />
    );

    expect(getByText('—')).toBeTruthy();
    expect(getByText('Error')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(<SoilHumidityDial humidity={50} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});