<template>
    <Dialog v-model:visible="dialogVisible" modal :style="{ width: '90vw', maxWidth: '800px' }"
        :header="props.isCreateMode ? $t('tests.single.createQuestion') : $t('tests.single.editQuestion')" 
        :closable="true" @hide="onDialogHide" maximizable>

        <div class="p-fluid">
            <!-- Question Form -->
            <div class="mb-6">

                <!-- Question Text -->
                <div class="field mb-4">
                    <label for="questionText" class="block text-900 font-medium mb-2">
                        {{ $t('tests.single.questionText') }} <span class="text-red-500">*</span>
                    </label>
                    <Textarea id="questionText" v-model="formData.question.text"
                        :placeholder="$t('tests.single.questionTextPlaceholder')" size="small" rows="3" class="w-full"
                        :class="{ 'p-invalid': errors.questionText }" />
                    <small v-if="errors.questionText" class="p-error">{{ errors.questionText }}</small>
                </div>

                <div class="flex flex-col lg:flex-row gap-4 w-full">
                    <!-- Points -->
                    <div class="field mb-4">
                        <label for="questionPoints" class="block text-900 font-medium mb-2">
                            {{ $t('tests.single.points') }}
                        </label>
                        <InputNumber id="questionPoints" v-model="formData.question.points"
                            :placeholder="$t('tests.single.pointsPlaceholder')" :min="0" :max="100" class="w-full" />
                    </div>

                    <!-- Image URL (if exists in schema) -->
                    <div class="field mb-4 w-full">
                        <label for="questionImage" class="block text-900 font-medium mb-2">
                            {{ $t('tests.single.imageUrl') }}
                        </label>
                        <InputText id="questionImage" v-model="formData.question.image_url"
                            :placeholder="$t('tests.single.imageUrlPlaceholder')" class="w-full" />
                    </div>
                </div>
            </div>

            <!-- Answers Section -->
            <div class="mb-6">
                <div class="flex justify-between items-center mb-3">
                    <div class="text-lg font-semibold">{{ $t('tests.single.answers') }}</div>
                    <Button :label="$t('tests.single.addAnswer')" icon="pi pi-plus" @click="addAnswer" size="small"
                        class="p-button-sm" />
                </div>

                <div class="space-y-3">
                    <div v-for="(answer, index) in formData.answers" :key="answer.id || `new-${index}`"
                        class="p-3 border border-surface-200 rounded-lg ">
                        <!-- Answer Header -->
                        <div class="flex justify-between items-center mb-2">
                            <div class="text-sm font-medium text-600">
                                {{ $t('tests.single.answerNumber', { number: index + 1 }) }}
                            </div>
                            <Button icon="pi pi-trash" @click="removeAnswer(index)" size="small" severity="danger" text
                                v-tooltip.top="$t('tests.single.removeAnswer')"
                                :disabled="formData.answers.length <= 1" />
                        </div>

                        <!-- Answer Text -->
                        <div class="field mb-3">
                            <Textarea :id="`answerText-${index}`" v-model="answer.text"
                                :placeholder="$t('tests.single.answerTextPlaceholder')" size="small" rows="2" class="w-full"
                                :class="{ 'p-invalid': errors[`answer-${index}`] }" />
                            <small v-if="errors[`answer-${index}`]" class="p-error">{{ errors[`answer-${index}`]
                                }}</small>
                        </div>

                        <!-- Is Correct Checkbox -->
                        <div class="field-checkbox">
                            <Checkbox :inputId="`answerCorrect-${index}`" v-model="answer.is_correct" :binary="true"
                                @change="onCorrectAnswerChange(index)" />
                            <label :for="`answerCorrect-${index}`" class="ml-2 cursor-pointer">
                                {{ $t('tests.single.correctAnswer') }}
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Validation message for answers -->
                <small v-if="errors.answers" class="p-error">{{ errors.answers }}</small>
            </div>
        </div>

        <!-- Dialog Footer -->
        <template #footer>
            <div class="flex gap-2">
                <Button :label="$t('common.cancel')" icon="pi pi-times" @click="closeDialog" severity="secondary"
                    outlined />
                <Button :label="props.isCreateMode ? $t('common.create') : $t('common.update')" 
                    icon="pi pi-check" @click="saveQuestion" :loading="saving" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import type { QuestionResource, QuestionUpdateRequest } from '~/types/questions'
import type { AnswerResource, AnswerRequest, AnswerUpdateRequest } from '~/types/answers'
import { useQuestionsStore } from '~/store/questions'
import { useAnswersStore } from '~/store/answers'

// Props
interface Props {
    visible: boolean
    question: QuestionResource | null
    testId?: string
    isCreateMode?: boolean
}

// Emits
interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const toast = useToast()
const { contentLanguageId } = useAppSettings()

// Stores
const questionsStore = useQuestionsStore()
const answersStore = useAnswersStore()

// Reactive data
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const saving = ref(false)
const originalAnswers = ref<AnswerResource[]>([])

const formData = ref({
    question: {
        text: '',
        points: 0,
        image_url: ''
    } as Partial<QuestionResource>,
    answers: [] as Array<Partial<AnswerResource> & { id?: string }>
})

const errors = ref<Record<string, string>>({})

// Helper function to convert language code to ID
const getActualLanguageId = async (codeOrId: string): Promise<string> => {
    if (codeOrId.includes('-')) {
        const { loadLanguages } = useCachedLanguages()
        const languages = await loadLanguages()
        const language = languages.find(lang => lang.code === codeOrId)
        return language?.id || codeOrId
    }
    return codeOrId
}

// Methods
const resetForm = () => {
    formData.value = {
        question: {
            text: '',
            points: 0,
            image_url: ''
        },
        answers: []
    }
    errors.value = {}
    originalAnswers.value = []
}

const loadQuestionData = async () => {
    if (props.isCreateMode) {
        // For create mode, initialize with empty data
        resetForm()
        addAnswer() // Add one default answer
        return
    }

    if (!props.question) return

    // Load question data for edit mode
    formData.value.question = {
        text: props.question.text,
        points: props.question.points || 0,
        image_url: props.question.image_url || ''
    }

    // Load answers for this question
    try {
        const languageId = await getActualLanguageId(contentLanguageId.value)

        const response = await answersStore.getAnswers({
            question_uid: props.question.uid,
            language_id: languageId,
            per_page: 100 // Load all answers
        })

        originalAnswers.value = [...answersStore.items]
        formData.value.answers = answersStore.items.map(answer => ({
            id: answer.id,
            text: answer.text,
            is_correct: answer.is_correct || false,
            uid: answer.uid
        }))

        // Ensure at least one answer exists
        if (formData.value.answers.length === 0) {
            addAnswer()
        }
    } catch (error) {
        console.error('Error loading answers:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('tests.single.answersLoadError'),
            life: 3000
        })
    }
}

const addAnswer = () => {
    formData.value.answers.push({
        text: '',
        is_correct: false
    })
}

const removeAnswer = (index: number) => {
    if (formData.value.answers.length > 1) {
        formData.value.answers.splice(index, 1)
    }
}

const onCorrectAnswerChange = (changedIndex: number) => {
    // Allow multiple correct answers - no need to uncheck others
    // This function is kept for potential future logic if needed
}

const validateForm = (): boolean => {
    errors.value = {}
    let hasErrors = false

    // Validate question text
    if (!formData.value.question.text?.trim()) {
        errors.value.questionText = t('tests.validation.questionTextRequired')
        hasErrors = true
    }

    // Validate answers
    let hasCorrectAnswer = false
    formData.value.answers.forEach((answer, index) => {
        if (!answer.text?.trim()) {
            errors.value[`answer-${index}`] = t('tests.validation.answerTextRequired')
            hasErrors = true
        }
        if (answer.is_correct) {
            hasCorrectAnswer = true
        }
    })

    if (!hasCorrectAnswer) {
        errors.value.answers = t('tests.validation.correctAnswerRequired')
        hasErrors = true
    }

    return !hasErrors
}

const saveQuestion = async () => {
    if (!validateForm()) return
    
    if (!props.isCreateMode && !props.question) return
    if (props.isCreateMode && !props.testId) return

    saving.value = true

    try {
        let questionUid: string
        const languageId = await getActualLanguageId(contentLanguageId.value)

        if (props.isCreateMode) {
            // Create new question
            const questionCreate = {
                text: formData.value.question.text!,
                points: formData.value.question.points || 0,
                image_url: formData.value.question.image_url || null,
                language_id: languageId,
                test_uid: props.testId!
            }

            const newQuestion = await questionsStore.createQuestion(questionCreate)
            questionUid = newQuestion.uid
        } else {
            // Update existing question
            const questionUpdate: QuestionUpdateRequest = {
                text: formData.value.question.text!,
                points: formData.value.question.points || 0,
                image_url: formData.value.question.image_url || null
            }

            await questionsStore.updateQuestion(props.question!.id, questionUpdate)
            questionUid = props.question!.uid
        }

        // Handle answers
        if (props.isCreateMode) {
            // Create all answers for new question
            for (const answer of formData.value.answers) {
                const createData: AnswerRequest = {
                    text: answer.text!,
                    is_correct: answer.is_correct || false,
                    language_id: languageId,
                    question_uid: questionUid
                }
                await answersStore.createAnswer(createData)
            }
        } else {
            // Update mode - handle existing answers
            const currentAnswerIds = new Set(formData.value.answers.filter(a => a.id).map(a => a.id!))

            // Delete removed answers
            for (const originalAnswer of originalAnswers.value) {
                if (!currentAnswerIds.has(originalAnswer.id)) {
                    await answersStore.deleteAnswer(originalAnswer.id)
                }
            }

            // Update or create answers
            for (const answer of formData.value.answers) {
                if (answer.id) {
                    // Update existing answer
                    const updateData: AnswerUpdateRequest = {
                        text: answer.text!,
                        is_correct: answer.is_correct || false
                    }
                    await answersStore.updateAnswer(answer.id, updateData)
                } else {
                    // Create new answer
                    const createData: AnswerRequest = {
                        text: answer.text!,
                        is_correct: answer.is_correct || false,
                        language_id: languageId,
                        question_uid: questionUid
                    }
                    await answersStore.createAnswer(createData)
                }
            }
        }

        toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: props.isCreateMode ? t('tests.single.questionCreated') : t('tests.single.questionUpdated'),
            life: 3000
        })

        emit('saved')
        closeDialog()
    } catch (error) {
        console.error('Error saving question:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: props.isCreateMode ? t('tests.single.questionCreateError') : t('tests.single.questionUpdateError'),
            life: 3000
        })
    } finally {
        saving.value = false
    }
}

const closeDialog = () => {
    dialogVisible.value = false
}

const onDialogHide = () => {
    resetForm()
}

// Watchers
watch(() => props.visible, (newValue) => {
    if (newValue) {
        loadQuestionData()
    }
})
</script>