<!--
 * @Descripttion: 
 * @version: 
 * @Author: June
 * @Date: 2023-03-19 20:10:11
 * @LastEditors: June
 * @LastEditTime: 2023-05-12 22:58:54
-->
<template>
  <GradientControls :type="state.gradientType" :change-gradient-control="changeGradientControl" />
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

<script lang="ts" setup>
  import { reactive, onMounted, onBeforeUnmount } from 'vue'
  import GradientControls from './GradientControls/index.vue'
  import Preview from '../Preview/index.vue'
  import Area from '../Area/index.vue'
  import { clamp } from '@vueuse/core'
  import { ColorPoint, Mode, ColorType } from '@/components/colorPicker/interface'
  import { Color, RGBA } from '@/utils/color'

  interface Iprops {
    mode: Mode
    type: ColorType
    points: ColorPoint[]
    onStartChange: (data: { points: ColorPoint[]; type: ColorType }) => void
    onChange: (data: { points: ColorPoint[]; type: ColorType }) => void
    onEndChange: (data: { points: ColorPoint[]; type: ColorType }) => void
  }

  const props = defineProps<Iprops>()

  const state = reactive({
    activePointIndex: 0,
    gradientPoints: props.points,
    activePoint: props.points[0],
    colorRed: props.points[0].red,
    colorGreen: props.points[0].green,
    colorBlue: props.points[0].blue,
    colorAlpha: props.points[0].alpha,
    colorHue: 0,
    colorSaturation: 1,
    colorValue: 1,
    gradientType: props.type,
    actions: {
      onStartChange: props.onStartChange,
      onChange: props.onChange,
      onEndChange: props.onEndChange,
    },
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

  const keyUpHandler = (event) => {
    if (event.keyCode === 46 || event.keyCode === 8) {
      removePoint(state.activePointIndex)
    }
  }

  const changeActivePointIndex = (index) => {
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
    actionName = 'onChange',
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

    const action = state.actions[actionName]

    action && action(getChangeData())
  }

  const updateGradientLeft = (left, index, actionName = 'onChange') => {
    state.gradientPoints[index].left = clamp(left, 0, 100)

    const action = state.actions[actionName]

    action && action(getChangeData())
  }

  const addPoint = (left) => {
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
