<template>
  <ul class="m-folders-list" v-if="notEmptyFoldersList">
    <folder-item
      v-for="folder in foldersList"
      v-bind:folder="folder"
      v-bind:selected-folder="selectedFolder"
      v-bind:key="folder.id"
      v-on:slide-to-mobile-panel="slideToMobilePanel"
    ></folder-item>
  </ul>
  <ul class="m-folders-list" v-else>
    <li class="m-folders-list__item is-disabled">
      <span class="m-folders-list__link">No folders</span>
    </li>
  </ul>
</template>

<script>
import FolderItem from './FolderItem.vue'

export default {
  props: [
    'foldersList',
    'selectedFolder'
  ],
  components: {
    FolderItem
  },
  computed: {
    notEmptyFoldersList: function () {
      return Boolean(this.foldersList.length)
    }
  },
  methods: {
    slideToMobilePanel (area) {
      this.$emit('slide-to-mobile-panel', area)
    }
  }
}
</script>
