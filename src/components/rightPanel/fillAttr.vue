<script setup lang="ts">
  import Panel from './panel.vue'
  import PanelTitle from './panelTitle.vue'
  import { useActiveObjectModel } from './hooks/useActiveObjectModel'
  import { isString } from 'lodash'
  import { util } from '@/lib/fabric'
  import type { GradientCoords } from 'fabric/src/gradient/typedefs'

  const fill = useActiveObjectModel('fill')

  const convertCoordsToDeg = (coords: GradientCoords<'linear'>) =>
    (Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1) * 180) / Math.PI + 90

  const background = computed(() => {
    const value = fill.value.modelValue
    let css = ''
    if (isString(value)) {
      css += value
    } else if (util.isGradient(value)) {
      if (value.type === 'linear') {
        css += `linear-gradient(${convertCoordsToDeg(value.coords)}deg`
      } else {
        css += `radial-gradient(8px 8px at 8px 8px`
      }
      css += `,${value.colorStops.map((cs) => `${cs.color} ${cs.offset * 100}%`).join(',')})`
    }
    return css || '#fff'
  })

  const fillHexColor = (hex: string) => {
    return hex.padEnd(6, hex)
  }

  const onChange = (value: string) => {
    fill.value.onChange('#' + fillHexColor(value.replace('#', '')))
  }

  const modelValue = ref('')
  watchEffect(() => {
    const value = fill.value.modelValue
    if (isString(value)) {
      modelValue.value = value.replace('#', '').toUpperCase()
      return
    } else if (util.isGradient(value)) {
      modelValue.value = value.type === 'linear' ? '线性渐变' : '径向渐变'
      return
    }
    modelValue.value = '图案填充'
  })

  const readonly = computed(() => !isString(fill.value.modelValue))
</script>

<template>
  <Panel>
    <PanelTitle title="填充" />
    <!-- <div>点击 + 重置并修改多个内容</div> -->
    <a-row :gutter="[4, 4]" align="center">
      <a-col :span="10">
        <a-input size="mini" v-model="modelValue" :readonly="readonly" @change="onChange">
          <template #prefix>
            <a-button size="mini" class="icon-btn">
              <template #icon>
                <div
                  class="w16px h16px rd-4px"
                  :style="{
                    background,
                  }"
                ></div>
              </template>
            </a-button>
          </template>
        </a-input>
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less">
  :deep(.arco-input-wrapper) {
    padding-left: 0 !important;
  }

  :deep(.arco-input-prefix) {
    padding-right: 0 !important;
    margin-left: -1px;
    margin-right: 4px;
    justify-content: center;

    .arco-btn {
      width: 32px;
    }
  }
</style>
