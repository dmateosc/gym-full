import { UserRole, UserRoleVO } from './user-role.vo';

describe('UserRoleVO', () => {
  it('accepts admin, instructor and user as valid roles', () => {
    expect(() => new UserRoleVO(UserRole.ADMIN)).not.toThrow();
    expect(() => new UserRoleVO(UserRole.INSTRUCTOR)).not.toThrow();
    expect(() => new UserRoleVO(UserRole.USER)).not.toThrow();
  });

  it('rejects unknown role values', () => {
    expect(() => new UserRoleVO('owner')).toThrow(/Rol inválido/);
  });

  describe('predicates', () => {
    it('isAdmin returns true only for admin', () => {
      expect(UserRoleVO.admin().isAdmin()).toBe(true);
      expect(UserRoleVO.instructor().isAdmin()).toBe(false);
      expect(UserRoleVO.user().isAdmin()).toBe(false);
    });

    it('isInstructor returns true only for instructor', () => {
      expect(UserRoleVO.admin().isInstructor()).toBe(false);
      expect(UserRoleVO.instructor().isInstructor()).toBe(true);
      expect(UserRoleVO.user().isInstructor()).toBe(false);
    });

    it('isUser returns true only for user', () => {
      expect(UserRoleVO.admin().isUser()).toBe(false);
      expect(UserRoleVO.instructor().isUser()).toBe(false);
      expect(UserRoleVO.user().isUser()).toBe(true);
    });
  });

  it('equals compares by underlying value', () => {
    expect(UserRoleVO.instructor().equals(UserRoleVO.instructor())).toBe(true);
    expect(UserRoleVO.instructor().equals(UserRoleVO.admin())).toBe(false);
  });

  it('exposes the raw enum value', () => {
    expect(UserRoleVO.instructor().value).toBe(UserRole.INSTRUCTOR);
    expect(UserRoleVO.instructor().toString()).toBe('instructor');
  });
});
