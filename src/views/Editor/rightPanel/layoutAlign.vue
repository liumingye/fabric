<script setup lang="ts">
  import svgIcon from '@/components/svgIcon/svgIcon.vue'
  import TipContentKey from '@/components/tooltip/tipContentKey.vue'
  import { ActiveSelection } from 'fabric'
  import { useEditor } from '@/app'

  const alignList = [
    {
      name: 'HorizontalLeft',
      icon: 'bxs-objects-horizontal-left',
      tip: '左对齐',
      onClick: () => keybinding.trigger('alt+a'),
      key: ['Alt', 'A'],
    },
    {
      name: 'HorizontalCenter',
      icon: 'bxs-objects-horizontal-center',
      tip: '水平居中对齐',
      onClick: () => keybinding.trigger('alt+h'),
      key: ['Alt', 'H'],
    },
    {
      name: 'HorizontalRight',
      icon: 'bxs-objects-horizontal-right',
      tip: '右对齐',
      onClick: () => keybinding.trigger('alt+d'),
      key: ['Alt', 'D'],
    },
    {
      name: 'VerticalTop',
      icon: 'bxs-objects-vertical-top',
      tip: '顶对齐',
      onClick: () => keybinding.trigger('alt+w'),
      key: ['Alt', 'W'],
    },
    {
      name: 'VerticalCenter',
      icon: 'bxs-objects-vertical-center',
      tip: '垂直居中对齐',
      onClick: () => keybinding.trigger('alt+v'),
      key: ['Alt', 'V'],
    },
    {
      name: 'VerticalBottom',
      icon: 'bxs-objects-vertical-bottom',
      tip: '底对齐',
      onClick: () => keybinding.trigger('alt+s'),
      key: ['Alt', 'S'],
    },
    // {
    //   name: 'menu',
    //   icon: 'bxs-grid',
    // },
  ]

  const { canvas, keybinding } = useEditor()

  const disabled = computed(() => !(canvas.activeObject.value instanceof ActiveSelection))
</script>

<template>
  <a-row :wrap="false" class="p2" justify="space-between" align="center">
    <a-col flex="none" v-for="align in alignList" :key="align.name">
      <a-tooltip mini position="bottom" :popupVisible="align.tip ? undefined : false">
        <a-button class="button" size="small" :disabled="disabled" @click="align.onClick">
          <template #icon>
            <svgIcon :name="align.icon" />
          </template>
        </a-button>
        <template #content v-if="align.tip">
          <TipContentKey :content="align.tip" :keys="align.key" />
        </template>
      </a-tooltip>
    </a-col>
  </a-row>
</template>

<style scoped lang="less"></style>
