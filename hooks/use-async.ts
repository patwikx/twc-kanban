import { useState, useCallback } from "react";
import { AppError, handleError } from "@/lib/utils/error";
import { toast } from "@/components/ui/use-toast";

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage,
  } = options;

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        
        if (showSuccessToast) {
          toast({
            title: "Success",
            description: successMessage || "Operation completed successfully",
          });
        }
        
        onSuccess?.(result);
        return result;
      } catch (e) {
        const appError = handleError(e);
        setError(appError);
        
        if (showErrorToast) {
          toast({
            title: "Error",
            description: appError.message,
            variant: "destructive",
          });
        }
        
        onError?.(appError);
        throw appError;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage]
  );

  return {
    execute,
    loading,
    error,
    data,
    setData,
    reset: useCallback(() => {
      setData(null);
      setError(null);
      setLoading(false);
    }, []),
  };
}