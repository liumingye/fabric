<script setup lang="ts">
  import Tree from '@/components/tree'
  import { useFabricEvent } from '@/hooks/useFabricEvent'
  import { useCanvasStore } from '@/store'
  import type { TreeNodeData } from '@arco-design/web-vue'
  import type { FabricObject, Group, ActiveSelection } from '@/lib/fabric'

  const { canvas } = storeToRefs(useCanvasStore())

  const treeData = ref<TreeNodeData[]>([])

  const isCollection = (fabricObject?: FabricObject): fabricObject is Group | ActiveSelection => {
    return !!fabricObject && Array.isArray((fabricObject as Group)._objects)
  }

  const getTreeData = (_objects: FabricObject[]) => {
    const objs: TreeNodeData[] = []
    _objects.forEach((object) => {
      objs.push({
        title: object.get('name') || object.constructor.name,
        key: object.get('id'),
        children: isCollection(object) ? getTreeData(object._objects as FabricObject[]) : undefined,
      })
    })
    return objs
  }

  onMounted(() => {
    treeData.value = getTreeData(canvas.value.getObjects() as FabricObject[])
  })

  // useFabricEvent({
  // })

  const treeData2 = [
    {
      title: '页面 1',
      key: '0-0',
    },
  ]
</script>

<template>
  <a-split direction="vertical" min="40px" :default-size="0.3">
    <template #first>
      <Tree blockNode :data="treeData2" draggable size="small" />
    </template>
    <template #second>
      <a-input-search style="margin-bottom: 8px; max-width: 240px" />
      <Tree blockNode :data="treeData" draggable size="small" />
    </template>
    <template #resize-trigger>
      <div class="h4 flex items-center">
        <a-divider :margin="0.01" />
      </div>
    </template>
  </a-split>
</template>

<style scoped lang="less"></style>
