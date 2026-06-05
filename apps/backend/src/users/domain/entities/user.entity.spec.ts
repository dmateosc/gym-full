import { UserEntity } from './user.entity';
import { UserRole } from '../value-objects/user-role.vo';

const baseProps = () => ({
  id: '00000000-0000-0000-0000-000000000001',
  email: 'jane@example.com',
});

describe('UserEntity role transitions', () => {
  it('defaults to user role when none provided', () => {
    const user = new UserEntity(baseProps());
    expect(user.role.value).toBe(UserRole.USER);
    expect(user.isAdmin()).toBe(false);
    expect(user.isInstructor()).toBe(false);
  });

  it('promoteToInstructor flips role and bumps updatedAt', () => {
    const user = new UserEntity({ ...baseProps(), updatedAt: new Date(0) });
    const before = user.updatedAt;

    user.promoteToInstructor();

    expect(user.role.value).toBe(UserRole.INSTRUCTOR);
    expect(user.isInstructor()).toBe(true);
    expect(user.isAdmin()).toBe(false);
    expect(user.updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('demoteToUser returns instructor to user', () => {
    const user = new UserEntity({ ...baseProps(), role: UserRole.INSTRUCTOR });

    user.demoteToUser();

    expect(user.role.value).toBe(UserRole.USER);
    expect(user.isInstructor()).toBe(false);
  });

  it('isInstructor stays false for admin', () => {
    const user = new UserEntity({ ...baseProps(), role: UserRole.ADMIN });
    expect(user.isAdmin()).toBe(true);
    expect(user.isInstructor()).toBe(false);
  });
});
