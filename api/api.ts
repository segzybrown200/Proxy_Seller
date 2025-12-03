// api.ts
import axios from "axios";

const API_URL = "https://proxy-backend-6of2.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};


export const createSeller = async(data: { email: string; password: string, name: string, phone:string }) => {
  return api.post("/auth/register-vendor", data).catch((error) => {
    throw error.response?.data || error;
  });

}
export const UploadKYC = async(data: FormData, token: string) => {
  return api.post("/kyc/submit", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  }).catch((error) => {
    throw error.response?.data || error;
  });
}
export const loginSeller = async(data: { email: string; password: string }) => {
  return api.post("/auth/login-vendor", data).catch((error) => {
    throw error.response?.data || error;
  });
}
export const forgotPassword = async(data:{email:string}) => {
  return api.post("/auth/forgot-password", data ).catch((error) => {
    throw error.response?.data || error;
  });
}

export const resetPassword = async(data:{email:string, otp:string, newPassword:string}) => {
  return api.post("/auth/reset-password", data ).catch((error) => {
    throw error.response?.data || error;
  });
}
export const resendOTPEmail = async(data:{email:string}) => {
  return api.post("/auth/resend-reset-otp",  data ).catch((error) => {
    throw error.response?.data || error;
  });
}
export const getUserAuth = async(token:string) => {
  return api.get(`/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).catch((error) => {
    throw error.response?.data || error;
  });
}

export const markMessagesAsRead = async(senderId: string, token: string) => {
  return api.post("/messages/read", { senderId }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).catch((error) => {
    throw error.response?.data || error;
  });
}

export const sendOTPEmail = async(data:{email:string, phone: string, verifyOption: string}) => {
  return api.post("/auth/send-otp",  data ).catch((error) => {
    throw error.response?.data || error;
  });
}

export const verifyOTP = async(data:{email:string, phone:string, otp:string}) => {
  return api.post("/auth/verify-otp", data).catch((error) => {
    throw error.response?.data || error;
  });
}

export const createListing = async(data: FormData, token: string) => {
  return api.post("/listings/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }}).catch((error) => {
    throw error.response?.data || error;
  });
  
}
export const vendorAddress = async(data: { address: string, lat:number, lng:number, city:string, country:string, userId:string }) => {
  return api.post("/vendor/add-location", data).catch((error) => {
    throw error.response?.data || error;
  });
}
export const getCategory = async() => {
  return api.get("/admin/get-category").catch((error) => {
    throw error.response?.data || error;
  });
}

export const getListings = async(token: string) => {
  return api.get("/listings/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
        }}).catch((error) => {
    throw error.response?.data || error;
  });
}
export const getDashboardStats = async(token: string) => {
  return api.get("/vendor/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        }}).catch((error) => {
    throw error.response?.data || error;
  });
}
export const getVendor = async(id:string, token:string) => {
  return api.get(`/vendor/get-vendor/${id}`,
        {
        headers: {
          Authorization: `Bearer ${token}`,
        }}
  ).catch((error) => {
    throw error.response?.data || error;
  })
}
export const getListingById = async(id:string, token:string) => {
  return api.get(`/listings/get-vendor/${id}`,
        {
        headers: {
          Authorization: `Bearer ${token}`,
        }}
  ).catch((error) => {
    throw error.response?.data || error;
  })
}

export const getAllMessages = async(token:string) => {
  return api.get(`/messages/messages/chats`,
        {
        headers: {
          Authorization: `Bearer ${token}`,
        }}
  ).catch((error) => {
    throw error.response?.data || error;
  })
}
export const getOrders = async(token:string) => {
  return api.get(`/vendor/orders`,
        {
        headers: {
          Authorization: `Bearer ${token}`,
        }}
  ).catch((error) => {
    throw error.response?.data || error;
  })
}
export const getConversions = async(otherUserId:string, token:string) => {
  return api.get(`/messages/${otherUserId}`,{
     headers: {
          Authorization: `Bearer ${token}`,
        }
  }).catch((error) => {
    throw error.response?.data || error;
  });
}
export const updateListing = async (id:string, data:any, token:string) => {
  return await api.put(`/listings/update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  }).catch((error) => {
    throw error.response?.data || error;
  });
};
export const pushOrderRider = async (id:string, token:string) => {
  return await axios.post(`/vendor/push-order-to-rider/${id}`,  {
    headers: {
      Authorization: `Bearer ${token}`
    },
  }).catch((error) => {
    console.log(error)
    throw error.response?.data || error;
  });
};

export const updateVendor = async(data: {name?: string, email?: string, phone?: string}, token: string) => {
  return api.put('/vendor/update', data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).catch((error) => {
    throw error.response?.data || error;
  });
}