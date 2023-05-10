<script setup lang="ts"></script>

<template>
  <a-config-provider>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </a-config-provider>
</template>

<style scoped lang="less"></style>
