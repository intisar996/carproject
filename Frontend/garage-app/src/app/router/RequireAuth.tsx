import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/configureStore";
import type { Role } from "../models/enums";
import { isTokenExpired } from "../utils/jwt";
import { paths } from "../utils/paths";

interface Props {
  roles?: Role[];
}

export default function RequireAuth({ roles }: Props) {
  const user = useAppSelector((state) => state.account.user);
  const location = useLocation();

  if (!user || isTokenExpired(user.token)) {
    return <Navigate to={paths.login} state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={paths.unauthorized} replace />;
  }

  return <Outlet />;
}
