import { Role } from "../models/enums";

export const paths = {
  home: "/",
  login: "/login",
  signup: "/signup",
  registerOwner: "/register",
  verifyEmail: "/verify-email",
  resendVerification: "/resend-verification",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  setPassword: "/set-password",
  unauthorized: "/unauthorized",
  changePassword: "/account/change-password",

  adminDashboard: "/admin/dashboard",
  adminDocuments: "/admin/registration-documents",
  adminUsers: "/admin/users",
  adminServices: "/admin/services",
  adminServiceOptions: (serviceId: number | string) => `/admin/services/${serviceId}/options`,
  adminSubscriptionPlans: "/admin/adminsubscriptionPlans",
  ownerDashboard: "/owner/dashboard",
  ownerGarages: "/owner/garages",
  ownerGaragesrRegisterDocument: "/owner/garages/register-document",
  ownerRequestGarage: "/owner/garages/request",
  ownerSubscriptions: "/owner/garages/subscriptions",
  paymentSuccess: "/owner/garages/payment-success",
  paymentCancel: "/owner/garages/payment-cancel",
  ownerServiceOptions: "/owner/garages/services",
  ownerServiceCustomerRequest: "/owner/garages/serviceRequests",
  ownerTechnicianTasks: "/owner/technician-tasks",

  ownerTechnicians: (garageId: number | string) => `/owner/garages/${garageId}/technicians`,

  technicianDashboard: "/technician/dashboard",
  technicianLocation: "/technician/location",
} as const;

export function homePathForRole(role?: string | null): string {
  switch (role) {
    case Role.ADMIN:
      return paths.adminDashboard;
    case Role.GARAGE_OWNER:
      return paths.ownerDashboard;
    case Role.TECHNICIAN:
      return paths.technicianDashboard;
    default:
      return paths.login;
  }
}
