import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

import type { ChangePasswordRequest,AdminUser, EmailValidationResponse,LoginRequest,LoginResponse, ResetPasswordRequest, UserRequest,} from "../models/User";

import type { MessageResponse, PageResponse } from "../models/Common";
import type {DecisionRequest,RegistrationDocument,} from "../models/RegistrationDocument";
import type { Garage } from "../models/Garage";
import type {Technician,TechnicianRequest,LocationUpdateRequest,} from "../models/Technician";

import type {ServiceItem,ServiceOption, ServiceOptionRequest, ServiceRequest,} from "../models/Service";

import { clearStoredUser } from "../utils/authStorage";
import type { CreateSubscriptionRequest, SubscriptionPlan } from "../models/Subscription";
import type { GarageServiceOption, GarageServiceOptionRequest } from "../models/GarageServiceOption";
import type { CustomerGarage } from "../models/CustomerGarage";
import type { ServiceCustomerRequest } from "../models/ServiceCustomerRequest";
import type { CustomerTrackingResponse } from "../models/CustomerTrackingResponse";
import type { TechnicianAssignment } from "../models/TechnicianAssignment";
import type { RepairPhoto } from "../models/RepairPhoto";
import type { OwnerTechnicianAssignment } from "../models/OwnerTechnicianAssignment";
import type { OwnerRepairPhoto } from "../models/OwnerRepairPhoto";

axios.defaults.baseURL = "http://localhost:8080/api/";
axios.defaults.withCredentials = false;

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

axios.interceptors.request.use((config) => {
  const userString = localStorage.getItem("user");

  if (userString) {
    try {
      const user = JSON.parse(userString);

      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.error("Failed to read user from localStorage", error);
    }
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredUser();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);


const body = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
  get: <T,>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) =>
    axios
      .get<T>(url, {
        ...config,
        params,
      })
      .then(body),

  post: <T,>(url: string, data?: object) =>
    axios.post<T>(url, data).then(body),

  put: <T,>(url: string, data?: object) =>
    axios.put<T>(url, data).then(body),

  patch: <T,>(url: string, data?: object) =>
    axios.patch<T>(url, data).then(body),

  delete: <T = void,>(url: string) =>
    axios.delete<T>(url).then(body),

  postForm: <T,>(url: string, data: FormData) =>
    axios.post<T>(url, data).then(body),
};

const Account = {
  login: (values: LoginRequest) =>
    requests.post<LoginResponse>("auth/login", values),

  signup: (values: UserRequest) =>
    requests.post<MessageResponse>("auth/signup", values),

  currentUser: () =>
    requests.get<LoginResponse>("auth/current-user"),

  validateEmail: (email: string) =>
    requests.get<EmailValidationResponse>("auth/validate-email", { email }),

  verifyEmail: (token: string) =>
    requests.get<MessageResponse>("auth/verify-email", { token }),

  resendVerification: (email: string) =>
    requests.post<MessageResponse>("auth/resend-verification", { email }),

  forgotPassword: (email: string) =>
    requests.post<MessageResponse>("auth/forget-password", { email }),

  resetPassword: (values: ResetPasswordRequest) =>
    requests.post<MessageResponse>("auth/reset-password", values),

  setPassword: (values: ResetPasswordRequest) =>
    requests.post<MessageResponse>("auth/set-password", values),

  changePassword: (values: ChangePasswordRequest) =>
    requests.post<MessageResponse>("auth/change-password", values),
};

const Registration = {
  registerOwner: (data: FormData) =>
    requests.postForm<MessageResponse>(
      "owner/registration/register-owner",
      data
    ),
};

const Garages = {
  listByOwner: (ownerId: number) =>
    requests.get<Garage[]>(`owner/garages/owner/${ownerId}`),

  listActiveByOwner: (ownerId: number) =>
  requests.get<Garage[]>( `owner/garages/owner/${ownerId}/active`),

  deactivate: (garageId: number) =>requests.patch<MessageResponse>(`owner/garages/${garageId}/deactivate`),

  requestNew: (data: FormData) =>requests.postForm<MessageResponse>( "owner/garages/owner/request-garage", data),
    getRegisterDocumantion:(ownerId: number,page: number, size: number) =>
    requests.get<PageResponse<RegistrationDocument>>(`owner/garages/register-document/${ownerId}`,{ page, size }),

};



const  Subscriptions= {
  checkout: (data: CreateSubscriptionRequest) =>
    requests.post<string>("subscriptions/checkout", data),
};


const SubscriptionPlans = {getActive: () => requests.get<SubscriptionPlan[]>("garage-owner/subscription-plans"),};


const AdminSubscriptionPlans = {
  getAll: () =>requests.get<SubscriptionPlan[]>("admin/subscription-plans"),
  getById: (id: number) =>requests.get<SubscriptionPlan>(`admin/subscription-plans/${id}`),
  create: (data: Omit<SubscriptionPlan, "id" | "active">) => requests.post<SubscriptionPlan>("admin/subscription-plans",data),
  update: (id: number,data: Omit<SubscriptionPlan, "id" | "active">) =>requests.put<SubscriptionPlan>(`admin/subscription-plans/${id}`,data),
changeStatus: (id: number, active: boolean) =>requests.patch<void>(`admin/subscription-plans/${id}/status?active=${active}`),

};




const Technicians = {
  listByGarage: (garageId: number) =>
    requests.get<Technician[]>(`owner/garages/garage/${garageId}`),

  get: (garageId: number, technicianId: number) =>
    requests.get<Technician>(
      `owner/garages/${garageId}/technicians/${technicianId}`
    ),

  create: (garageId: number, values: TechnicianRequest) =>
    requests.post<MessageResponse>(
      `owner/garages/${garageId}/technicians`,
      values
    ),

  activate: (garageId: number, technicianId: number) =>
    requests.put<MessageResponse>(
      `owner/garages/${garageId}/technicians/${technicianId}/activate`
    ),

  deactivate: (garageId: number, technicianId: number) =>
    requests.put<MessageResponse>(
      `owner/garages/${garageId}/technicians/${technicianId}/deactivate`
    ),
};

const Admin = {
  documents: (page: number, size: number) =>
    requests.get<PageResponse<RegistrationDocument>>(
      "admin/registration-documents",
      { page, size }
    ),

  document: (id: number) =>
    requests.get<RegistrationDocument>(
      "admin/registration-documents/getById",
      { Id: id }
    ),

  decide: (id: number, values: DecisionRequest) =>
    requests.post<MessageResponse>(
      `admin/registration-documents/make-decision/${id}`,
      values
    ),

  users: () =>
    requests.get<AdminUser[]>("admin/users"),

  createUser: (values: UserRequest) =>
    requests.post<MessageResponse>("admin", values),
};

const Catalog = {
  services: () =>
    requests.get<ServiceItem[]>("services"),

  service: (serviceId: number) =>
    requests.get<ServiceItem>(`services/${serviceId}`),

  createService: (values: ServiceRequest) =>
    requests.post<ServiceItem>("services", values),

  updateService: (serviceId: number, values: ServiceRequest) =>
    requests.put<ServiceItem>(`services/${serviceId}`, values),

  deleteService: (serviceId: number) =>
    requests.delete(`services/${serviceId}`),

  options: (serviceId: number) =>
    requests.get<ServiceOption[]>(`services/${serviceId}/options`),

  createOption: (serviceId: number, values: ServiceOptionRequest) =>
    requests.post<ServiceOption>(
      `services/${serviceId}/options`,
      values
    ),

  updateOption: (
    serviceId: number,
    optionId: number,
    values: ServiceOptionRequest
  ) =>
    requests.put<ServiceOption>(
      `services/${serviceId}/options/${optionId}`,
      values
    ),

  deleteOption: (serviceId: number, optionId: number) =>
    requests.delete(
      `services/${serviceId}/options/${optionId}`
    ),
  garagesByService: (serviceId: number) => requests.get<CustomerGarage[]>( `/services/${serviceId}/garages`),

};

const Assignments = {
  getMyAssignments: () =>requests.get<TechnicianAssignment[]>("technician/assignments"),

  updateLocation: (assignmentId: number,values: LocationUpdateRequest) =>requests.post<MessageResponse>(`assignments/${assignmentId}/location`,values),

updateStatus: (
  assignmentId: number,
  status: string
) =>
  requests.put<MessageResponse>(
    `assignments/${assignmentId}/status?status=${status}`
  ),


   uploadRepairPhoto: (requestId: number,photoType: "BEFORE" | "DURING" | "AFTER",file: File) => {
    const formData = new FormData();
    formData.append("photoType", photoType);
    formData.append("file", file);
    return requests.post<RepairPhoto>(
      `technician/requests/${requestId}/photos`,
      formData
    );
  },

  getRepairPhotos: (requestId: number) =>requests.get<RepairPhoto[]>(`technician/requests/${requestId}/photos`
    ),


getRepairPhotoImage: (requestId: number, photoId: number) =>
  requests.get<Blob>(
    `technician/requests/${requestId}/photos/${photoId}/image`,
    undefined,
    {
      responseType: "blob",
    }
  ),
};

const GarageServiceOptions = {
  list: (garageId: number) =>
    requests.get<GarageServiceOption[]>(
      `owner/garages/${garageId}/service-options`
    ),

  create: (
    garageId: number,
    values: GarageServiceOptionRequest
  ) =>
    requests.post<MessageResponse>(
      `owner/garages/${garageId}/service-options`,
      values
    ),

  update: (
    garageId: number,
    garageOptionId: number,
    values: GarageServiceOptionRequest
  ) =>
    requests.put<MessageResponse>(
      `owner/garages/${garageId}/service-options/${garageOptionId}`,
      values
    ),
};


const Customer = { createServiceRequest: (values: { garageOptionId: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    carMakeModel: string;
    carPlateNumber: string;
    latitude: number;
    longitude: number;}) =>
    requests.post("customer/service-request",values),
};


const ServiceRequests = 
{
   getOwnerRequests: () => requests.get<ServiceCustomerRequest[]>( "customer/service-request/owner" ), 
   acceptRequest: (requestId: number) => requests.put<ServiceCustomerRequest>( `customer/service-request/owner/${requestId}/accept` ), 
   rejectRequest: (requestId: number,rejectionReason : string) => requests.put<ServiceCustomerRequest>( `customer/service-request/owner/${requestId}/reject`,{rejectionReason} ), 
   getTechnicians: (garageId: number) => requests.get<Technician[]>( `owner/garages/${garageId}/technicians` ), 
   assignTechnician: (requestId: number, technicianId: number) => requests.post( "owner/assignments", { requestId, technicianId, } ), };




const OwnerAssignments = {
  getAssignments: () =>
    requests.get<OwnerTechnicianAssignment[]>("owner/assignments"),

  getRepairPhotos: (requestId: number) =>
    requests.get<OwnerRepairPhoto[]>(
      `owner/requests/${requestId}/photos`
    ),

  getRepairPhotoImage: (requestId: number, photoId: number) =>
    requests.get<Blob>(
      `owner/requests/${requestId}/photos/${photoId}/image`,
      undefined,
      { responseType: "blob" }
    ),
};


const Tracking = {
    getTracking: (trackingToken: string) =>
        requests.get<CustomerTrackingResponse>(
            `tracking/${trackingToken}`
        ),
};


const agent = {
  Account,
  Registration,
  Garages,
  Technicians,
  Admin,
  Catalog,
  Assignments,
  Subscriptions,
  SubscriptionPlans,
  AdminSubscriptionPlans,
  GarageServiceOptions,
  Customer,
  OwnerAssignments,
  ServiceRequests,
  Tracking
};

export default agent;