import { Request, Response, NextFunction } from "express";
import { hasPermission } from "./permissions";
import { Role, Permission, PERMISSIONS } from "../types/permissions";

type Action = "create" | "update" | "delete";
type Resource =
  | "user"
  | "employee"
  | "admin"
  | "superAdmin"
  | "product"
  | "category"
  | "purchase";

const PERMISSION_MAP: Record<
  Resource,
  Partial<Record<Action, Permission[]>>
> = {
  user: {
    create: [PERMISSIONS.CREATE_USER],
    update: [PERMISSIONS.UPDATE_USER],
  },
  employee: {
    create: [PERMISSIONS.CREATE_EMPLOYEE, PERMISSIONS.CREATE_USER],
    update: [PERMISSIONS.UPDATE_EMPLOYEE, PERMISSIONS.UPDATE_USER],
  },
  admin: {
    create: [
      PERMISSIONS.CREATE_ADMIN,
      PERMISSIONS.CREATE_EMPLOYEE,
      PERMISSIONS.CREATE_USER,
    ],
    update: [
      PERMISSIONS.UPDATE_ADMIN,
      PERMISSIONS.UPDATE_USER,
      PERMISSIONS.UPDATE_EMPLOYEE,
    ],
  },
  superAdmin: {
    create: [
      PERMISSIONS.CREATE_SUPER_ADMIN,
      PERMISSIONS.CREATE_ADMIN,
      PERMISSIONS.CREATE_EMPLOYEE,
      PERMISSIONS.CREATE_USER,
    ],
    update: [
      PERMISSIONS.UPDATE_SUPER_ADMIN,
      PERMISSIONS.UPDATE_ADMIN,
      PERMISSIONS.UPDATE_EMPLOYEE,
      PERMISSIONS.UPDATE_USER,
    ],
  },
  product: {
    create: [PERMISSIONS.CREATE_PRODUCT],
    update: [PERMISSIONS.UPDATE_PRODUCT],
    delete: [PERMISSIONS.DELETE_PRODUCT],
  },
  category: {
    create: [PERMISSIONS.CREATE_CATEGORY],
    update: [PERMISSIONS.UPDATE_CATEGORY],
    delete: [PERMISSIONS.DELETE_CATEGORY],
  },
  purchase: {
    update: [PERMISSIONS.UPDATE_PURCHASE],
  },
};

type ResourceResolver = "fromBody" | Resource;

export const authorizeAction = (action: Action, resource: ResourceResolver) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Si el recurso viene del body (caso usuarios)
    const resolvedResource: Resource =
      resource === "fromBody" ? req.body.role : resource;

    if (!resolvedResource) {
      return res.status(400).json({ message: "role is required in body" });
    }

    const resourcePermissions = PERMISSION_MAP[resolvedResource];

    if (!resourcePermissions) {
      return res
        .status(400)
        .json({ message: `Invalid resource: ${resolvedResource}` });
    }

    const requiredPermissions = resourcePermissions[action];

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return res.status(400).json({
        message: `Action "${action}" not allowed on "${resolvedResource}"`,
      });
    }

    const allowed = requiredPermissions.some((permission) =>
      hasPermission(req.user!.role as Role, permission),
    );

    if (!allowed) {
      return res.status(403).json({
        message: `Forbidden: cannot ${action} "${resolvedResource}"`,
      });
    }

    next();
  };
};
