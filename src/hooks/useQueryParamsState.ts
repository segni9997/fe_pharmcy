import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface UseQueryParamsStateProps {
  defaultSearch?: string;
  defaultStatus?: string;
  defaultPage?: number;
  defaultPageSize?: number;
}

export function useQueryParamsState({
  defaultSearch = "",
  defaultStatus = "",
  defaultPage = 1,
  defaultPageSize = 10,
}: UseQueryParamsStateProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // States that sync with URL
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || defaultSearch
  );

  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: searchParams.get("status") || defaultStatus,
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("pageNumber") || searchParams.get("page");
    return pageParam ? Number(pageParam) : defaultPage;
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const pageSizeParam = searchParams.get("pageSize");
    return pageSizeParam ? Number(pageSizeParam) : defaultPageSize;
  });

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams); // clone existing params

    // Update only the relevant keys
    newParams.set("pageNumber", String(currentPage));
    newParams.set("pageSize", String(itemsPerPage));

    newParams.set("search", searchValue);
    newParams.set("status", filterValues.status);

    setSearchParams(newParams, { replace: true }); // replace avoids pushing new history
  }, [
    searchValue,
    filterValues.status,
    currentPage,
    itemsPerPage,
    searchParams,
    setSearchParams,
  ]);

  return {
    searchValue,
    setSearchValue,
    filterValues,
    setFilterValues,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  };
}
