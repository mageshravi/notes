/* global Vue */
/* global hljs */

Vue.component('folder-item', {
  props: [
    'folder',
    'selectedFolder'
  ],
  template: `
  <li class="m-folders-list__item"
      v-bind:class="{'is-active': isActive}">
    <a class="m-folders-list__link"
       v-bind:href="route"
       v-on:click="selectFolder">
      {{ folder.name }}
    </a>
  </li>`,
  computed: {
    isActive: function () {
      return this.folder.name === this.selectedFolder
    },
    route: function () {
      return `#${this.folder.url}`
    }
  },
  methods: {
    selectFolder (ev) {
      let selectedFolder = ev.currentTarget.parentNode

      if (selectedFolder.classList.contains('is-active')) {
        ev.preventDefault()
        this.$emit('slide-to-mobile-panel', 'notes-list')
        return false
      }
    }
  }
})

Vue.component('tags-folder-item', {
  props: [
    'tag',
    'selectedTag'
  ],
  template: `
  <li class="m-folders-list__item"
      v-bind:class="{'is-active': isActive}">
    <a class="m-folders-list__link"
       v-bind:href="route"
       v-on:click="selectFolder">
      {{ tag.handle }}
    </a>
  </li>`,
  computed: {
    isActive: function () {
      return this.tag.handle === this.selectedTag
    },
    route: function () {
      return `#${this.tag.url}`
    }
  },
  methods: {
    selectFolder (ev) {
      let selectedFolder = ev.currentTarget.parentNode

      if (selectedFolder.classList.contains('is-active')) {
        ev.preventDefault()
        this.$emit('slide-to-mobile-panel', 'notes-list')
        return false
      }
    }
  }
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
        v-bind:url="note.url"
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

      let url = curNote.getAttribute('url')
      let noteRoute = `#${url}`

      if (window.location.hash === noteRoute) {
        this.$emit('slide-to-mobile-panel', 'note-detail')
        return
      }

      window.location.hash = noteRoute
    }
  }
})

Vue.component('note-tag', {
  props: ['tag'],
  template: `
  <li class="m-tags-list__item"
      v-bind:key="tag.id">
    <a class="m-tags-list__link"
       v-bind:href="route">{{ tag.handle }}</a>
  </li>
  `,
  computed: {
    route: function () {
      return `#${this.tag.url}`
    }
  }
})

Vue.component('note-detail', {
  props: [
    'note',
    'selectedTag'
  ],
  template: `
  <div class="m-note-detail" v-if="note">
      <a class="m-note-detail__notes-list-link"
         v-if="selectedTag"
         v-bind:href="route"
         v-on:click="slideToNotesListInMobileView"
         ><i class="fa fa-angle-left" aria-hidden="true"></i> #{{ selectedTag }}
      </a>
      <a class="m-note-detail__notes-list-link"
         v-else
         v-bind:href="route"
         v-on:click="slideToNotesListInMobileView"
         ><i class="fa fa-angle-left" aria-hidden="true"></i> {{ note.folder.name }}
      </a>
      <h1>{{ note.title }}</h1>
      <ul class="m-tags-list">
        <note-tag
          v-for="tag in note.tags"
          v-bind:tag="tag"
          v-bind:key="tag.id"></note-tag>
      </ul>
      <hr>
      <div v-html="note.content"></div>
  </div>`,
  computed: {
    route: function () {
      return `#${this.note.folder.url}`
    }
  },
  updated: function () {
    document.querySelectorAll('.m-note-detail pre code').forEach(function (el) {
      hljs.highlightBlock(el)
    })
  },
  methods: {
    slideToNotesListInMobileView: function (ev) {
      ev.preventDefault()
      this.$emit('slide-to-mobile-panel', 'notes-list')
      return false
    }
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
    selectedTag: false,
    selectedNote: false
  },
  computed: {
    notEmptyFoldersList: function () {
      return Boolean(this.foldersList.length)
    },
    notEmptyTagsList: function () {
      return Boolean(this.tagsList.length)
    }
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
    getNotesInFolder (folderName) {
      folderName = encodeURIComponent(folderName)
      this.$http.get(`/folders/${folderName}`).then((response) => {
        this.notesList = response.data
      })
    },
    getNotesWithTag (tagHandle) {
      tagHandle = encodeURIComponent(tagHandle)
      this.$http.get(`/tags/${tagHandle}`).then((response) => {
        this.notesList = response.data
      })
    },
    folderChangeHandler (folderName) {
      this.selectedFolder = folderName
      this.selectedTag = false
      this.selectedNote = false
      this.noteDetail = false
      this.getNotesInFolder(folderName)
    },
    tagChangeHandler (tagHandle) {
      this.selectedFolder = false
      this.selectedTag = tagHandle
      this.selectedNote = false
      this.noteDetail = false
      this.getNotesWithTag(tagHandle)
    },
    noteChangeHandler (noteSlug) {
      this.$http.get(`/notes/${noteSlug}`).then((response) => {
        this.noteDetail = response.data
      })
    },
    slideToFoldersListInMobileView (ev) {
      ev.preventDefault()
      this.slideToMobilePanel('folders-list')
      return false
    },
    slideToMobilePanel (area) {
      let wrapperEl = document.querySelector('.l-wrapper')

      switch (area) {
        case 'folders-list':
          wrapperEl.classList.add('folders-visible')
          wrapperEl.classList.remove('notes-list-visible')
          wrapperEl.classList.remove('note-detail-visible')
          break

        case 'notes-list':
          wrapperEl.classList.remove('folders-visible')
          wrapperEl.classList.add('notes-list-visible')
          wrapperEl.classList.remove('note-detail-visible')
          break

        case 'note-detail':
          wrapperEl.classList.remove('folders-visible')
          wrapperEl.classList.remove('notes-list-visible')
          wrapperEl.classList.add('note-detail-visible')
          break
      }
    },
    init () {
      if (!this.foldersList.length) {
        this.refreshFolders()
      }

      if (!this.tagsList.length) {
        this.refreshTags()
      }

      if (!window.location.hash) {
        this._noHashInit()  // no hash provided = home page
        return
      }

      let foldersPattern = /^#\/folders\/([^/]+)\/?$/
      let foldersMatch = window.location.hash.match(foldersPattern)
      if (foldersMatch) {
        let folderName = foldersMatch[1]
        this.folderChangeHandler(folderName)
        this.slideToMobilePanel('notes-list')
        return
      }

      let tagsPattern = /^#\/tags\/([^/]+)\/?$/
      let tagsMatch = window.location.hash.match(tagsPattern)
      if (tagsMatch) {
        let tagHandle = tagsMatch[1]
        this.tagChangeHandler(tagHandle)
        this.slideToMobilePanel('notes-list')
        return
      }

      let notePattern = /^#\/notes\/([^/]+)\/?$/
      let noteMatch = window.location.hash.match(notePattern)
      if (noteMatch) {
        let noteSlug = noteMatch[1]

        // fetch note-detail
        this.$http.get(`/notes/${noteSlug}`).then((response) => {
          this.noteDetail = response.data
          this.selectedNote = this.noteDetail.slug
          let folderName = this.noteDetail.folder.name
          let isParentFolderSelected = (folderName === this.selectedFolder)

          let isTagSelected = false
          for (let i = 0; i < this.noteDetail.tags.length; i++) {
            let curTag = this.noteDetail.tags[i]
            if (curTag.handle === this.selectedTag) {
              isTagSelected = true
            }
          }

          if (!isTagSelected) {
            this.selectedTag = false
          }

          if (!isParentFolderSelected && !isTagSelected) {
            this.selectedFolder = folderName

            // fetch other notes in same folder
            this.$http.get(`/folders/${folderName}`).then((response) => {
              this.notesList = response.data
              this.slideToMobilePanel('note-detail')
            })
          } else {
            this.slideToMobilePanel('note-detail')
          }
        })
      }
    },
    _noHashInit () {
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

          this.slideToMobilePanel('folders-list')
        })
      })
    }
  },
  beforeMount () {
    this.init()
  }
})

window.onhashchange = function (ev) {
  notesApp.init()
}
