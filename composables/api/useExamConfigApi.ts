import type { 
  ExamConfigResource, 
  ExamConfigRequest, 
  ExamConfigUpdateRequest,
  ExamConfigResponse,
  SingleExamConfigResponse 
} from '~/types/exam-config'

export const useExamConfigApi = () => {
  const crudMixin = useCrudMixin<
    ExamConfigResource,
    ExamConfigRequest,
    ExamConfigUpdateRequest,
    ExamConfigResponse,
    SingleExamConfigResponse
  >('exam_config')

  return {
    getExamConfigs: crudMixin.getItemsWithSupabase,
    getSingleExamConfig: crudMixin.getSingleItem,
    createExamConfig: crudMixin.createItem,
    updateExamConfig: crudMixin.updateItem,
    deleteExamConfig: crudMixin.deleteItem
  }
} 