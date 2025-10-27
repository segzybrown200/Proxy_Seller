import { getCategory, getDashboardStats, getListings, getOrders, getVendor } from "api/api"
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
    
    return {
        categories: data?.data || [],
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