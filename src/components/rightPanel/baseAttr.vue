<script setup lang="ts">
  import { useFabricEvent } from '@/hooks/useFabricEvent'
  import { useFabricObject } from '@/hooks/useFabricObject'
  import { isDefined } from '@vueuse/core'
  import { fabric } from '@/types'
  import SwipeNumber from '@/components/swipeNumber'
  import SvgIcon from '@/components/svgIcon'
  import { clampAngle, toFixed } from '@/utils/math'
  import { useEditorModules } from '@/editor'

  const { canvas } = useEditorModules()

  const attrs = computed(() => {
    if (!isDefined(canvas.activeObject)) return {} as fabric.Object
    return new Proxy(canvas.activeObject.value, {
      get(target, key) {
        return Reflect.get(target, key)
      },
      set(target, key: keyof fabric.Object, value, receiver) {
        let result = true
        switch (key) {
          case 'angle':
            target.rotate(toFixed(clampAngle(value)))
            break
          default:
            result = Reflect.set(target, key, value, receiver)
            break
        }
        triggerRef(attrs)
        canvas.requestRenderAll()
        return result
      },
    })
  })

  const useScale = (xy: 'x' | 'y') => {
    if (!isDefined(canvas.activeObject)) return
    const { getHeight, getWidth, setHeight, setWidth } = useFabricObject(canvas.activeObject)
    const model = computed(() => {
      return xy === 'x' ? getWidth() : getHeight()
    })
    const change = (value?: number) => {
      if (!isDefined(value)) return
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
    'object:moving': () => triggerRef(attrs),
    'object:rotating': () => triggerRef(attrs),
    'object:modified': () => triggerRef(attrs),
  })
</script>

<template>
  <div class="p2" v-if="canvas.activeObject">
    <a-row :gutter="[4, 4]">
      <a-col :span="10">
        <SwipeNumber label="X" v-model="attrs.left" />
      </a-col>
      <a-col :span="10">
        <SwipeNumber label="Y" v-model="attrs.top" />
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
        <SwipeNumber v-model="attrs.angle">
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
