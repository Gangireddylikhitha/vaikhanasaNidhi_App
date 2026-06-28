export const ADMIN_QUERY_KEYS = {
  scriptures: ['admin', 'scriptures'],
  categories: ['admin', 'categories'],
  dashboard: ['admin', 'dashboard'],
};

export function invalidateAdminQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['admin'] });
  queryClient.invalidateQueries({ queryKey: ['scriptures', 'public'] });
  queryClient.invalidateQueries({ queryKey: ['subcategories', 'public'] });
}
