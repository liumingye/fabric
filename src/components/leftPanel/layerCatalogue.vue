<script setup lang="ts">
  import Tree from '@/components/tree'
  import type { TreeNodeData, DropPosition, TreeNodeKey } from '@/components/tree'
  import { ActiveSelection, Group, ObjectRef, util } from '@fabric'
  import { FabricObject } from '@fabric'
  import { useEditor } from '@/app'
  import { useMagicKeys, useResizeObserver, useThrottleFn } from '@vueuse/core'
  import type { SplitInstance } from '@arco-design/web-vue'
  import ContextMenu from '@/components/contextMenu'

  type ITreeNodeData = TreeNodeData & {
    isCollection: boolean
    objectRef: ObjectRef
    group?: Group
    children?: ITreeNodeData[]
  }

  const { canvas, keybinding } = useEditor()

  const searchKey = ref('')

  const expandedKeys = ref<TreeNodeKey[]>([])

  const treeData = computed(() => {
    return getTreeData(canvas.computed.objects.value, searchKey.value)
  })

  /**
   * 获得树节点数据
   */
  const getTreeData = (objects: FabricObject[], searchKey?: string): ITreeNodeData[] => {
    const objs: ITreeNodeData[] = []
    if (!objects) return objs
    for (const object of objects) {
      const isCollection = util.isCollection(object)
      const children = isCollection ? getTreeData(object._objects as FabricObject[], searchKey) : []
      const nodeData: ITreeNodeData = {
        group: object.group as Group | undefined,
        objectRef: object.ref,
        isCollection,
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

  /**
   * 节点搜索
   */
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

  /**
   * 节点是否允许放置
   */
  const allowDrop = (options: { dropNode: TreeNodeData }) => {
    return (options.dropNode as ITreeNodeData).isCollection
  }

  /**
   * 移动节点
   */
  const moveNode = (data: {
    e: DragEvent
    dragNodeKey: string | number
    dropNodeKey: string | number
    dropPosition: DropPosition
    excludeGroupObject: boolean
  }) => {
    const { dragNodeKey, dropNodeKey, dropPosition, excludeGroupObject } = data
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
      if (obj.id == dragNodeKey) {
        dragObject = obj
        dragIndex = index
      } else if (obj.id == dropNodeKey) {
        dropObject = obj
        if (dragIndex !== -1 && dragObject?.group === dropObject?.group) {
          dropIndex = index - 1
        } else {
          dropIndex = index
        }
      }
    })

    // 如果该对象属于的分组也在拖拽列表，则中止操作。
    if (excludeGroupObject && dragObject) {
      const checkNodeVisibility = (obj: FabricObject): boolean => {
        if (!obj.group || !selectedkeys.value.includes(obj.group.id)) {
          return false
        } else if (obj.group.group) {
          return checkNodeVisibility(obj.group.group)
        }
        return true
      }
      if (checkNodeVisibility(dragObject)) {
        return
      }
    }

    if (dragIndex >= 0 && dropIndex >= 0 && dragObject && dropObject) {
      const dragGroup = dragObject.getParent()
      let dropGroup = dropObject.getParent()
      // 进入组，dropObject是组
      if (util.isCollection(dropObject) && [0, 1].includes(dropPosition)) {
        dropGroup = dropObject
        dropIndex = dragGroup._objects.length
      }
      const _dragObject = dragObject
      dragGroup.remove(dragObject)
      _dragObject.group?.exitGroup(_dragObject)
      dropGroup.insertAt(dropPosition === 1 ? dropIndex : dropIndex + 1, _dragObject)
    }
  }

  /**
   * tree节点放置事件
   */
  const onDrop = (data: {
    e: DragEvent
    dragNode: TreeNodeData
    dropNode: TreeNodeData
    dropPosition: DropPosition
  }) => {
    const { e, dragNode, dropNode, dropPosition } = data as {
      e: DragEvent
      dragNode: ITreeNodeData
      dropNode: ITreeNodeData
      dropPosition: DropPosition
    }
    if (!dragNode.key || !dropNode.key) return
    if (selectedkeys.value.includes(dragNode.key.toString())) {
      // 多个拖拽
      for (let i = selectedkeys.value.length - 1; i >= 0; i--) {
        moveNode({
          e,
          dragNodeKey: selectedkeys.value[i],
          dropNodeKey: dropNode.key,
          dropPosition,
          excludeGroupObject: true,
        })
      }
    } else {
      // 单个拖拽
      moveNode({
        e,
        dragNodeKey: dragNode.key,
        dropNodeKey: dropNode.key,
        dropPosition,
        excludeGroupObject: false,
      })
    }
  }

  /**
   * 点击图层锁定
   */
  const lockClick = (e: Event, node: ITreeNodeData) => {
    e.stopPropagation()
    node.objectRef.evented = !node.objectRef.evented
    node.objectRef.hasControls = node.objectRef.evented
    node.objectRef.selectable = node.objectRef.evented
    canvas.requestRenderAll()
  }

  /**
   * 点击图层可视
   */
  const visibleClick = (e: Event, node: ITreeNodeData) => {
    e.stopPropagation()
    node.objectRef.visible = !node.objectRef.visible
    node.group?.setDirty()
    canvas.requestRenderAll()
  }

  const selectedkeys = ref<(string | number)[]>([])

  /**
   * tree节点选择
   */
  const onSelect = (_selectedkeys: (string | number)[] = selectedkeys.value) => {
    const objects: FabricObject[] = []
    canvas.forEachObject(function add(obj) {
      if (util.isCollection(obj)) {
        obj.forEachObject(add)
      }
      if (_selectedkeys.includes(obj.id)) {
        objects.push(obj)
      }
    })
    if (objects.length) {
      canvas.setActiveObjects(objects)
    } else {
      canvas.discardActiveObject()
    }
    // 控制器不会消失，更新一下画板
    canvas.requestRenderAll()
  }

  // 更新tree选中节点
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
    // 默认展开第一层节点
    treeData.value.forEach((data) => {
      if (data.children && data.key) {
        expandedKeys.value.push(data.key)
      }
    })

    // 更新tree组件的高度
    const throttledFn = useThrottleFn((entries) => {
      const entry = entries[0]
      const { height } = entry.contentRect
      secondHeight.value = height - 32
    }, 15)
    useResizeObserver(splitRef.value?.wrapperRef?.childNodes?.[2] as HTMLDivElement, throttledFn)
  })

  // 图层是否可视
  const isVisible = (node: ITreeNodeData): boolean => {
    if (!node.objectRef.visible) {
      return false
    } else if (node.group) {
      return isVisible({
        objectRef: node.group.ref,
        group: node.group.group,
      } as ITreeNodeData)
    }
    return true
  }

  // 多选
  // todo: shift键选择范围
  const multiple = ref(false)
  const { meta, ctrl } = useMagicKeys()
  watchEffect(() => {
    if (meta.value || ctrl.value) {
      multiple.value = true
    } else {
      multiple.value = false
    }
  })

  const showContextMenu = (e: MouseEvent, _node: TreeNodeData) => {
    e.preventDefault()
    e.stopImmediatePropagation()

    const node = _node as ITreeNodeData

    if (!node.key) return

    if (!selectedkeys.value.includes(node.key)) {
      selectedkeys.value = [node.key]
      onSelect()
    }

    const { mod } = keybinding

    ContextMenu.showContextMenu({
      x: e.clientX,
      y: e.clientY,
      preserveIconWidth: false,
      items: [
        {
          label: '向上移动一层',
          onClick: () => {
            keybinding.trigger('mod+]')
          },
          shortcut: `${mod} ]`,
        },
        {
          label: '移到顶层',
          onClick: () => {
            keybinding.trigger(']')
          },
          shortcut: ']',
        },
        {
          label: '向下移动一层',
          onClick: () => {
            keybinding.trigger('mod+[')
          },
          shortcut: `${mod} [`,
        },
        {
          label: '移到底层',
          onClick: () => {
            keybinding.trigger('[')
          },
          shortcut: '[',
          divided: true,
        },
        {
          label: '创建分组',
          onClick: () => {
            keybinding.trigger('mod+g')
          },
          shortcut: `${mod} G`,
        },
        {
          label: '解除分组',
          hidden: !node.isCollection,
          onClick: () => {
            keybinding.trigger('mod+shift+g')
          },
          shortcut: `${mod} ⇧ G`,
        },
      ],
    })
  }
</script>

<template>
  <a-split ref="splitRef" direction="vertical" min="40px" :default-size="0.2">
    <template #first>
      <Tree blockNode :data="treeData2" draggable size="small" />
    </template>
    <template #second>
      <a-input v-model="searchKey" placeholder="Search..." class="bg-transparent! border-none!" />
      <Tree
        size="small"
        blockNode
        draggable
        v-model:selected-keys="selectedkeys"
        v-model:expanded-keys="expandedKeys"
        :animation="false"
        :multiple="multiple"
        :data="treeData"
        :allowDrop="allowDrop"
        :virtualListProps="{
          height: secondHeight,
          fixedSize: true,
        }"
        @drop="onDrop"
        @select="onSelect"
        @node-contextmenu="showContextMenu"
      >
        <template #title="nodeData">
          <span
            :class="{
              'op-50': !isVisible(nodeData),
            }"
          >
            {{ nodeData.title }}
          </span>
        </template>
        <template #extra="nodeData">
          <div
            class="extra"
            :class="{
              show: !nodeData.objectRef.evented || !nodeData.objectRef.visible,
            }"
          >
            <a-button
              :class="{
                show: nodeData.objectRef.evented,
              }"
              size="small"
              class="icon-btn"
              @click="lockClick($event, nodeData)"
            >
              <template #icon>
                <icon-unlock v-if="nodeData.objectRef.evented" />
                <icon-lock v-else />
              </template>
            </a-button>
            <a-button
              :class="{
                show: nodeData.objectRef.visible,
              }"
              size="small"
              class="icon-btn"
              @click="visibleClick($event, nodeData)"
            >
              <template #icon>
                <icon-eye v-if="nodeData.objectRef.visible" />
                <icon-eye-invisible v-else />
              </template>
            </a-button>
          </div>
        </template>
      </Tree>
    </template>
    <template #resize-trigger>
      <div class="pt4">
        <a-divider :margin="0" />
      </div>
    </template>
  </a-split>
</template>

<style scoped lang="less">
  .extra {
    display: none;
    &.show {
      display: inline-block;
      .arco-btn.show {
        visibility: hidden;
      }
    }
  }

  .arco-tree-node-hover {
    .extra {
      display: inline-block;
      .arco-btn.show {
        visibility: visible;
      }
    }
  }
</style>
