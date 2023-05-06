<script setup lang="ts">
  import { useFabricEvent } from '@/hooks/useFabricEvent'
  import { useFabricObject } from '@/hooks/useFabricObject'
  import { useCanvasStore } from '@/store'
  import { isDefined } from '@vueuse/core'
  import type * as editor from 'editor'
  import SwipeNumber from '@/components/swipeNumber'

  const { canvas, activeObject } = storeToRefs(useCanvasStore())

  const attrs = computed(() => {
    return new Proxy(activeObject.value!, {
      get(target, key) {
        return Reflect.get(target, key)
      },
      set(target, key: keyof editor.fabric.Object, value, receiver) {
        const result = Reflect.set(target, key, value, receiver)
        canvas.value.renderAll()
        return result
      },
    })
  })

  const useScale = (xy: 'x' | 'y') => {
    const target = activeObject.value!
    const { getHeight, getWidth, setHeight, setWidth } = useFabricObject(target)
    const model = computed(() => {
      const size = xy === 'x' ? getHeight() : getWidth()
      return Number(size.toFixed(2))
    })
    const change = (value?: number) => {
      if (!isDefined(value)) return
      const fn = xy === 'x' ? setHeight : setWidth
      fn(value)
      canvas.value.requestRenderAll()
    }
    return { model, change }
  }

  const scale = computed(() => {
    return {
      x: useScale('x'),
      y: useScale('y'),
    }
  })

  useFabricEvent({
    'object:moving': () => triggerRef(attrs),
    'object:scaling': () => scale.effect.scheduler?.(),
    'object:rotating': () => triggerRef(attrs),
    'object:modified': () => triggerRef(attrs),
  })
</script>

<template>
  <div class="p2" v-if="activeObject">
    <a-row :gutter="[4, 4]">
      <a-col :span="10">
        <SwipeNumber label="X" v-model="attrs.left" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber label="Y" v-model="attrs.top" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber
          label="W"
          :modelValue="scale.x.model.value"
          :min="1"
          @change="scale.x.change"
        />
      </a-col>
      <a-col :span="10">
        <SwipeNumber
          label="H"
          :modelValue="scale.y.model.value"
          :min="1"
          @change="scale.y.change"
        />
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="less"></style>
