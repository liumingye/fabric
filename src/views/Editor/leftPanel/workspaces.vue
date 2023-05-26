<script setup lang="ts">
  import { useEditor } from '@/app'
  import Tree from '@/components/tree'
  import type { TreeNodeData } from '@/components/tree'

  const { event, workspaces } = useEditor()

  const workspacesData = ref<TreeNodeData[]>([])
  const selectedkeys = ref<(string | number)[]>([])

  const updateWorkspaces = () => {
    workspacesData.value = workspaces.getAllWorkspaces().map((workspace) => {
      return {
        key: workspace.id,
        title: workspace.name,
      }
    })
    selectedkeys.value = [workspaces.getCurrentWorkspaceId()]
  }

  event.on('workspaceChangeAfter', updateWorkspaces)
  event.on('workspaceAdd', updateWorkspaces)
  event.on('workspaceRemove', updateWorkspaces)

  updateWorkspaces()

  const onSelect = (_selectedkeys: (string | number)[]) => {
    workspaces.setCurrentWorkspaceId(_selectedkeys[0].toString())
  }

  onUnmounted(() => {
    event.off('workspaceChangeAfter', updateWorkspaces)
    event.off('workspaceAdd', updateWorkspaces)
    event.off('workspaceRemove', updateWorkspaces)
  })

  const addOnClick = () => {
    workspaces.setCurrentWorkspaceId(workspaces.addWorkspace('页面'))
  }
</script>

<template>
  <div>
    <div class="h28px px0.5 font-bold flex justify-between items-center">
      <span class="pl3 color-$color-text-2">页面</span>
      <div>
        <a-button class="icon-btn" size="mini" @click="addOnClick">
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
      </div>
    </div>
    <Tree
      blockNode
      :selected-keys="selectedkeys"
      @select="onSelect"
      :data="workspacesData"
      size="small"
    />
  </div>
</template>

<style scoped lang="less">
  :deep(.arco-icon) {
    stroke: var(--color-text-1);
  }
  :deep(.arco-tree-node-switcher) {
    padding-right: 0;
  }
</style>
