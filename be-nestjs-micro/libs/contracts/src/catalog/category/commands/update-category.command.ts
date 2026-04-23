export interface UpdateCategoryCommand {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}
