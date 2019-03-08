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

