<template>
  <li class="m-tags-list__item" v-bind:key="tag.id">
    <a class="m-tags-list__link" v-bind:href="route">{{ tag.handle }}</a>
  </li>
</template>

<script>
export default {
  props: ['tag'],
  computed: {
    route: function () {
      return `#${this.tag.url}`
    }
  }
}
</script>
