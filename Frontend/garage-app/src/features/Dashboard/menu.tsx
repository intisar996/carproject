import type { ReactNode } from "react";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import BuildIcon from "@mui/icons-material/Build";
import GarageIcon from "@mui/icons-material/Garage";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Role } from "../../app/models/enums";
import { paths } from "../../app/utils/paths";
import { Assessment, ListAlt, ListAltTwoTone } from "@mui/icons-material";

export interface DashboardMenuItem {
  labelKey: string;
  path: string;
  icon: ReactNode;
  matchPrefix?: boolean;
}

export function menuForRole(role: Role): DashboardMenuItem[] {
  switch (role) {
    case Role.ADMIN:
      return [
        { labelKey: "menu.dashboard", path: paths.adminDashboard, icon: <DashboardIcon /> },
        { labelKey: "menu.registrationDocuments", path: paths.adminDocuments, icon: <DescriptionIcon /> },
        { labelKey: "menu.users", path: paths.adminUsers, icon: <PeopleIcon /> },
        { labelKey: "menu.services", path: paths.adminServices, icon: <BuildIcon />, matchPrefix: true },
        { labelKey: "menu.subscriptionPlans", path: paths.adminSubscriptionPlans, icon: <BuildIcon />, matchPrefix: true },
      ];
    case Role.GARAGE_OWNER:
      return [
        { labelKey: "menu.dashboard", path: paths.ownerDashboard, icon: <DashboardIcon /> },
        { labelKey: "menu.myGarages", path: paths.ownerGarages, icon: <GarageIcon /> },
        { labelKey: "menu.requestGarage", path: paths.ownerRequestGarage, icon: <AddBusinessIcon /> },
        { labelKey: "menu.requestGarageRegisterDoc", path: paths.ownerGaragesrRegisterDocument, icon: <ListAltTwoTone /> },
        {labelKey: "menu.subscriptionPlans",path: paths.ownerSubscriptions,icon: <ListAltTwoTone />,},
         {labelKey: "menu.GarageAddServicePrice",path: paths.ownerServiceOptions,icon: <ListAltTwoTone />,},
         {labelKey: "menu.ownerServiceCustomerRequest",path: paths.ownerServiceCustomerRequest,icon: <ListAltTwoTone />,},
         {labelKey: "menu.technicianTasks",path: paths.ownerTechnicianTasks,icon: <Assessment />,},
      ];
    case Role.TECHNICIAN:
      return [
        { labelKey: "menu.dashboard", path: paths.technicianDashboard, icon: <DashboardIcon /> },
        { labelKey: "menu.Task", path: paths.technicianLocation, icon: <ListAlt /> },
      ];
  }
}
