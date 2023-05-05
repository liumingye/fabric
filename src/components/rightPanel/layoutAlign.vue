<script setup lang="ts">
  import svgIcon from '../svgIcon/svgIcon.vue'
  const alignList = [
    {
      name: 'horizontalLeft',
      icon: 'bxs-objects-horizontal-left',
      tip: '左对齐',
    },
    {
      name: 'horizontalCenter',
      icon: 'bxs-objects-horizontal-center',
      tip: '水平居中对齐',
    },
    {
      name: 'horizontalRight',
      icon: 'bxs-objects-horizontal-right',
      tip: '左对齐',
    },
    {
      name: 'verticalLeft',
      icon: 'bxs-objects-vertical-top',
      tip: '顶对齐',
    },
    {
      name: 'verticalCenter',
      icon: 'bxs-objects-vertical-center',
      tip: '垂直居中对齐',
    },
    {
      name: 'verticalRight',
      icon: 'bxs-objects-vertical-bottom',
      tip: '底对齐',
    },
    {
      name: 'menu',
      icon: 'bxs-grid',
    },
  ]
</script>

<template>
  <a-row :wrap="false" class="p2" justify="space-between" align="center">
    <a-col flex="none" v-for="align in alignList" :key="align.name">
      <a-tooltip
        mini
        position="bottom"
        :content="align.tip"
        :enabled="!align.tip"
        :popupVisible="align.tip ? undefined : false"
      >
        <a-button class="button" size="small">
          <template #icon>
            <svgIcon :name="align.icon" />
          </template>
        </a-button>
      </a-tooltip>
    </a-col>
  </a-row>
</template>

<style scoped lang="less"></style>
