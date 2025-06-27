import type { 
  CategoryResource, 
  CategoryRequest, 
  CategoryUpdateRequest,
  CategoryResponse,
  SingleCategoryResponse 
} from '~/types/categories'
import type { CategoryFilterParams } from '~/types/api'

export const useCategoriesApi = () => {
  const crudMixin = useCrudMixin<
    CategoryResource,
    CategoryRequest,
    CategoryUpdateRequest,
    CategoryResponse,
    SingleCategoryResponse,
    CategoryFilterParams
  >('categories', ['name', 'description'])

  return {
    getCategories: crudMixin.getItems,
    getSingleCategory: crudMixin.getSingleItem,
    createCategory: crudMixin.createItem,
    updateCategory: crudMixin.updateItem,
    deleteCategory: crudMixin.deleteItem
  }
} 