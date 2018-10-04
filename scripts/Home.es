/* global Vue */

Vue.component('folders-item', {
  props: ['folder'],
  template: `<li class="m-folders-list__item">
    <a class="m-folders-list__link" 
      v-bind:href="'#/folders/' + folder.name"
      v-on:click="selectFolder">
      {{ folder.name }}
    </a>
  </li>`,
  methods: {
    selectFolder (event) {
      let cssClassNames = {
        foldersListItem: 'm-folders-list__item',
        isActive: 'is-active'
      }

      document.querySelectorAll(`.${cssClassNames.foldersListItem}`).forEach(function (el) {
        el.classList.remove(cssClassNames.isActive)
      })
      event.target.parentNode.classList.add(cssClassNames.isActive)
      // TODO: emit event to refresh notes
    }
  }
})

Vue.component('tags-item', {
  props: ['tag'],
  template: `<li class="m-folders-list__item">
    <a class="m-folders-list__link" v-bind:href="'#/tags/' + tag.handle">{{ tag.handle }}</a>
  </li>`
})

Vue.component('note', {
  props: ['note'],
  template: `<div class="m-note">
    <p class="m-note__title">{{ note.title }}</p>
    <p class="m-note__updated">{{ note.updated_at }}</p>
  </div>`
})

Vue.component('notes-item', {
  props: ['note'],
  template: `<li class="m-notes-list__item">
    <note v-bind:note="note"></note>
  </li>`
})

var notesApp = new Vue({  // eslint-disable-line no-unused-vars
  el: '#notes-app',
  data: {
    foldersList: [],
    tagsList: [],
    selectedFolder: 'Default',
    notesList: [
      { id: 1, title: 'Hello World', updated_at: 'Oct. 4, 2018, 10:39 a.m.' }
    ]
  },
  methods: {
    refreshFolders (resource) {
      this.$http.get('/folders').then((response) => {
        this.foldersList = response.data
      })
    },
    refreshTags (resource) {
      this.$http.get('/tags').then((response) => {
        this.tagsList = response.data
      })
    },
    selectFolder (resource) {
      console.log(this, resource)
    }
  },
  beforeMount () {
    this.refreshFolders()
    this.refreshTags()
  }
})
