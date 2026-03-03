export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export function getPagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10)));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
