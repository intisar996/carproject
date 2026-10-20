import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/configureStore";
import { homePathForRole } from "../utils/paths";

export default function DashboardRedirect() {
  const user = useAppSelector((state) => state.account.user);
  return <Navigate to={homePathForRole(user?.role)} replace />;
}
