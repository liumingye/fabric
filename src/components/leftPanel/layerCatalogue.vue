<script setup lang="ts">
  import Tree from '@/components/tree'
  // import { useFabricEvent } from '@/hooks/useFabricEvent'
  import { useAppStore } from '@/store'
  import type { TreeNodeData } from '@/components/tree'
  import { util } from '@/lib/fabric'
  import type { FabricObject } from '@/lib/fabric'

  type ITreeNodeData = TreeNodeData & {
    canDragEnter: boolean
  }

  const { objects } = storeToRefs(useAppStore())

  const treeData = computed(() => {
    return getTreeData(objects.value)
  })

  const getTreeData = (_objects: FabricObject[]) => {
    const objs: ITreeNodeData[] = []
    _objects.forEach((object) => {
      objs.unshift({
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

  // useFabricEvent({
  // })

  const treeData2 = [
    {
      title: '页面 1',
      key: '0-0',
    },
  ]

  const allowDrop = (options: { dropNode: TreeNodeData; dropPosition: -1 | 0 | 1 }) => {
    return (options.dropNode as ITreeNodeData).canDragEnter
  }
</script>

<template>
  <a-split direction="vertical" min="40px" :default-size="0.3">
    <template #first>
      <Tree blockNode :data="treeData2" draggable size="small" />
    </template>
    <template #second>
      <a-input-search style="margin-bottom: 8px; max-width: 240px" />
      <Tree blockNode :data="treeData" draggable size="small" :allowDrop="allowDrop" />
    </template>
    <template #resize-trigger>
      <div class="h4 flex items-center">
        <a-divider :margin="0.01" />
      </div>
    </template>
  </a-split>
</template>

<style scoped lang="less"></style>
