<template>
  <li class="m-notes-list__item">
    <div
      class="m-note"
      v-bind:slug="note.slug"
      v-bind:url="note.url"
      v-bind:class="{'is-active': isActive}"
      v-on:click="selectNote"
    >
      <p class="m-note__title">{{ note.title }}</p>
      <p class="m-note__updated">{{ note.updated_at }}</p>
    </div>
  </li>
</template>
<script>
export default {
  props: [
    'note',
    'selectedNote'
  ],
  computed: {
    isActive: function () {
      return this.note.slug === this.selectedNote
    }
  },
  methods: {
    selectNote (event) {
      let cssClassNames = {
        note: 'm-note',
        isActive: 'is-active'
      }

      let curNote = event.currentTarget
      document.querySelectorAll(`.${cssClassNames.note}`).forEach(function (el) {
        el.classList.remove(cssClassNames.isActive)
      })
      curNote.classList.add(cssClassNames.isActive)

      let url = curNote.getAttribute('url')
      let noteRoute = `#${url}`

      if (window.location.hash === noteRoute) {
        this.$emit('slide-to-mobile-panel', 'note-detail')
        return
      }

      window.location.hash = noteRoute
    }
  }
}
</script>
<style lang="scss">
@import './scss/_theme.scss';

.m-notes-list {
  &__item {
    border-bottom: 1px solid $note-border-color;

    &:first-child {
      border-top: 1px solid $note-border-color;
    }
  }
}

.m-note {
  $class-name: m-note;
  padding: 12px 25px;
  cursor: pointer;

  &__title {
    margin-top: 0px;
    margin-bottom: 0px;
    font-size: 1em;
    letter-spacing: -0.004em;
    line-height: 1.2;
  }

  &__updated {
    margin-top: 0.7em;
    margin-bottom: 0;
    font-size: 0.87em;
    letter-spacing: 0.001em;
    color: $note-updated-txt-color;
  }

  &:hover {
    background-color: transparentize($color: $note-active-bg-color, $amount: 0.75);
  }

  &.is-active {
    color: $note-active-txt-color;
    background-color: $note-active-bg-color;

    .#{$class-name}__title {
      font-weight: bold;
    }

    .#{$class-name}__updated {
      color: $note-active-updated-txt-color;
    }
  }
}
</style>
