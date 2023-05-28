<script setup lang="ts">
  import Tree from '@/components/tree'
  import type { TreeNodeData, DropPosition, TreeNodeKey } from '@/components/tree'
  import { ActiveSelection, ObjectRef, util } from '@fabric'
  import { FabricObject } from '@fabric'
  import { useEditor } from '@/app'
  import { useMagicKeys, useResizeObserver, isDefined } from '@vueuse/core'
  import type { SplitInstance } from '@arco-design/web-vue'
  import ContextMenu from '@/components/contextMenu'
  import { layerItems } from '@/utils/contextMenu'
  import { useFabricEvent } from '@/hooks/useFabricEvent'
  import Workspaces from './workspaces.vue'

  interface ITreeNodeData extends TreeNodeData {
    isCollection: boolean
    visible: boolean
    objectRef: ObjectRef
    setDirty: () => void
    children?: ITreeNodeData[]
  }

  const { canvas, event } = useEditor()

  // 搜索词
  const searchKey = ref('')
  // 重命名
  const renameNodeKey = ref<string | number | undefined>(undefined)
  // 展开的节点
  const expandedKeys = ref<TreeNodeKey[]>([])

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
    dragNodeKey: string | number
    dropNodeKey: string | number
    dropPosition: DropPosition
    excludeGroupObject: boolean
  }) => {
    const { dragNodeKey, dropNodeKey, dropPosition, excludeGroupObject } = data

    // 通过key查找对象
    const objects = canvas.findObjectsByIds([dragNodeKey.toString(), dropNodeKey.toString()])

    // 没找到则退出
    if (objects.includes(undefined)) return

    const [dragObject, dropObject] = objects as FabricObject[]

    // 如果该对象属于的分组也在拖拽列表，则中止操作。
    if (excludeGroupObject) {
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

    // 获取对象的组
    const dragGroup = dragObject.getParent()
    let dropGroup = dropObject.getParent()

    let dropIndex = dropGroup._objects.indexOf(dropObject)

    // 对象同组
    if (dragGroup === dropGroup) {
      const dragIndex = dragGroup._objects.indexOf(dragObject)
      if (dragIndex < dropIndex) {
        dropIndex--
      }
    }

    // 进入组，dropObject是组
    if (util.isCollection(dropObject) && dropPosition === 0) {
      dropGroup = dropObject
      dropIndex = dragGroup._objects.length
    }
    const [_dragObject] = dragGroup.remove(dragObject) as FabricObject[]
    dropGroup.insertAt(dropPosition === 1 ? dropIndex : dropIndex + 1, _dragObject)
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
  const updateSelectedkeys = () => {
    if (!canvas.activeObject.value) {
      selectedkeys.value = []
      return
    }
    if (canvas.activeObject.value instanceof ActiveSelection) {
      const tempKeys: string[] = []
      canvas.activeObject.value.forEachObject((obj) => {
        tempKeys.push(obj.id)
      })
      selectedkeys.value = tempKeys
    } else {
      selectedkeys.value = [canvas.activeObject.value.id]
    }
  }

  useFabricEvent({
    'selection:created': updateSelectedkeys,
    'selection:updated': updateSelectedkeys,
    'selection:cleared': updateSelectedkeys,
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
    useResizeObserver(splitRef.value?.wrapperRef?.childNodes?.[2] as HTMLDivElement, (entries) => {
      const entry = entries[0]
      const { height } = entry.contentRect
      secondHeight.value = height - 32
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
    const object = canvas.findObjectById(key.toString())
    if (!object) return
    object.name = value
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
          height: secondHeight,
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
            class="bg-transparent! border-none px0"
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
