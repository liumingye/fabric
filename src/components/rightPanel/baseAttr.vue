<script setup lang="ts">
  import SwipeNumber from '@/components/swipeNumber'
  import SvgIcon from '@/components/svgIcon'
  import { useActiveObjectModel } from './hooks/useActiveObjectModel'
  import TipContentKey from '@/components/tooltip/tipContentKey.vue'
  import { useEditor } from '@/app'
  import { isDefined } from '@vueuse/core'

  const left = useActiveObjectModel('left')
  const top = useActiveObjectModel('top')
  const angle = useActiveObjectModel('angle')
  const width = useActiveObjectModel('width')
  const height = useActiveObjectModel('height')

  const { keybinding, canvas } = useEditor()
</script>

<template>
  <div class="p2">
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <SwipeNumber size="small" label="X" v-bind="left" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber size="small" label="Y" v-bind="top" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber size="small" :min="1" label="W" v-bind="width" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber size="small" :min="1" label="H" v-bind="height" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber size="small" v-bind="angle">
          <template #label>
            <SvgIcon name="bx-revision" />
          </template>
          <template #suffix>
            <div class="absolute top-1 right-1">°</div>
          </template>
        </SwipeNumber>
      </a-col>
      <a-col :span="8">
        <a-space size="mini">
          <a-tooltip mini position="bottom">
            <a-button
              size="small"
              :disabled="!isDefined(canvas.activeObject)"
              @click="keybinding.trigger('shift+h')"
            >
              <template #icon>
                <SvgIcon name="bx-reflect-horizontal" />
              </template>
            </a-button>
            <template #content>
              <TipContentKey content="水平翻转" :keys="['Shift', 'H']" />
            </template>
          </a-tooltip>
          <a-tooltip mini position="bottom">
            <a-button
              size="small"
              :disabled="!isDefined(canvas.activeObject)"
              @click="keybinding.trigger('shift+v')"
            >
              <template #icon>
                <SvgIcon name="bx-reflect-vertical" />
              </template>
            </a-button>
            <template #content>
              <TipContentKey content="垂直翻转" :keys="['Shift', 'V']" />
            </template>
          </a-tooltip>
        </a-space>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="less">
  .arco-input-prefix {
    svg {
      display: inline-block;
      vertical-align: -3.5px;
    }
  }
</style>
