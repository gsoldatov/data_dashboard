import { api } from "./base";

export const pageDataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPageData: builder.query<unknown[], string>({
      query: (slug) => `/api/page-data/${slug}`,
    }),
  }),
});

export const { useGetPageDataQuery } = pageDataApi;
