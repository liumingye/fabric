<template>
  <a-button @click="addImage">添加组件</a-button>

</template>

<script setup>
import {useEditor} from "@/app";
import {Rect} from "fabric";
import {useFabricEvent} from "@/hooks/useFabricEvent";

const {canvas,undoRedo}=useEditor()

function addImage() {
  const rect=new Rect({
    top:500,
    left:500,
    width:100,
    height:100,
    fill:"#548af7",
    test:{
      test:"message",
      test1:"message2"
    }
  })
  canvas.add(rect)
  canvas.setActiveObject(rect); // 将矩形设置为活动对象
  canvas.renderAll();
  undoRedo.saveState()
  console.log(canvas.activeObject.value)
}

useFabricEvent({
  "selection:created":()=>{
    console.log(canvas.activeObject.value)
  }
})

</script>

<style scoped lang="less">

</style>