import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoutineView from '../components/RoutineView';
import { ApiService } from '../../exercises/services/api';
import type { DailyRoutine } from '../types/routine';
import type { Exercise } from '../../exercises/types/exercise';

// Mock del ApiService
jest.mock('../../exercises/services/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock del Modal
jest.mock('../../shared/components/Modal', () => {
  return function MockModal({ isOpen, children, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  };
});

const mockExercise: Exercise = {
  id: '1',
  name: 'Press de banca',
  description: 'Ejercicio para pecho y tríceps',
  category: 'strength',
  difficulty: 'intermediate',
  muscleGroups: ['Pecho', 'Tríceps'],
  equipment: ['Barra', 'Banco'],
  instructions: [
    'Acuéstate en el banco',
    'Agarra la barra con las manos',
    'Baja la barra al pecho',
    'Empuja hacia arriba'
  ],
  estimatedDuration: 30,
  calories: 150
};

const mockRoutine: DailyRoutine = {
  id: '1',
  name: 'Rutina de pecho',
  description: 'Rutina enfocada en el desarrollo del pecho',
  routineDate: new Date('2024-01-15'),
  intensity: 'medium',
  status: 'pending',
  estimatedDurationMinutes: 60,
  routineExercises: [
    {
      id: '1',
      exercise: {
        id: '1',
        name: 'Press de banca',
        description: 'Ejercicio para pecho y tríceps',
        category: 'strength',
        difficulty: 'intermediate',
        muscleGroups: ['Pecho', 'Tríceps'],
        equipment: ['Barra', 'Banco'],
        instructions: ['Instrucción 1', 'Instrucción 2']
      },
      orderInRoutine: 1,
      sets: 3,
      reps: 10,
      weight: 80,
      restSeconds: 60
    }
  ]
};

describe('RoutineView - Exercise Detail Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render exercise name as clickable', () => {
    render(<RoutineView routine={mockRoutine} />);
    
    const exerciseButton = screen.getByText('Press de banca');
    expect(exerciseButton).toBeInTheDocument();
    expect(exerciseButton.closest('button')).toBeInTheDocument();
  });

  it('should show "Ver detalles" text on hover', () => {
    render(<RoutineView routine={mockRoutine} />);
    
    const detailsText = screen.getByText('👁️ Ver detalles');
    expect(detailsText).toBeInTheDocument();
  });

  it('should open modal when exercise is clicked', async () => {
    mockApiService.getExercise.mockResolvedValue(mockExercise);
    
    render(<RoutineView routine={mockRoutine} />);
    
    const exerciseButton = screen.getByText('Press de banca').closest('button');
    fireEvent.click(exerciseButton!);

    await waitFor(() => {
      expect(mockApiService.getExercise).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching exercise details', async () => {
    // Simular una respuesta lenta
    mockApiService.getExercise.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockExercise), 100))
    );
    
    render(<RoutineView routine={mockRoutine} />);
    
    const exerciseButton = screen.getByText('Press de banca').closest('button');
    fireEvent.click(exerciseButton!);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });
  });

  it('should handle error when fetching exercise details', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApiService.getExercise.mockRejectedValue(new Error('Network error'));
    
    render(<RoutineView routine={mockRoutine} />);
    
    const exerciseButton = screen.getByText('Press de banca').closest('button');
    fireEvent.click(exerciseButton!);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading exercise details:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should close modal when close button is clicked', async () => {
    mockApiService.getExercise.mockResolvedValue(mockExercise);
    
    render(<RoutineView routine={mockRoutine} />);
    
    // Abrir modal
    const exerciseButton = screen.getByText('Press de banca').closest('button');
    fireEvent.click(exerciseButton!);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Cerrar modal (simulando click en backdrop)
    const modal = screen.getByTestId('modal');
    fireEvent.click(modal);

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('should disable button while loading exercise', async () => {
    mockApiService.getExercise.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockExercise), 100))
    );
    
    render(<RoutineView routine={mockRoutine} />);
    
    const exerciseButton = screen.getByText('Press de banca').closest('button');
    fireEvent.click(exerciseButton!);

    expect(exerciseButton).toBeDisabled();
    
    await waitFor(() => {
      expect(exerciseButton).not.toBeDisabled();
    });
  });
});
