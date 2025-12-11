import { getAllMessages, getBanks, getCategory, getConversions, getDashboardStats, getListings, getOrders, getVendor, getVendorBankDetails, getVendorWallet } from "api/api"
import useSWR  from "swr"
import { SWRConfiguration } from "swr"

// Persistent cache provider using localStorage
const localStorageProvider = (): Map<string, any> => {
  // When initializing, we restore the data from localStorage into a map.
  const map = new Map<string, any>(JSON.parse(localStorage.getItem('app-cache') || '[]'));
  // Before unloading the app, we write back all the data into localStorage.
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem('app-cache', appCache);
  });
  return map;
};

export function useCategory() {
    const fetcher = getCategory;
    const swrConfig: SWRConfiguration = {
        revalidateOnFocus: false,
        provider: typeof window !== 'undefined' ? localStorageProvider : undefined,
    };
    const { data, error, isLoading, mutate } = useSWR("/admin/get-category", fetcher, swrConfig);
  // Normalize categories to always be an array. Backend may return different shapes.
  const raw = data?.data;
  let categories: any[] = [];
  if (Array.isArray(raw)) categories = raw;
  else if (raw && Array.isArray(raw.categories)) categories = raw.categories;
  else if (raw && Array.isArray(raw.data)) categories = raw.data;

  return {
    // Keep backward-compatible shape (some components expect `categories.categories`)
    categories: { categories: categories || [] },
    // Also expose a flat array for components that expect an array
    categoriesList: categories || [],
    isLoading,
    isError: error,
    mutate,
  };
}
export const useListings = (token:string)=>{
    const fetcher = (token:string) => getListings(token);
    
    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/listings/vendor` : null,
    ()=>fetcher(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateOnMount: true, // Ensure it fetches when the component 
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
    return {
        listings: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };

}
export const useDashboardStats = (token:string)=>{
    const fetcher = (token:string) => getDashboardStats(token);

    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/vendor/dashboard` : null,
    ()=>fetcher(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateOnMount: true, // Ensure it fetches when the component 
    }
  );
    return {
        dashboard: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };

}
export const useMessages = (token:string)=>{
    const fetcher = (token:string) => getAllMessages(token);

    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/messages/messages/chats` : null,
    ()=>fetcher(token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true, // Ensure it fetches when the component 
       refreshInterval: 1000, 
    }
  );
    return {
        messages: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };

}
export const useVendors = (id:string, token:string)=>{
    const fetcher = (id:string, token:string) => getVendor(id,token);

    const { data, error, isLoading ,mutate} = useSWR(
    id ? `/vendor/get-vendor` : null,
    ()=>fetcher(id, token ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateOnMount: true, // Ensure it fetches when the component 
    }
  );
    return {
        profile: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };

}
export const useOrders = (token:string)=>{
    const fetcher = (token:string) => getOrders(token);

    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/vendor/orders` : null,
    ()=>fetcher(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateOnMount: true, // Ensure it fetches when the component 
    }
  );
    return {
        orders: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };

}
export const useGetConversions = (id:string, token:string)=>{
    const fetcher = (id:string, token:string) => getConversions(id,token);
    
    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/messages/${id}` : null,
    ()=>fetcher(id,token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true, // Ensure it fetches when the component 
      refreshInterval: 10000, // Refresh every 30 seconds
    }
  );
    return {
        messages: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };

}

export const useGetBanks = (token:string)=>{
    const fetcher = (token:string) => getBanks(token);
    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/vendor/get-bank` : null,
    ()=>fetcher(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,}
  );
    return {
        banks: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

export const useGetVendorWallet = (token:string)=>{
    const fetcher = (token:string) => getVendorWallet(token);
    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/vendor/get-wallet` : null,
    ()=>fetcher(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,}
  );
    return {
        wallet: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

export const useGetVendorBankDetails = (token:string)=>{
    const fetcher = (token:string) => getVendorBankDetails(token);
    const { data, error, isLoading ,mutate} = useSWR(
    token ? `/vendor/get-vendor-bank-details` : null,
    ()=>fetcher(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,}
  );
    return {
        bankDetails: data?.data || [],
        isLoading,
        isError: error,
        mutate,
    };
}