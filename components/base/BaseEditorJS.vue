<template>
  <div class="editor-container">
    <div ref="editorRef" class="editor-js-editor"></div>
  </div>
</template>

<script setup lang="ts">
// Import TypeScript interfaces and types
import type { EditorJSData } from '~/types/articles'

interface Props {
  modelValue?: EditorJSData
  placeholder?: string
  readOnly?: boolean
  minHeight?: number
}

// Import libraries and third-party dependencies
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'

// Declare props and emit
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ blocks: [] }),
  placeholder: 'Start writing your article...',
  readOnly: false,
  minHeight: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: EditorJSData]
  'ready': [editor: EditorJS]
  'change': [value: EditorJSData]
}>()

// Variables and reactive data
const editorRef = ref<HTMLElement>()
let editor: EditorJS | null = null
let isInternalChange = false

// Functions and async functions
const initEditor = async () => {
  if (!editorRef.value) return

  editor = new EditorJS({
    holder: editorRef.value,
    placeholder: props.placeholder,
    readOnly: props.readOnly,
    minHeight: props.minHeight,
    data: props.modelValue,
    tools: {
      header: {
        class: Header as any,
        config: {
          placeholder: 'Enter a header',
          levels: [1, 2, 3, 4, 5, 6],
          defaultLevel: 2
        }
      },
      list: {
        class: List as any,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        }
      },
      paragraph: {
        class: Paragraph as any,
        inlineToolbar: true
      },
      quote: {
        class: Quote as any,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: 'Quote\'s author'
        }
      },
      delimiter: Delimiter as any
    },
    onChange: (api: any, event: any) => {
      if (editor) {
        isInternalChange = true
        editor.save().then((outputData: EditorJSData) => {
          emit('update:modelValue', outputData)
          emit('change', outputData)
          // Reset flag after a small delay to allow the watch to process
          nextTick(() => {
            isInternalChange = false
          })
        })
      }
    }
  })

  await editor.isReady
  emit('ready', editor)
}

const save = async (): Promise<EditorJSData | null> => {
  if (editor) {
    return await editor.save()
  }
  return null
}

const clear = async () => {
  if (editor) {
    await editor.clear()
  }
}

const destroy = async () => {
  if (editor) {
    await editor.destroy()
    editor = null
  }
}

// Watchers
watch(() => props.modelValue, async (newValue) => {
  if (editor && newValue && !isInternalChange) {
    await editor.render(newValue)
  }
}, { deep: true })

watch(() => props.readOnly, (newValue) => {
  if (editor) {
    editor.readOnly.toggle(newValue)
  }
})

// defineExpose
defineExpose({
  save,
  clear,
  destroy,
  editor: () => editor
})

// Lifecycle hooks - always at the end
onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  destroy()
})
</script>