/* global Vue */
/* global hljs */

// VueJS is best used with requireJS/browserify when written with single-file components.
// Hence including VueJS within a script tag, for now.

import axios from 'axios'
import NotesDB from './NotesDB'

let newWorker

window.isUpdateAvailable = new Promise((resolve, reject) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker registered')

        reg.addEventListener('updatefound', () => {
          newWorker = reg.installing
          newWorker.addEventListener('statechange', () => {
            switch (newWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  // new update available
                  resolve(true)
                } else {
                  // no update available
                  resolve(false)
                }
                break
            }
          })
        })
      })
      .catch(err => {
        console.error('ServiceWorker registration failed', err)
      })
  }
})

// Vue components

Vue.component('update-notification', {
  props: [
    'updateAvailable',
    'dismissed'
  ],
  template: `
  <div id="app-update-available" class="m-banner-notification"
      v-bind:class="{'is-visible': isVisible}">
    <p class="m-banner-notification__message">An update is available</p>
    <div class="m-banner-notification__btn-wrapper">
      <button id="update-app" class="m-btn"
        v-on:click="update">Update</button>&nbsp;
      <button class="m-btn"
        v-on:click="dismiss">Later</button>
    </div>
  </div>
  `,
  computed: {
    isVisible: function () {
      return (this.updateAvailable && !this.dismissed)
    }
  },
  methods: {
    dismiss () {
      this.dismissed = true
    },
    update () {
      newWorker.postMessage({action: 'skipWaiting'})
      this.updateAvailable = false
    }
  }
})

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
    updateAvailable: false,
    updateNotificationDismissed: false,
    dbPopulated: false,
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
    startSpinner () {
      // TODO: start spinner
    },
    stopSpinner () {
      // TODO: stop spinner
    },
    populateDatabase (resource) {
      if (this.dbPopulated) {
        return
      }

      // folders
      axios.get('/folders').then(response => {
        this.foldersList = response.data

        let notesDb = new NotesDB()
        this.foldersList.forEach(folder => {
          notesDb.addFolder(folder)
        })

        // notes in folders
        this.foldersList.forEach(folder => {
          axios.get(folder.url).then(response => {
            notesDb.addNotesToFolder(response.data, folder.name)

            // note detail
            response.data.forEach(note => {
              axios.get(note.url).then(response => {
                notesDb.addNoteDetail(response.data)
              })
            })
          })
        })
      })

      // tags
      axios.get('/tags').then(response => {
        this.tagsList = response.data

        let notesDb = new NotesDB()
        this.tagsList.forEach(tag => {
          notesDb.addTag(tag)
        })

        // notes with tags
        this.tagsList.forEach(tag => {
          axios.get(tag.url).then(response => {
            notesDb.addNotesToTag(response.data, tag.handle)
          })
        })
      })

      this.dbPopulated = true
    },
    refreshFolders () {
      let receivedNetworkData = false

      // from idb
      let notesDb = new NotesDB()
      notesDb.getAllFolders().then(foldersList => {
        if (!receivedNetworkData) {
          this.foldersList = foldersList
        }
      })

      // from network
      axios.get('/folders')
        .then(response => {
          receivedNetworkData = true
          this.foldersList = response.data

          notesDb.addFolders(this.foldersList)
        })
        .catch(err => {
          console.log(` |- refresh folders ${err}`)
        })
    },
    refreshTags () {
      let receivedNetworkData = false

      // from idb
      let notesDb = new NotesDB()
      notesDb.getAllTags().then(tagsList => {
        if (!receivedNetworkData) {
          this.tagsList = tagsList
        }
      })

      // from network
      axios.get('/tags')
        .then(response => {
          receivedNetworkData = true
          this.tagsList = response.data

          notesDb.addTags(this.tagsList)
        })
        .catch(err => {
          console.log(` |- refresh tags ${err}`)
        })
    },
    getNotesInFolder (folderName) {
      folderName = encodeURIComponent(folderName)
      let receivedNetworkData = false

      // from idb
      let notesDb = new NotesDB()
      notesDb.getNotesInFolder(folderName)
        .then(notesList => {
          if (!receivedNetworkData) {
            this.notesList = notesList
          }
        })

      // from network
      axios.get(`/folders/${folderName}`)
        .then(response => {
          receivedNetworkData = true
          this.notesList = response.data

          notesDb.addNotesToFolder(this.notesList, folderName)
        })
        .catch(err => {
          console.log(` |- get notes in folder ${folderName}: ${err}`)
        })
    },
    getNotesWithTag (tagHandle) {
      tagHandle = encodeURIComponent(tagHandle)
      let receivedNetworkData = false

      // from idb
      let notesDb = new NotesDB()
      notesDb.getNotesWithTag(tagHandle).then(notesList => {
        if (!receivedNetworkData) {
          this.notesList = notesList
        }
      })

      // from network
      axios.get(`/tags/${tagHandle}`)
        .then(response => {
          receivedNetworkData = true
          this.notesList = response.data

          notesDb.addNotesToTag(this.notesList, tagHandle)
        })
        .catch(err => {
          console.log(` |- get notes with tag ${tagHandle}: ${err}`)
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
      let notesDb = new NotesDB()
      notesDb.getNoteDetail(noteSlug).then(noteDetail => {
        this.noteDetail = noteDetail
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
      if (!this.dbPopulated) {
        this.populateDatabase()
      }

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

        let notesDb = new NotesDB()
        let receivedNetworkData = false

        // from idb
        notesDb.getNoteDetail(noteSlug).then(noteDetail => {
          if (!receivedNetworkData) {
            this._noteDetailSuccessHandler(noteDetail)
          }
        })

        // from network
        axios.get(`/notes/${noteSlug}`)
          .then(response => {
            receivedNetworkData = true
            // update idb with latest response
            notesDb.addNoteDetail(response.data)

            this._noteDetailSuccessHandler(response.data)
          })
          .catch(err => {
            console.log(` |- note-detail ${err}`)
          })
      }
    },
    _noHashInit () {
      let notesDB = new NotesDB()
      notesDB.getAllFolders().then((folders) => {
        if (!folders.length) {
          return
        }

        this.foldersList = folders

        // get notes in first folder
        let folderName = this.foldersList[0].name
        this.selectedFolder = folderName

        notesDB.getNotesInFolder(folderName).then(notesList => {
          this.notesList = notesList
          if (notesList.length) {
            // get the first note
            let firstNoteSlug = this.notesList[0].slug
            this.selectedNote = firstNoteSlug
            this.noteChangeHandler(firstNoteSlug)
          }

          this.slideToMobilePanel('folders-list')
        })
      })
    },
    /**
     * Success handler for a promise dealing with note-detail (on inital load only)
     * @param {Object} noteDetail The note detail object
     */
    _noteDetailSuccessHandler (noteDetail) {
      this.noteDetail = noteDetail
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

        // get other notes in same folder

        // from idb
        let receivedNetworkData = false
        let notesDb = new NotesDB()
        notesDb.getNotesInFolder(folderName).then(notesList => {
          if (!receivedNetworkData) {
            this._notesInFolderSuccessHandler(notesList)
          }
        })

        // from network
        axios.get(`/folders/${folderName}`)
          .then(response => {
            receivedNetworkData = true
            // update idb with latest response
            notesDb.addNotesToFolder(response.data, folderName)

            this._notesInFolderSuccessHandler(response.data)
          })
          .catch(err => {
            console.log(` |- get notes in folder ${folderName}: ${err}`)
          })
      } else {
        this.slideToMobilePanel('note-detail')
      }
    },
    /**
     * Success handler for a promise dealing with notes-in-folder (on initial load only)
     * @param {Object} notesList The list of notes in a specific folder
     * @param {Boolean} animate Flag to denote if animation is required
     */
    _notesInFolderSuccessHandler (notesList) {
      this.notesList = notesList
      this.slideToMobilePanel('note-detail')
    }
  },
  beforeMount () {
    this.init()
  }
})

window.onhashchange = function (ev) {
  notesApp.init()
}

window['isUpdateAvailable']
  .then(isAvailable => {
    if (isAvailable) {
      notesApp.updateAvailable = true
    }
  })
