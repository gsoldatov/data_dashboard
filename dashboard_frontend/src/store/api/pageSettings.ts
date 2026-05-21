import { api } from "./base";
import type { PageSettingsResponse, PageSettingsUpsert } from "@/types";

export const pageSettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPageSettings: builder.query<PageSettingsResponse, string>({
      query: (slug) => `/api/page-settings/${slug}`,
      providesTags: (_result, _error, slug) => [
        { type: "PageSettings", id: slug },
      ],
    }),
    upsertPageSettings: builder.mutation<
      PageSettingsResponse,
      { slug: string; body: PageSettingsUpsert }
    >({
      query: ({ slug, body }) => ({
        url: `/api/page-settings/${slug}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [
        { type: "PageSettings", id: slug },
      ],
    }),
  }),
});

export const { useGetPageSettingsQuery, useUpsertPageSettingsMutation } =
  pageSettingsApi;
