import type { 
  ContentUidResource, 
  ContentUidRequest, 
  ContentUidUpdateRequest,
  ContentUidResponse,
  SingleContentUidResponse 
} from '~/types/content-uids'

export const useContentUidsApi = () => {
  const crudMixin = useCrudMixin<
    ContentUidResource,
    ContentUidRequest,
    ContentUidUpdateRequest,
    ContentUidResponse,
    SingleContentUidResponse
  >('content_uids', ['uid', 'content_type'])

  return {
    getContentUids: crudMixin.getItemsWithSupabase,
    getSingleContentUid: crudMixin.getSingleItem,
    createContentUid: crudMixin.createItem,
    updateContentUid: crudMixin.updateItem,
    deleteContentUid: crudMixin.deleteItem
  }
} 