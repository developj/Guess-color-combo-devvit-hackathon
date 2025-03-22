import { useState } from "@devvit/public-api";

export function usePaginator<T>(data: T[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = data.length === 0 ? 1 : Math.ceil(data.length / pageSize);

  const getCurrentPageData = (): T[] => {
    if (data.length === 0) return [];
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));
  const reset = () => setCurrentPage(1);

  return { currentPageData: getCurrentPageData(), currentPage, totalPages, nextPage, prevPage, goToPage, reset };
}
