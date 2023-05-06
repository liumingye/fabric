<template>
  <div class="key">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
  .key {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 4px;
    // color: var(--color-text-1);
    font-size: 12px;
    background-color: var(--color-fill-3);
    border: 1px solid var(--border);
    border-radius: 3px;
    box-shadow: 0 1px rgba(var(--gray-9), 0.18);
  }
</style>
