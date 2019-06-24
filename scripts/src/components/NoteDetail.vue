<template>
  <div class="m-note-detail" v-if="note">
    <a
      class="m-note-detail__notes-list-link"
      v-if="selectedTag"
      v-bind:href="route"
      v-on:click="slideToNotesListInMobileView"
    >
      <i class="fa fa-angle-left" aria-hidden="true"></i>
      #{{ selectedTag }}
    </a>
    <a
      class="m-note-detail__notes-list-link"
      v-else
      v-bind:href="route"
      v-on:click="slideToNotesListInMobileView"
    >
      <i class="fa fa-angle-left" aria-hidden="true"></i>
      {{ note.folder.name }}
    </a>
    <h1>{{ note.title }}</h1>
    <ul class="m-tags-list">
      <note-tag v-for="tag in note.tags" v-bind:tag="tag" v-bind:key="tag.id"></note-tag>
    </ul>
    <hr>
    <div v-html="note.content"></div>
  </div>
</template>

<script>
import NoteTag from "./NoteTag.vue";

export default {
  props: ["note", "selectedTag"],
  components: {
      NoteTag
  },
  computed: {
    route: function() {
      return `#${this.note.folder.url}`;
    }
  },
  updated: function() {
    document.querySelectorAll(".m-note-detail pre code").forEach(function(el) {
      /* global hljs */
      hljs.highlightBlock(el);
    });
  },
  methods: {
    slideToNotesListInMobileView: function(ev) {
      ev.preventDefault();
      this.$emit("slide-to-mobile-panel", "notes-list");
      return false;
    }
  }
};
</script>
<style lang="scss">
@import './scss/_theme.scss';

.m-note-detail {
  $class-name: m-note-detail;
  padding: 12px 25px;

  &__notes-list-link {
    text-decoration: none;
  }

  p code {
    padding: 0 3px;
    background-color: $inline-code-bg-color;
    border-radius: 2px;
    display: inline;
  }

  code.hljs {
    border-radius: 4px;
  }

  @media (min-width: 768px) {
    .#{$class-name}__notes-list-link {
      display: none;
    }
  }
}
</style>

