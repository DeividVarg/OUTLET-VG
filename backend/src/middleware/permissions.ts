import { Permission, Role, ROLE_PERMISSIONS } from "../types/permissions";

export const hasPermission = (
  userRole: Role,
  permission: Permission,
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole] ?? [];

  return permissions.includes(permission);
};
