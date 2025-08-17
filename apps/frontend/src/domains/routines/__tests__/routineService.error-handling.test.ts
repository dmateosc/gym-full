// Test para verificar el manejo de errores en routineService
import { RoutineService } from '../services/routineService';

// Mock global fetch
global.fetch = jest.fn();

describe('RoutineService Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRoutines', () => {
    it('should return empty array when response is 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await RoutineService.getAllRoutines();
      expect(result).toEqual([]);
    });

    it('should return empty array when response is not an array', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'not an array' }),
      });

      const result = await RoutineService.getAllRoutines();
      expect(result).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      const result = await RoutineService.getAllRoutines();
      expect(result).toEqual([]);
    });

    it('should throw error for non-network errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(RoutineService.getAllRoutines()).rejects.toThrow(
        'Error al obtener las rutinas'
      );
    });
  });

  describe('getTodayRoutine', () => {
    it('should return null when response is 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await RoutineService.getTodayRoutine();
      expect(result).toBeNull();
    });

    it('should return null when response is invalid', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const result = await RoutineService.getTodayRoutine();
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      const result = await RoutineService.getTodayRoutine();
      expect(result).toBeNull();
    });
  });

  describe('getRoutineByDate', () => {
    it('should return null when response is 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await RoutineService.getRoutineByDate('2025-08-17');
      expect(result).toBeNull();
    });

    it('should return null when response is invalid', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => 'not an object',
      });

      const result = await RoutineService.getRoutineByDate('2025-08-17');
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      const result = await RoutineService.getRoutineByDate('2025-08-17');
      expect(result).toBeNull();
    });
  });
});
