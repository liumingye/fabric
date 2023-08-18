<!--
 * @Descripttion: 
 * @version: 
 * @Author: June
 * @Date: 2023-03-19 20:10:11
 * @LastEditors: June
 * @LastEditTime: 2023-05-12 22:58:54
-->
<template>
  <GradientControls
    v-if="!solidColor"
    :type="state.gradientType"
    :change-gradient-control="changeGradientControl"
  />

  <template v-if="state.gradientType === 'pattern'">
    <a-button @click="addImg">添加图片</a-button>
    <div>
      <a-select v-model="fit">
        <a-option value="fill">填充</a-option>
        <a-option value="padding">适应</a-option>
        <a-option value="clip">裁剪</a-option>
        <!-- <a-option value="repeat">平铺</a-option> -->
      </a-select>
    </div>
  </template>
  <template v-else>
    <Area
      :red="state.colorRed"
      :green="state.colorGreen"
      :blue="state.colorBlue"
      :alpha="state.colorAlpha"
      :hue="state.colorHue"
      :saturation="state.colorSaturation"
      :value="state.colorValue"
      :update-color="updateColor"
      :is-gradient="true"
      :type="state.gradientType"
      :points="state.gradientPoints"
      :active-point-index="state.activePointIndex"
      :change-gradient-control="changeGradientControl"
      :change-active-point-index="changeActivePointIndex"
      :update-gradient-left="updateGradientLeft"
      :add-point="addPoint"
      :remove-point="removePoint"
    />
    <Preview
      :red="state.colorRed"
      :green="state.colorGreen"
      :blue="state.colorBlue"
      :alpha="state.colorAlpha"
      :update-color="updateColor"
      :mode="mode"
    />
  </template>
</template>

<script lang="ts" setup>
  import { reactive, onMounted, onBeforeUnmount } from 'vue'
  import GradientControls from './GradientControls/index.vue'
  import Preview from '../Preview/index.vue'
  import Area from '../Area/index.vue'
  import { clamp } from '@vueuse/core'
  import { ColorType, Props } from '@/components/colorPicker/interface'
  import { Color, RGBA } from '@/utils/color'
  import { useActiveObjectModel } from '@/hooks/useActiveObjectModel'
  import { useEditor } from '@/app'
  import { util } from '@fabric'
  import {Pattern} from "fabric";

  const { canvas, undoRedo } = useEditor()

  const fill = useActiveObjectModel('fill')
  const fit = computed({
    get() {
      if (util.isPattern(fill.value.modelValue)) {
        return fill.value.modelValue.fit
      }
    },
    set(value) {
      if (util.isPattern(fill.value.modelValue) && value) {
        fill.value.modelValue.fit = value
        canvas.activeObject.value?._set('dirty', true)
        canvas.requestRenderAll()
        undoRedo.saveState()
      }
    },
  })

  //添加图片作为填充
  const addImg = () => {
    util
      .loadImage(
        'https://img.js.design/assets/img/6486fff21a74fef8078bf782.jpg#4d6a3f65b147c75a22effca8347bc5ce',
        { crossOrigin: 'anonymous' })
        .then((image)=>{
          // console.log(canvas.activeObject.value)
          let shape = canvas.activeObject.value
          shape.fill=new Pattern({
            crossOrigin: 'anonymous',
            source: image,
            fit: 'fill',
          })
          shape.set('dirty', true)
          canvas.requestRenderAll()
        })
  }


  const props = defineProps<Required<Props>>()

  const state = reactive({
    activePointIndex: 0,
    gradientPoints: props.gradient.points,
    activePoint: props.gradient.points[0],
    colorRed: props.gradient.points[0].red,
    colorGreen: props.gradient.points[0].green,
    colorBlue: props.gradient.points[0].blue,
    colorAlpha: props.gradient.points[0].alpha,
    colorHue: 0,
    colorSaturation: 1,
    colorValue: 1,
    gradientType: props.gradient.type,
  })

  const getChangeData = () => ({
    points:
      state.gradientType === 'color'
        ? [state.gradientPoints[state.activePointIndex]]
        : state.gradientPoints,
    type: state.gradientType,
    // style: generateGradientStyle(state.gradientPoints, state.gradientType),
  })

  const onChange = () => {
    props.onChange && props.onChange(getChangeData())
  }

  const removePoint = (index = state.activePointIndex) => {
    if (state.gradientPoints.length <= 2) {
      return
    }

    state.gradientPoints.splice(index, 1)

    if (index > 0) {
      state.activePointIndex = index - 1
    }

    onChange()
  }

  const keyUpHandler = (event: KeyboardEvent) => {
    if (event.keyCode === 46 || event.keyCode === 8) {
      removePoint(state.activePointIndex)
    }
  }

  const changeActivePointIndex = (index: number) => {
    state.activePointIndex = index
    state.activePoint = state.gradientPoints[index]
    const { red, green, blue, alpha } = state.activePoint
    state.colorRed = red
    state.colorGreen = green
    state.colorBlue = blue
    state.colorAlpha = alpha

    const color = new Color(new RGBA(red, green, blue, 1))
    const { h, s, v } = color.hsva

    state.colorHue = h
    state.colorSaturation = s
    state.colorValue = v
  }

  const changeGradientControl = (type: ColorType) => {
    type = type ?? state.gradientType

    state.gradientType = type

    onChange()
  }

  const updateColor = (
    {
      r,
      g,
      b,
      a,
      hue,
      saturation,
      value,
    }: {
      r?: number
      g?: number
      b?: number
      a?: number
      hue?: number
      saturation?: number
      value?: number
    },
    actionName: 'onStartChange' | 'onChange' | 'onEndChange' = 'onChange',
  ) => {
    r = r ?? state.colorRed
    g = g ?? state.colorGreen
    b = b ?? state.colorBlue
    a = a ?? state.colorAlpha
    hue = hue ?? state.colorHue
    saturation = saturation ?? state.colorSaturation
    value = value ?? state.colorValue

    const localGradientPoints = state.gradientPoints.slice()

    localGradientPoints[state.activePointIndex] = {
      ...localGradientPoints[state.activePointIndex],
      red: r,
      green: g,
      blue: b,
      alpha: a,
    }

    state.colorRed = r
    state.colorGreen = g
    state.colorBlue = b
    state.colorAlpha = a
    state.colorHue = hue
    state.colorSaturation = saturation
    state.colorValue = value
    state.gradientPoints = localGradientPoints

    const action = props[actionName]

    action && action(getChangeData())
  }

  const updateGradientLeft = (
    left: number,
    index: number,
    actionName: 'onStartChange' | 'onChange' | 'onEndChange' = 'onChange',
  ) => {
    state.gradientPoints[index].left = clamp(left, 0, 100)

    const action = props[actionName]

    action && action(getChangeData())
  }

  const addPoint = (left: number) => {
    left = clamp(left, 0, 100)
    state.gradientPoints.push({
      ...state.gradientPoints[state.activePointIndex],
      left,
      // todo
      alpha: 1,
    })

    state.activePointIndex = state.gradientPoints.length - 1

    onChange()
  }

  onMounted(() => {
    const color = new Color(new RGBA(state.colorRed, state.colorGreen, state.colorBlue, 1))
    const { h, s, v } = color.hsva

    state.colorHue = h
    state.colorSaturation = s
    state.colorValue = v
    document.addEventListener('keyup', keyUpHandler)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keyup', keyUpHandler)
  })
</script>
