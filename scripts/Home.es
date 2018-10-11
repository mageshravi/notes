/* global Vue */
/* global hljs */

Vue.component('folders-item', {
  props: [
    'folder',
    'selectedFolder'
  ],
  template: `
  <li class="m-folders-list__item"
      v-bind:class="{'is-active': isActive}">
    <a class="m-folders-list__link" 
      v-bind:href="'#/folders/' + folder.name"
      v-on:click="selectFolder">
      {{ folder.name }}
    </a>
  </li>`,
  computed: {
    isActive: function () {
      return this.folder.name === this.selectedFolder
    }
  },
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
      // tell parent to refresh notes
      this.$emit('folder-change', event.target.innerText)
    }
  }
})

Vue.component('tags-item', {
  props: ['tag'],
  template: `
  <li class="m-folders-list__item">
    <a class="m-folders-list__link" v-bind:href="'#/tags/' + tag.handle">{{ tag.handle }}</a>
  </li>`
})

Vue.component('notes-item', {
  props: [
    'note',
    'selectedNote'
  ],
  template: `
  <li class="m-notes-list__item">
    <div class="m-note"
        v-bind:slug="note.slug"
        v-bind:class="{'is-active': isActive}"
        v-on:click="selectNote">
      <p class="m-note__title">{{ note.title }}</p>
      <p class="m-note__updated">{{ note.updated_at }}</p>
    </div>
  </li>`,
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

      let slug = curNote.getAttribute('slug')
      window.location.hash = `#/${slug}`

      // tell parent to refresh note-detail
      this.$emit('note-change', slug)
    }
  }
})

Vue.component('note-detail', {
  props: ['note'],
  template: `
  <div class="m-note-detail" v-if="note">
      <h1>{{ note.title }}</h1>
      <span v-for="tag in note.tags"
            v-bind:tag="tag"
            v-bind:key="tag.id">
          {{ tag.handle }}
      </span>
      <hr>
      <div v-html="note.content"></div>
  </div>`,
  updated: function () {
    document.querySelectorAll('.m-note-detail pre code').forEach(function (el) {
      hljs.highlightBlock(el)
    })
  }
})

var notesApp = new Vue({  // eslint-disable-line no-unused-vars
  el: '#notes-app',
  data: {
    foldersList: [],
    tagsList: [],
    notesList: [],
    noteDetail: false,
    selectedFolder: false,
    selectedNote: false
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
    refreshNotes (folderName) {
      folderName = encodeURIComponent(folderName)
      this.$http.get(`/folders/${folderName}`).then((response) => {
        this.notesList = response.data
      })
    },
    folderChangeHandler (folderName) {
      this.selectedFolder = folderName
      this.selectedNote = false
      this.noteDetail = false
      this.refreshNotes(folderName)
    },
    noteChangeHandler (noteSlug) {
      this.$http.get(`/notes/${noteSlug}`).then((response) => {
        this.noteDetail = response.data
      })
    },
    slideToMobileFocusArea (area) {
      if (window.innerWidth > 768) {
        return
      }

      switch (area) {
        case 'folders-list':
          document.querySelector('.l-wrapper').style.marginLeft = 0
          break

        case 'notes-list':
          document.querySelector('.l-wrapper').style.marginLeft = '-100vw'
          break

        case 'note-detail':
          document.querySelector('.l-wrapper').style.marginLeft = '-200vw'
          break
      }
    },
    init () {
      this.refreshFolders()
      this.refreshTags()

      if (!window.location.hash) {
        // no hash provided = home page

        this.$http.get('/folders').then((response) => {
          this.foldersList = response.data

          if (!this.foldersList.length) {
            return
          }

          // get notes in first folder
          let folderName = this.foldersList[0].name
          this.selectedFolder = folderName
          this.$http.get(`/folders/${folderName}`).then((response) => {
            this.notesList = response.data
            if (this.notesList.length) {
              // get the first note
              let firstNoteSlug = this.notesList[0].slug
              this.selectedNote = firstNoteSlug
              this.noteChangeHandler(firstNoteSlug)
            }

            this.slideToMobileFocusArea('folders-list')
          })
        })

        return
      }

      let foldersPattern = /^#\/folders\/([^/]+)\/?$/
      let foldersMatch = window.location.hash.match(foldersPattern)
      if (foldersMatch) {
        let folderName = foldersMatch[1]
        this.folderChangeHandler(folderName)
        this.slideToMobileFocusArea('notes-list')
        return
      }

      let notePattern = /^#\/([^/]+)\/?$/
      let noteMatch = window.location.hash.match(notePattern)
      if (noteMatch) {
        let noteSlug = noteMatch[1]

        // fetch note-detail
        this.$http.get(`/notes/${noteSlug}`).then((response) => {
          this.noteDetail = response.data
          this.selectedNote = this.noteDetail.slug
          let folderName = this.noteDetail.folder.name
          this.selectedFolder = folderName

          // fetch other notes in same folder
          this.$http.get(`/folders/${folderName}`).then((response) => {
            this.notesList = response.data
            this.slideToMobileFocusArea('note-detail')
          })
        })
      }
    }
  },
  beforeMount () {
    this.init()
  }
})

window.onhashchange = function (ev) {
  notesApp.init()
}
