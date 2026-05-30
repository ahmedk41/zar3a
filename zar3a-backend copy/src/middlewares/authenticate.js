// src/middlewares/authenticate.js
import { User } from "../models/index.js";
import { decodeAccessToken } from "../utils/auth.js";

const authenticate = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const payload = decodeAccessToken(authHeader.split(" ")[1]);

  if (!payload || payload.type !== "access")
    return res.status(401).json({ message: "Invalid or expired token" });

  const user = await User.findByPk(Number(payload.sub));

  if (!user || !user.isActive)
    return res.status(401).json({ message: "User not found or inactive" });

  const approvalRequiredRoles = ['FARMER', 'SUPPLIER', 'AGRO_EXPERT'];
  const hasApprovalRole = approvalRequiredRoles.includes(user.role) || approvalRequiredRoles.includes(user.pendingRole);

  if (user.role !== 'ADMIN' && hasApprovalRole && !user.isApproved)
    return res.status(403).json({ message: "Account pending approval" });

  req.user = user;
  next();
};

export default authenticate;
