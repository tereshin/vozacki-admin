// Base EditorJS types
declare global {
  namespace EditorJS {
    interface OutputData {
      time?: number
      blocks: OutputBlockData[]
      version?: string
    }

    interface OutputBlockData {
      id?: string
      type: string
      data: any
    }

    interface BlockTool {
      new (params: { data?: any; api?: any; config?: any }): any
    }
  }
}

declare module '@editorjs/marker' {
  import { BlockTool } from '@editorjs/editorjs'
  
  export default class Marker extends BlockTool {
    constructor({ data, api, config }: any)
  }
}

declare module '@editorjs/checklist' {
  import { BlockTool } from '@editorjs/editorjs'
  
  export default class Checklist extends BlockTool {
    constructor({ data, api, config }: any)
  }
}

declare module '@editorjs/link' {
  import { BlockTool } from '@editorjs/editorjs'
  
  export default class LinkTool extends BlockTool {
    constructor({ data, api, config }: any)
  }
}

export {} 