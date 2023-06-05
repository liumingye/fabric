<script setup lang="ts">
  import Tree from '@/components/tree'
  import type {
    TreeNodeData,
    DropPosition,
    TreeNodeKey,
    TreeInstance,
    DropEvent,
  } from '@/components/tree'
  import { Board, Group, ObjectRef, util } from '@fabric'
  import { FabricObject } from '@fabric'
  import { useEditor } from '@/app'
  import { useMagicKeys, useResizeObserver, isDefined } from '@vueuse/core'
  import type { SplitInstance } from '@arco-design/web-vue'
  import ContextMenu from '@/components/contextMenu'
  import { layerItems } from '@/utils/contextMenu'
  import { useFabricEvent } from '@/hooks/useFabricEvent'
  import Workspaces from './workspaces.vue'
  import { LinkedList } from '@/utils/linkedList'

  interface ITreeNodeData extends TreeNodeData {
    isCollection: boolean
    visible: boolean
    objectRef: ObjectRef
    setDirty: () => void
    children?: ITreeNodeData[]
  }

  const { canvas, event, undoRedo } = useEditor()

  // 搜索词
  const searchKey = ref('')
  // 重命名
  const renameNodeKey = ref<string | number | undefined>(undefined)
  // 展开的节点
  const expandedKeys = ref<TreeNodeKey[]>([])

  const treeRef = ref<TreeInstance>()

  /**
   * 获得树节点数据
   */
  const getTreeData = (
    objects: FabricObject[],
    searchKey?: string,
    parentVisible = true,
  ): ITreeNodeData[] => {
    const objs: ITreeNodeData[] = []
    if (!objects) return objs
    for (const object of objects) {
      const isCollection = util.isCollection(object)
      const children = isCollection
        ? getTreeData(object._objects, searchKey, parentVisible && object.visible)
        : []
      const nodeData: ITreeNodeData = {
        visible: parentVisible && object.visible,
        objectRef: object.ref,
        isCollection,
        title: object.name || object.constructor.name,
        key: object.id,
        setDirty: () => object.group?.setDirty(),
        children,
        draggable: renameNodeKey.value !== object.id,
      }
      if (!searchKey || canAddToResult(nodeData, searchKey)) {
        objs.unshift(nodeData)
        // objs.push(nodeData)
      }
    }

    return objs
  }

  const treeData: Ref<ITreeNodeData[]> = ref([])

  watchEffect(() => {
    treeData.value = getTreeData(canvas.ref.objects.value, searchKey.value)
  })

  /**
   * 节点搜索
   */
  const canAddToResult = (nodeData: ITreeNodeData, searchKey: string): boolean => {
    // 广度优先搜索
    const lowerSearchKey = searchKey.toLowerCase()
    const queue = new LinkedList<ITreeNodeData>()
    queue.push(nodeData)
    let isMatched = false
    while (!queue.isEmpty()) {
      const currentNode = queue.shift()!
      const currentTitle = currentNode.title?.toLowerCase()
      if (currentTitle?.includes(lowerSearchKey)) {
        isMatched = true
      }
      // 压入子元素
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

  /**
   * 节点是否允许放置
   */
  const allowDrop = ({ dropNode }: { dropNode: TreeNodeData }) => {
    return (dropNode as ITreeNodeData).isCollection
  }

  /**
   * 移动节点
   */
  const moveNode = (data: {
    e: DragEvent
    dragObject: FabricObject
    dropObject: FabricObject
    dropPosition: DropPosition
    excludeGroupObject: boolean
  }) => {
    const { dragObject, dropObject, dropPosition, excludeGroupObject } = data

    // 如果该对象属于的分组也在拖拽列表，则中止操作。
    if (excludeGroupObject) {
      const inGroup = dragObject.getAncestors(true).some((group) => {
        return selectedkeys.value.includes((group as Group).id)
      })
      if (inGroup) {
        return
      }
    }

    // 退出激活选区
    if (util.isActiveSelection(dragObject.group)) {
      dragObject.group.remove(dragObject)
    }

    // 获取对象的组
    const dragGroup = dragObject.getParent()
    let dropGroup = dropObject.getParent()

    let dropIndex = dropGroup._objects.indexOf(dropObject)

    // 画板不能进组
    if ((dragGroup !== dropGroup || dropPosition === 0) && dragObject instanceof Board) {
      return false
    }

    // 对象同组
    if (dragGroup === dropGroup) {
      const dragIndex = dragGroup._objects.indexOf(dragObject)
      if (dragIndex < dropIndex) {
        dropIndex--
      }
    }

    if (dropPosition === -1) {
      dropIndex++
    }

    const [_dragObject] = dragGroup.remove(dragObject) as FabricObject[]

    // dropObject是组，dropPosition 为 0 进入组
    if (util.isCollection(dropObject) && dropPosition === 0) {
      dropObject.add(_dragObject)
    } else {
      dropGroup.insertAt(dropIndex, _dragObject)
    }

    // 回到激活选区
    if (canvas.getActiveObject() === canvas.getActiveSelection()) {
      canvas.getActiveSelection().multiSelectAdd(_dragObject)
    } else {
      canvas.setActiveObject(_dragObject)
    }
  }

  /**
   * tree节点放置事件
   */
  const onDrop = (data: DropEvent) => {
    const { e, dragNode, dropNode, dropPosition } = data as DropEvent<ITreeNodeData>

    if (!dragNode.key || !dropNode.key) return

    // 多个拖拽
    if (selectedkeys.value.includes(dragNode.key)) {
      // 通过key查找对象
      let dragObjects = canvas.findObjectsByIds([dropNode.key, ...selectedkeys.value])
      const dropObject = dragObjects.shift()
      if (!isDefined(dropObject)) return
      // 由于列表是倒序，这里把列表翻转过来
      if (dropPosition !== -1) {
        dragObjects = dragObjects.reverse()
      }
      for (let i = dragObjects.length - 1; i >= 0; i--) {
        // 没找到则退出
        const dragObject = dragObjects[i]
        if (!isDefined(dragObject)) return
        moveNode({
          e,
          dragObject,
          dropObject,
          dropPosition,
          excludeGroupObject: true,
        })
      }
    }
    // 单个拖拽
    else {
      // 通过key查找对象
      const [dropObject, dragObject] = canvas.findObjectsByIds([dropNode.key, dragNode.key])
      // 没找到则退出
      if (!isDefined(dropObject) || !isDefined(dragObject)) return
      moveNode({
        e,
        dragObject,
        dropObject,
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
    node.setDirty()
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
  const updateSelectedkeys = async () => {
    const activeObject = canvas.activeObject.value

    if (!activeObject) {
      selectedkeys.value = []
      return
    }

    let needExpandedKeys: Set<string> = new Set()

    if (util.isActiveSelection(activeObject)) {
      const tempKeys: string[] = []
      activeObject.forEachObject((obj) => {
        if (obj.group) {
          needExpandedKeys.add(obj.group.id)
        }
        tempKeys.push(obj.id)
      })
      selectedkeys.value = tempKeys
    } else {
      if (activeObject.group) {
        needExpandedKeys.add(activeObject.group.id)
      }
      selectedkeys.value = [activeObject.id]
    }

    if (needExpandedKeys) {
      expandedKeys.value.push(...needExpandedKeys)
      // 等待展开
      await nextTick()
    }

    const containerRect = treeRef.value?.virtualListRef.containerRef.getBoundingClientRect()
    const nodeRect = document
      .querySelector(`.arco-tree-node[data-key='${selectedkeys.value[0]}']`)
      ?.getBoundingClientRect()

    // 判断是否在可视区域外
    if (
      !nodeRect ||
      containerRect.top - nodeRect.top > nodeRect.height ||
      nodeRect.top - containerRect.top > treeHeight.value
    ) {
      treeRef.value?.scrollIntoView({
        key: selectedkeys.value[0],
        align: 'auto',
      })
    }
  }

  useFabricEvent({
    'selection:created': updateSelectedkeys,
    'selection:updated': updateSelectedkeys,
    'selection:cleared': updateSelectedkeys,
  })

  const splitRef = ref<SplitInstance>()
  const treeHeight = ref(0)

  onMounted(() => {
    // 默认展开第一层节点
    treeData.value.forEach((data) => {
      if (data.children && data.key) {
        expandedKeys.value.push(data.key)
      }
    })

    // 更新tree组件的高度
    useResizeObserver(splitRef.value?.wrapperRef?.childNodes?.[2] as HTMLDivElement, (entries) => {
      const [entry] = entries
      const { height } = entry.contentRect
      treeHeight.value = height - 32
    })
  })

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

  const showContextMenu = (e: MouseEvent, node: TreeNodeData) => {
    e.preventDefault()
    e.stopImmediatePropagation()

    if (!node.key) return

    if (!selectedkeys.value.includes(node.key)) {
      selectedkeys.value = [node.key]
      onSelect()
    }

    ContextMenu.showContextMenu({
      x: e.clientX,
      y: e.clientY,
      preserveIconWidth: false,
      items: layerItems(),
    })
  }

  event.on('layerRename', (e) => {
    renameNodeKey.value = e.id
  })

  const onNodeDbclick = (e: MouseEvent, _node: TreeNodeData) => {
    e.preventDefault()
    if (!_node.key) return
    renameNodeKey.value = _node.key
  }

  const onInputMounted = (vnode: VNode) => {
    const el = vnode.el as HTMLDivElement | null
    if (!el) return
    const input = el.querySelector('input')
    if (!input) return
    input.focus()
    input.select()
  }

  const onInputChange = (value: string, e: Event) => {
    const key = renameNodeKey.value
    const target = e.target as HTMLElement | null
    target?.blur()
    if (!key || !value) return
    const object = canvas.findObjectById(key)
    if (!object) return
    object.name = value
    undoRedo.saveState()
  }
</script>

<template>
  <a-split
    ref="splitRef"
    class="h-[calc(100vh-90px)]"
    direction="vertical"
    min="40px"
    :default-size="0.2"
  >
    <template #first>
      <Workspaces />
    </template>
    <template #second>
      <a-input v-model="searchKey" placeholder="Search..." class="bg-transparent! border-none!">
        <template #prefix>
          <icon-search />
        </template>
      </a-input>
      <Tree
        ref="treeRef"
        size="small"
        blockNode
        draggable
        :selected-keys="selectedkeys"
        v-model:expanded-keys="expandedKeys"
        :animation="false"
        :multiple="multiple"
        :data="treeData"
        :allowDrop="allowDrop"
        :virtualListProps="{
          height: treeHeight,
          fixedSize: true,
        }"
        @drop="onDrop"
        @select="onSelect"
        @node-contextmenu="showContextMenu"
        @node-dbclick="onNodeDbclick"
      >
        <template #title="nodeData">
          <a-input
            v-if="isDefined(nodeData.key) && renameNodeKey === nodeData.key"
            class="bg-transparent! border-none! px0!"
            size="mini"
            :default-value="nodeData.title"
            @blur="renameNodeKey = undefined"
            @vue:mounted="onInputMounted"
            @change="onInputChange"
            @press-enter="renameNodeKey = undefined"
          />
          <span
            v-else
            :class="{
              'op-50': !nodeData.visible,
            }"
          >
            {{ nodeData.title }}
          </span>
        </template>
        <template #extra="nodeData">
          <div
            v-if="renameNodeKey !== nodeData.key"
            class="extra pr4px"
            :class="{
              show: !nodeData.objectRef.evented || !nodeData.objectRef.visible,
            }"
          >
            <a-button
              :class="{
                show: nodeData.objectRef.evented,
              }"
              size="mini"
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
              size="mini"
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
