import { useState } from "react";

export function usePagination(perPage = 12) {
  const [page, setPage] = useState(1);
  return {
    page,
    perPage,
    setPage,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    reset: () => setPage(1),
  };
}
