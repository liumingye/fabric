<script setup lang="ts">
  import Tree from '@/components/tree'
  // import { useFabricEvent } from '@/hooks/useFabricEvent'
  import { useAppStore } from '@/store'
  import type { TreeNodeData, DropPosition } from '@/components/tree'
  import { Group, util } from '@/lib/fabric'
  import type { FabricObject } from '@/lib/fabric'
  import { useEditorServices } from '@/editor'

  type ITreeNodeData = TreeNodeData & {
    canDragEnter: boolean
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
        // object,
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
    canvas.forEachObject(function add(p, index) {
      // 递归子对象
      if (util.isCollection(p)) {
        p.forEachObject(add)
      }
      if (p.get('id') == dragNode.key) {
        dragObject = p as FabricObject
        dragIndex = index
      } else if (p.get('id') == dropNode.key) {
        dropObject = p as FabricObject
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
</script>

<template>
  <a-split direction="vertical" min="40px" :default-size="0.3">
    <template #first>
      <Tree blockNode :data="treeData2" draggable size="small" />
    </template>
    <template #second>
      <a-input-search style="margin-bottom: 8px; max-width: 240px" />
      <Tree
        blockNode
        :data="treeData"
        draggable
        size="small"
        :allowDrop="allowDrop"
        :onDrop="onDrop"
      />
    </template>
    <template #resize-trigger>
      <div class="h4 flex items-center">
        <a-divider :margin="0.01" />
      </div>
    </template>
  </a-split>
</template>

<style scoped lang="less"></style>
