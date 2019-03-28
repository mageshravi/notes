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

<style lang="scss">
.m-tags-list {
  margin: 0;
  padding: 0;
  font-size: 0.87em;
  letter-spacing: 0.001em;
  list-style: none;
  display: flex;
  flex-wrap: wrap;

  &__item {
    & + & {
      margin-left: 15px;
    }
  }

  &__link {
    text-decoration: none;
    display: block;
    border-radius: 4px;

    &:hover {
      text-decoration: underline;
    }

    &:focus {
      outline: 1px dotted gray;
    }

    &::before {
      content: '#';
      padding-right: 1px;
      float: left;
    }
  }

  &--inline {
    display: inline-flex;
  }
}
</style>
