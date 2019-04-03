<template>
  <li class="m-folders-list__item" v-bind:class="{'is-active': isActive}">
    <a class="m-folders-list__link" v-bind:href="route" v-on:click="selectFolder">{{ folder.name }}</a>
  </li>
</template>

<script>
export default {
  props: [
    'folder',
    'selectedFolder'
  ],
  computed: {
    isActive: function () {
      return this.folder.name === this.selectedFolder
    },
    route: function () {
      return `#${this.folder.url}`
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

