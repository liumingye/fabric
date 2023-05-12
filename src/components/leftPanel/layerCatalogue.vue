<script setup lang="ts">
  import Tree from '@/components/tree'
  import { useAppStore } from '@/store'
  import type { TreeNodeData, DropPosition } from '@/components/tree'
  import { ActiveSelection, Group, ObjectRef, util } from '@/lib/fabric'
  import { FabricObject } from '@/lib/fabric'
  import { useEditorServices } from '@/core'
  import { useResizeObserver, useThrottleFn } from '@vueuse/core'
  import { SplitInstance } from '@arco-design/web-vue'

  type ITreeNodeData = TreeNodeData & {
    canDragEnter: boolean
    objectRef: ObjectRef
    group?: Group
    children?: ITreeNodeData[]
  }

  const { canvas } = useEditorServices()
  // const { objects } = storeToRefs(useAppStore())

  const searchKey = ref('')

  const treeData = computed(() => {
    return getTreeData(canvas.objects.value, searchKey.value)
  })

  const getTreeData = (objects: FabricObject[], searchKey?: string): ITreeNodeData[] => {
    const objs: ITreeNodeData[] = []
    for (const object of objects) {
      const isCollection = util.isCollection(object)
      const children = isCollection ? getTreeData(object._objects as FabricObject[], searchKey) : []
      const nodeData: ITreeNodeData = {
        group: object.group as Group | undefined,
        objectRef: object.ref,
        canDragEnter: isCollection,
        title: object.name || object.constructor.name,
        key: object.id,
        children,
      }
      if (!searchKey || canAddToResult(nodeData, searchKey)) {
        objs.unshift(nodeData)
      }
    }

    return objs
  }

  const canAddToResult = (object: ITreeNodeData, searchKey: string): boolean => {
    // 广度优先搜索
    const lowerSearchKey = searchKey.toLowerCase()
    const queue = [object]
    let isMatched = false
    while (queue.length > 0) {
      const currentNode = queue.shift()!
      const currentTitle = currentNode.title?.toLowerCase()
      if (currentTitle?.includes(lowerSearchKey)) {
        isMatched = true
      }
      if (currentNode.children) {
        for (const child of currentNode.children) {
          queue.push(child)
        }
      }
      if (isMatched) {
        return true
      }
    }
    return false
  }

  const treeData2 = [
    {
      title: '页面 1',
      key: '0-0',
    },
  ]

  const allowDrop = (options: { dropNode: TreeNodeData }) => {
    return (options.dropNode as ITreeNodeData).canDragEnter
  }

  const onDrop = (data: {
    e: DragEvent
    dragNode: TreeNodeData
    dropNode: TreeNodeData
    dropPosition: DropPosition
  }) => {
    const { dragNode, dropNode, dropPosition } = data as {
      e: DragEvent
      dragNode: ITreeNodeData
      dropNode: ITreeNodeData
      dropPosition: DropPosition
    }
    // todo 多个元素

    let dragIndex = -1
    let dragObject: FabricObject | undefined
    let dropIndex = -1
    let dropObject: FabricObject | undefined

    canvas.forEachObject(function add(obj, index) {
      if (dragObject && dropObject) return
      // 递归子对象
      if (util.isCollection(obj)) {
        obj.forEachObject(add)
      }
      if (obj.id == dragNode.key) {
        dragObject = obj
        dragIndex = index
      } else if (obj.get('id') == dropNode.key) {
        dropObject = obj
        if (dragIndex !== -1 && dragObject?.group === dropObject?.group) {
          dropIndex = index - 1
        } else {
          dropIndex = index
        }
      }
    })

    if (dragIndex >= 0 && dropIndex >= 0 && dragObject && dropObject) {
      const dragGroup = dragObject?.group || canvas
      let dropGroup = dropObject?.group || canvas
      // 进入组
      if (dropPosition === 0) {
        dropGroup = dropObject as Group
        dropIndex = dragGroup._objects.length
      }
      const _dragObject = dragObject
      dragGroup.remove(dragObject)
      dropGroup.insertAt(dropPosition === 1 ? dropIndex : dropIndex + 1, _dragObject)
    }
  }

  const visibleClick = (
    e: Event,
    nodeData: {
      node: ITreeNodeData
    },
  ) => {
    e.stopPropagation()
    nodeData.node.objectRef.visible = !nodeData.node.objectRef.visible
    nodeData.node.group?.updateLayoutStrategy()
    canvas.requestRenderAll()
  }

  const selectedkeys = ref<string[]>([])

  const onSelect = (_selectedKeys: (string | number)[]) => {
    const objects: FabricObject[] = []
    canvas.forEachObject(function add(obj) {
      if (util.isCollection(obj)) {
        obj.forEachObject(add)
      }
      if (_selectedKeys.includes(obj.get('id'))) {
        objects.push(obj as FabricObject)
      }
    })
    if (objects.length === 0) return
    if (objects.length === 1) {
      canvas.setActiveObject(objects[0])
      objects[0].group?.updateLayoutStrategy()
    } else {
      // todo 多选
    }
    canvas.requestRenderAll()
  }

  watch(canvas.activeObject, (value) => {
    if (!value) {
      selectedkeys.value = []
      return
    }
    if (value instanceof ActiveSelection) {
      const tempKeys: string[] = []
      value.forEachObject((obj) => {
        tempKeys.push((obj as FabricObject).id)
      })
      selectedkeys.value = tempKeys
    } else {
      selectedkeys.value = [value.id]
    }
  })

  const splitRef = ref<SplitInstance>()
  const secondHeight = ref(0)
  onMounted(() => {
    const throttledFn = useThrottleFn((entries) => {
      const entry = entries[0]
      const { height } = entry.contentRect
      secondHeight.value = height - 32
    }, 15)
    useResizeObserver(splitRef.value?.wrapperRef?.childNodes?.[2] as HTMLDivElement, throttledFn)
  })
</script>

<template>
  <a-split ref="splitRef" direction="vertical" min="40px" :default-size="0.3">
    <template #first>
      <Tree blockNode :data="treeData2" draggable size="small" />
    </template>
    <template #second>
      <a-input-search v-model="searchKey" />
      <Tree
        size="small"
        blockNode
        draggable
        v-model:selected-keys="selectedkeys"
        :data="treeData"
        :allowDrop="allowDrop"
        :virtualListProps="{
          height: secondHeight,
          fixedSize: true,
        }"
        @drop="onDrop"
        @select="onSelect"
      >
        <template #title="nodeData">
          <span
            :class="{
              'op-50': !nodeData.objectRef.visible,
            }"
          >
            {{ nodeData.title }}
          </span>
        </template>
        <template #drag-icon="nodeData">
          <a-space>
            <!-- <icon-lock /> -->
            <a-button size="small" class="icon-btn" @click="visibleClick($event, nodeData)">
              <template #icon>
                <icon-eye v-if="nodeData.node.objectRef.visible" />
                <icon-eye-invisible v-else />
              </template>
            </a-button>
          </a-space>
        </template>
      </Tree>
    </template>
    <template #resize-trigger>
      <div class="h4 flex items-center">
        <a-divider :margin="0.01" />
      </div>
    </template>
  </a-split>
</template>

<style scoped lang="less"></style>
