<template>
  <ul class="m-notes-list">
    <notes-item
      v-for="note in notesList"
      v-bind:note="note"
      v-bind:selected-note="selectedNote"
      v-bind:key="note.id"
      v-on:slide-to-mobile-panel="slideToMobilePanel"
    ></notes-item>
  </ul>
</template>

<script>
import NotesItem from "./NotesItem.vue";

export default {
  props: [
    "notesList",
    "selectedNote"
  ],
  components: {
    NotesItem,
  },
  methods: {
    slideToMobilePanel(area) {
      this.$emit('slide-to-mobile-panel', area);
    }
  }
};
</script>

<style lang="scss">
.m-notes-list {
  margin: 0;
  padding: 0;
  list-style: none;
  flex-grow: 1;
  overflow-y: auto;
}
</style>
