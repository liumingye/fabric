<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title: string
      hiddenAdd?: boolean
      disableAdd?: boolean
    }>(),
    {
      hiddenAdd: false,
      disableAdd: false,
    },
  )

  const emit = defineEmits<{
    (e: 'clickAdd', ev: MouseEvent): void
  }>()

  const clickAdd = (ev: MouseEvent) => {
    if (props.disableAdd) return
    emit('clickAdd', ev)
  }
</script>

<template>
  <div class="p2">
    <div
      class="h28px mb1 font-bold text-xs flex justify-between items-center"
      :class="{
        gray: !disableAdd && !hiddenAdd,
      }"
      @click.self="clickAdd"
    >
      <span>{{ title }}</span>
      <div>
        <slot name="actions"></slot>
        <a-button
          v-if="!hiddenAdd"
          :disabled="disableAdd"
          size="small"
          class="icon-btn"
          @click="clickAdd"
        >
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
      </div>
    </div>
    <slot v-if="disableAdd || hiddenAdd"></slot>
  </div>
</template>

<style lang="less" scoped>
  .gray {
    color: var(--color-text-3);

    &:hover {
      color: var(--color-text-1);
    }
  }
</style>
