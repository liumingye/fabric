<script setup lang="ts">
  import { useFabricEvent } from '@/hooks/useFabricEvent'
  import { useFabricObject } from '@/hooks/useFabricObject'
  import { isDefined } from '@vueuse/core'
  import SwipeNumber from '@/components/swipeNumber'
  import SvgIcon from '@/components/svgIcon'
  import { useEditorServices } from '@/editor'
  import { useActiveObjectModel } from '@/hooks/useActiveObjectModel'

  const { canvas } = useEditorServices()

  const useScale = (xy: 'x' | 'y') => {
    if (!isDefined(canvas.activeObject)) return
    const { getHeight, getWidth, setHeight, setWidth } = useFabricObject(canvas.activeObject)
    const model = computed(() => {
      return xy === 'x' ? getWidth() : getHeight()
    })
    const change = (value?: number) => {
      if (!isDefined(value) || !isDefined(canvas.activeObject)) return
      const fn = xy === 'x' ? setWidth : setHeight
      fn(value)
      scale.effect.scheduler?.()
      canvas.requestRenderAll()
    }
    return { model, change }
  }

  const scale = computed(() => ({
    x: useScale('x'),
    y: useScale('y'),
  }))

  useFabricEvent({
    'object:skewing': () => scale.effect.scheduler?.(),
    'object:scaling': () => scale.effect.scheduler?.(),
    'object:resizing': () => scale.effect.scheduler?.(),
  })

  const left = useActiveObjectModel('left')
  const top = useActiveObjectModel('top')
  const angle = useActiveObjectModel('angle')
</script>

<template>
  <div class="p2" v-if="canvas.activeObject.value">
    <a-row :gutter="[4, 4]">
      <a-col :span="10">
        <SwipeNumber label="X" v-model="left" @change="canvas.requestRenderAll()" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber label="Y" v-model="top" @change="canvas.requestRenderAll()" />
      </a-col>
      <a-col :span="10" v-if="scale.x">
        <SwipeNumber
          label="W"
          :modelValue="scale.x.model.value"
          :min="1"
          @change="scale.x.change"
        />
      </a-col>
      <a-col :span="10" v-if="scale.y">
        <SwipeNumber
          label="H"
          :modelValue="scale.y.model.value"
          :min="1"
          @change="scale.y.change"
        />
      </a-col>
      <a-col :span="10">
        <SwipeNumber v-model="angle" @change="canvas.requestRenderAll()">
          <template #label>
            <SvgIcon name="bx-revision" />
          </template>
          <template #suffix>
            <div class="absolute top-0 right-1">°</div>
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
