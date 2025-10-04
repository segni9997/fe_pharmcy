# TODO: Add Pagination to Sold Medicines Page

## Completed Tasks
- [x] Updated `src/store/saleApi.ts` to accept pagination params (pageNumber, pageSize) and changed response interface to match the provided JSON structure.
- [x] Created `src/hooks/useQueryParamsState.ts` hook for managing query parameters in URL.
- [x] Created `src/components/ui/pagination.tsx` component for pagination UI.
- [x] Updated `src/pos/sold-medicines.tsx` to use the pagination hook, pass params to API, and include the pagination component below the table.

## Summary
The sold medicines page now supports pagination as per the user's requirements. The API call has been amended to include pagination parameters, and the page uses the provided hook to manage state. A pagination component has been added to the table for navigation.
