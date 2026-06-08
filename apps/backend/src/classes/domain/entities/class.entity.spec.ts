import { ClassEntity } from './class.entity';
import { ClassCategory } from '../value-objects/class-category.vo';

const baseProps = () => ({
  id: '00000000-0000-0000-0000-000000000001',
  instructorId: '00000000-0000-0000-0000-000000000099',
  name: 'Spinning matutino',
  category: ClassCategory.CYCLING,
  dayOfWeek: 1,
  startTime: '07:30',
  durationMin: 45,
  capacity: 20,
});

describe('ClassEntity', () => {
  describe('construction', () => {
    it('builds with valid props and defaults active=true', () => {
      const c = new ClassEntity(baseProps());
      expect(c.name).toBe('Spinning matutino');
      expect(c.active).toBe(true);
      expect(c.description).toBeNull();
    });

    it('trims name and description', () => {
      const c = new ClassEntity({
        ...baseProps(),
        name: '  Yoga  ',
        description: '  zen  ',
      });
      expect(c.name).toBe('Yoga');
      expect(c.description).toBe('zen');
    });

    it.each(['', '   '])('rejects empty name (%p)', (name) => {
      expect(() => new ClassEntity({ ...baseProps(), name })).toThrow(/nombre/);
    });

    it.each([['unknown' as never]])('rejects unknown category', (category) => {
      expect(() => new ClassEntity({ ...baseProps(), category })).toThrow(
        /Categoría/,
      );
    });

    it.each([-1, 7])('rejects dayOfWeek out of range (%p)', (dayOfWeek) => {
      expect(() => new ClassEntity({ ...baseProps(), dayOfWeek })).toThrow(
        /dayOfWeek/,
      );
    });

    it.each(['25:00', '07:60', '7:30', 'foo'])(
      'rejects invalid startTime (%p)',
      (startTime) => {
        expect(() => new ClassEntity({ ...baseProps(), startTime })).toThrow(
          /startTime/,
        );
      },
    );

    it.each([0, -5, 700])(
      'rejects out-of-range durationMin (%p)',
      (durationMin) => {
        expect(() => new ClassEntity({ ...baseProps(), durationMin })).toThrow(
          /durationMin/,
        );
      },
    );

    it.each([0, 1500])('rejects out-of-range capacity (%p)', (capacity) => {
      expect(() => new ClassEntity({ ...baseProps(), capacity })).toThrow(
        /capacity/,
      );
    });
  });

  describe('mutations', () => {
    it('rename updates name and touches updatedAt', () => {
      const c = new ClassEntity({ ...baseProps(), updatedAt: new Date(0) });
      const before = c.updatedAt;
      c.rename('Spinning intenso');
      expect(c.name).toBe('Spinning intenso');
      expect(c.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it('changeSchedule validates fields', () => {
      const c = new ClassEntity(baseProps());
      c.changeSchedule(2, '18:00', 60);
      expect(c.dayOfWeek).toBe(2);
      expect(c.startTime).toBe('18:00');
      expect(c.durationMin).toBe(60);
      expect(() => c.changeSchedule(9, '18:00', 60)).toThrow();
      expect(() => c.changeSchedule(2, '24:01', 60)).toThrow();
    });

    it('deactivate/activate toggle and isActive reflects state', () => {
      const c = new ClassEntity(baseProps());
      expect(c.isActive()).toBe(true);
      c.deactivate();
      expect(c.isActive()).toBe(false);
      c.activate();
      expect(c.isActive()).toBe(true);
    });

    it('belongsTo checks ownership', () => {
      const c = new ClassEntity(baseProps());
      expect(c.belongsTo(baseProps().instructorId)).toBe(true);
      expect(c.belongsTo('someone-else')).toBe(false);
    });
  });
});
