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

<style lang="scss">
@import './scss/_theme.scss';

.m-folders-list {
  $class-name: m-folders-list;
  margin: 0 0 1.2em 0;
  padding: 0;
  color: $folders-list-txt-color;
  list-style: none;

  &__item {
    box-shadow: 0 1px 1px -1px black, inset 0 -1px 1px -1px rgba(255, 255, 255, 0.65);
    cursor: pointer;

    &:last-child {
      box-shadow: none;
    }

    &:hover {
      background-color: transparentize($color: $folders-list-item-active-bg, $amount: 0.5);
      text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
    }

    &:active,
    &.is-active {
      background-color: $folders-list-item-active-bg;
      text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
    }

    &.is-disabled {
      color: transparentize($color: $folders-list-txt-color, $amount: 0.5);
      user-select: none;

      &:hover {
        background-color: transparent;
        text-shadow: none;
      }
    }
  }

  &__link {
    padding: 12px 25px;
    text-indent: 4px;
    color: $folders-list-txt-color !important;
    text-decoration: none;
    display: block;

    .#{$class-name}__item.is-disabled & {
      cursor: default;
    }
  }

  &--tags {
    .#{$class-name}__link::before {
      content: '#';
      padding-right: 5px;
    }

    .#{$class-name}__item.is-disabled .#{$class-name}__link::before {
      content: '';
      padding-right: 0;
    }
  }
}
</style>
