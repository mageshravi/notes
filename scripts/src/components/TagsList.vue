<template>
  <ul class="m-folders-list m-folders-list--tags" v-if="notEmptyTagsList">
    <tags-folder-item
      v-for="tag in tagsList"
      v-bind:tag="tag"
      v-bind:selected-tag="selectedTag"
      v-bind:key="tag.id"
      v-on:slide-to-mobile-panel="slideToMobilePanel"
    ></tags-folder-item>
  </ul>
  <ul class="m-folders-list m-folders-list--tags" v-else>
    <li class="m-folders-list__item is-disabled">
      <span class="m-folders-list__link">No tags</span>
    </li>
  </ul>
</template>

<script>
import TagsFolderItem from "./TagsFolderItem.vue";

export default {
  props: ["tagsList", "selectedTag"],
  components: {
    TagsFolderItem
  },
  computed: {
    notEmptyTagsList: function() {
      return Boolean(this.tagsList.length);
    }
  },
  methods: {
    slideToMobilePanel(area) {
      this.$emit("slide-to-mobile-panel", area);
    }
  }
};
</script>
