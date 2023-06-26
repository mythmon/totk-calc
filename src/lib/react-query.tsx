'use client';

import type { ComponentWithChildren } from "@/components/component";
import {
  QueryClient,
  QueryClientProvider as RealQueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

export const QueryClientProvider: ComponentWithChildren = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <RealQueryClientProvider client={queryClient}>
      {children}
    </RealQueryClientProvider>
  );
};

interface GetPatchQueryResult<T> {
  data: null | T;
  isFetched: boolean;
  mutate: (patch: Partial<T>) => Promise<T>;
}

interface UseGetPatchClientArgs {
  endpoint: string;
  enabled?: boolean;
}

export function useGetPatchQuery<T>({
  endpoint,
  enabled,
}: UseGetPatchClientArgs): GetPatchQueryResult<T> {
  const queryClient = useQueryClient();
  const queryKey = ["useGetPatch", endpoint];

  const query = useQuery<T>({
    queryKey,
    enabled: enabled !== false,
    queryFn: () => fetch(endpoint).then((res) => res.json()),
  });

  const mutation = useMutation<T, unknown, Partial<T>>({
    async mutationFn(patch) {
      const res = await fetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const newData = await res.json();
      return newData;
    },

    async onMutate(patch): Promise<{ previousData: T | undefined }> {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);
      queryClient.setQueryData<T>(queryKey, (old) => ({
        ...(old as T),
        ...patch,
      }));
      return { previousData }; // context for onError
    },

    onError(_error, _variables, context) {
      const ctx = context as { previousData: [QueryKey, T | undefined] };
      const d = ctx?.previousData;
      if (d) queryClient.setQueryData(d[0], d[1]);
    },

    // onError(_error, _patch, context: { previousData: [QueryKey, T] }) {
    // }
  });

  return {
    data: query.data ?? null,
    isFetched: query.isFetched,
    mutate: mutation.mutateAsync,
  };
}
