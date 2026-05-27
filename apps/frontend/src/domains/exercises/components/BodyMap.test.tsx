import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import BodyMap from './BodyMap';

describe('BodyMap', () => {
  it('uses the available back filter option for lower back clicks', () => {
    const onMuscleClick = jest.fn();
    const { container } = render(
      <BodyMap
        availableMuscleGroups={['Dorsales']}
        onMuscleClick={onMuscleClick}
      />
    );

    fireEvent.click(container.querySelector('#lowerback-back')!);

    expect(onMuscleClick).toHaveBeenCalledWith('Dorsales');
  });
});
