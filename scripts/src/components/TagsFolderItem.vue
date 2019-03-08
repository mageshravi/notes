<template>
  <li class="m-folders-list__item" v-bind:class="{'is-active': isActive}">
    <a class="m-folders-list__link" v-bind:href="route" v-on:click="selectFolder">{{ tag.handle }}</a>
  </li>
</template>

<script>
export default {
  props: [
    'tag',
    'selectedTag'
  ],
  computed: {
    isActive: function () {
      return this.tag.handle === this.selectedTag
    },
    route: function () {
      return `#${this.tag.url}`
    }
  },
  methods: {
    selectFolder (ev) {
      let selectedFolder = ev.currentTarget.parentNode

      if (selectedFolder.classList.contains('is-active')) {
        ev.preventDefault()
        this.$emit('slide-to-mobile-panel', 'notes-list')
        return false
      }
    }
  }
}
</script>
