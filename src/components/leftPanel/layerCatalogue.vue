<script setup lang="ts">
  const treeData = [
    {
      title: 'Trunk 0-0',
      key: '0-0',
      children: [
        {
          title: 'Branch 0-0-0',
          key: '0-0-0',
          children: [
            {
              title: 'Leaf',
              key: '0-0-0-0',
            },
            {
              title: 'Leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'Branch 0-0-1',
          key: '0-0-1',
          children: [
            {
              title: 'Leaf',
              key: '0-0-1-0',
            },
          ],
        },
      ],
    },
  ]
</script>

<template>
  <a-split direction="vertical" min="40px" :default-size="0.3">
    <template #first>
      <a-tree blockNode :data="treeData" />
    </template>
    <template #second>
      <a-input-search style="margin-bottom: 8px; max-width: 240px" />
      <a-tree blockNode :data="treeData" />
    </template>
    <template #resize-trigger>
      <div class="h4 flex items-center">
        <a-divider :margin="0.01" />
      </div>
    </template>
  </a-split>
</template>

<style scoped lang="less"></style>
