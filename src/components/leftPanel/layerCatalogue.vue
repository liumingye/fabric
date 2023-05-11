<script setup lang="ts">
  import Tree from '@/components/tree'
  // import { useFabricEvent } from '@/hooks/useFabricEvent'
  import { useAppStore } from '@/store'
  import type { TreeNodeData, DropPosition } from '@/components/tree'
  import { ActiveSelection, Group, ObjectRef, util } from '@/lib/fabric'
  import { FabricObject } from '@/lib/fabric'
  import { useEditorServices } from '@/editor'

  type ITreeNodeData = TreeNodeData & {
    canDragEnter: boolean
    objectRef: ObjectRef
    group: Group | undefined
  }

  const { canvas } = useEditorServices()
  const { objects } = storeToRefs(useAppStore())

  const treeData = computed(() => {
    return getTreeData(objects.value)
  })

  const getTreeData = (_objects: FabricObject[]) => {
    const objs: ITreeNodeData[] = []
    _objects.forEach((object) => {
      objs.unshift({
        // svg: object.toSVG(),
        group: object.group as Group | undefined,
        objectRef: object.ref,
        canDragEnter: util.isCollection(object) ? true : false,
        title: object.get('name') || object.constructor.name,
        key: object.get('id'),
        children: util.isCollection(object)
          ? getTreeData(object._objects as FabricObject[])
          : undefined,
      })
    })
    return objs
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

    let dragIndex = -1
    let dragObject: FabricObject | undefined = undefined
    let dropIndex = -1
    let dropObject: FabricObject | undefined = undefined

    // 获取对象和索引
    canvas.forEachObject(function add(obj, index) {
      // 递归子对象
      if (util.isCollection(obj)) {
        obj.forEachObject(add)
      }
      if (obj.get('id') == dragNode.key) {
        dragObject = obj as FabricObject
        dragIndex = index
      } else if (obj.get('id') == dropNode.key) {
        dropObject = obj as FabricObject
        if (dragIndex !== -1 && dragObject?.group === dropObject?.group) {
          dropIndex = index - 1
        } else {
          dropIndex = index
        }
      }
    })

    if (dragIndex >= 0 && dropIndex >= 0 && dragObject && dropObject) {
      const dragGroup = (dragObject as Group)?.group || canvas
      let dropGroup = (dropObject as Group)?.group || canvas
      // 进入组
      if (dropPosition === 0) {
        dropGroup = dropObject
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
</script>

<template>
  <a-split direction="vertical" min="40px" :default-size="0.3">
    <template #first>
      <Tree blockNode :data="treeData2" draggable size="small" />
    </template>
    <template #second>
      <a-input-search style="margin-bottom: 8px; max-width: 240px" />
      <Tree
        size="small"
        blockNode
        draggable
        v-model:selected-keys="selectedkeys"
        :data="treeData"
        :allowDrop="allowDrop"
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
