<script setup lang="ts">
  import { useEditor } from '@/app'
  import Tree from '@/components/tree'
  import type { TreeNodeData } from '@/components/tree'
  import ContextMenu from '@/components/contextMenu'
  import { iMatrix } from '@fabric'
  import { clone, cloneDeep } from 'lodash'

  const number = ref(0)

  const { canvas, event, workspaces } = useEditor()

  const workspacesData = ref<TreeNodeData[]>([])
  const selectedkeys = ref<(string | number)[]>([])

  const updateWorkspaces = () => {
    workspacesData.value = workspaces.all().map((workspace) => {
      return {
        key: workspace.id,
        title: workspace.name,
      }
    })
    selectedkeys.value = [workspaces.getCurrentId()]
    number.value = workspaces.size()
  }

  updateWorkspaces()

  event.on('workspaceChangeAfter', updateWorkspaces)
  event.on('workspaceAddAfter', updateWorkspaces)
  event.on('workspaceRemoveAfter', updateWorkspaces)

  onUnmounted(() => {
    event.off('workspaceChangeAfter', updateWorkspaces)
    event.off('workspaceAddAfter', updateWorkspaces)
    event.off('workspaceRemoveAfter', updateWorkspaces)
  })

  const onSelect = (_selectedkeys: (string | number)[]) => {
    workspaces.setCurrentId(_selectedkeys[0].toString())
  }

  const addOnClick = () => {
    workspaces.setCurrentId(workspaces.add('页面'))
    canvas.setViewportTransform(iMatrix)
  }

  const openContextMenu = (e: MouseEvent, node: TreeNodeData) => {
    ContextMenu.showContextMenu({
      x: e.clientX,
      y: e.clientY,
      preserveIconWidth: false,
      items: [
        {
          label: '复制',
          onClick: async () => {
            if (!node.key) return
            const workspace = workspaces.get(node.key.toString())
            if (!workspace) return
            const json = canvas.toObject()
            const id = workspaces.add(workspace.name + ' 拷贝')
            workspaces.setCurrentId(id)
            await canvas.loadFromJSON(json)
            canvas.renderAll()
          },
        },
        {
          label: '删除',
          hidden: workspaces.size() <= 1,
          onClick: () => {
            if (!node.key) return
            workspaces.remove(node.key.toString())
          },
          divided: true,
        },
        {
          label: '重命名',
          onClick: () => {
            //
          },
        },
      ],
    })
  }
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="bg-$color-bg-4 h28px px0.5 flex justify-between items-center">
      <span class="pl3 color-$color-text-2">页面 ({{ number }})</span>
      <div>
        <a-button class="icon-btn" size="mini" @click="addOnClick">
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
      </div>
    </div>
    <a-scrollbar class="overflow-y-auto h-full" outer-class="flex-1 min-h-0">
      <Tree
        class=""
        blockNode
        :selected-keys="selectedkeys"
        @select="onSelect"
        :data="workspacesData"
        size="small"
        @node-contextmenu="openContextMenu"
      />
    </a-scrollbar>
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
