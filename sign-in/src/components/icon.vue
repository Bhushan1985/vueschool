<template>
  <svg :class="name"><use :href="icon_location" /></svg>
</template>
<script setup>
  import { computed } from 'vue'
  import icons from '@/style/icons.svg'
  const props = defineProps({
    name: {
      type: String,
      required: true
    }
  })
  const icon_location = computed(() => {
    return `${icons}#${props.name}`
  })
</script>
