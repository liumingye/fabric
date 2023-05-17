<script setup lang="ts">
  import SwipeNumber from '@/components/swipeNumber'
  import SvgIcon from '@/components/svgIcon'
  import { useActiveObjectModel } from './hooks/useActiveObjectModel'

  const left = useActiveObjectModel('left')
  const top = useActiveObjectModel('top')
  const angle = useActiveObjectModel('angle')
  const width = useActiveObjectModel('width')
  const height = useActiveObjectModel('height')
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
