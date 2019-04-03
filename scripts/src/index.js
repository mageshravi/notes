/* global Event */
import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'
import NotesPushManager from './NotesPushManager'
import NotesSync from './NotesSync'
import NotesDB from './NotesDB'

Vue.config.productionTip = false

let newWorker

let notesApp = new Vue({
  el: '#notes-app',
  data: {
    updateAvailable: false
  },
  template: '<App \
    v-bind:update-available="updateAvailable"\
    v-on:ready-to-update="updateApp"\
    />',
  components: { App },
  methods: {
    updateApp: function () {
      newWorker.postMessage({ action: "skipWaiting" });
      this.updateAvailable = false;
    }
  }
})

let isUpdateAvailable = new Promise((resolve, reject) => {
  if ('serviceWorker' in navigator) {
    let regPromise = navigator.serviceWorker.register('/sw.js')

    regPromise
      .then(reg => {
        console.log('Service Worker registered')

        // setup push notification
        let notesPM = new NotesPushManager(reg)
        notesPM.initialize()

        // setup update prompts
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
        reject(err)
      })

    // listen to messages from service worker
    navigator.serviceWorker.addEventListener('message', (ev) => {
      if (!('action' in ev.data)) {
        return
      }

      console.log('New message from ServiceWorker', ev.data.action)

      let notesSync = new NotesSync()
      let notesDb = new NotesDB()
      let note, folderId, tagIds
      let folder, tag
      let promiseArray

      switch (ev.data.action) {
        case 'page:reload':
          window.location.reload()
          break

        case 'note:created':
          // TL;DR: sync folders, tags, then fetch note-detail
          // finally notify sw to display notification

          note = ev.data.noteData

          // sync folder
          folderId = note.meta.folder
          notesSync.syncFolder(folderId)
            .then(() => {
              let promise = new Promise((resolve) => {
                triggerRefreshFoldersEvent()
                resolve()
              })
              return promise
            })
            .then(() => {
              // sync tags
              tagIds = note.meta.tags
              promiseArray = tagIds.map(tagId => {
                return notesSync.syncTag(tagId)
              })
              return Promise.all(promiseArray)
                .then(() => {
                  let promise = new Promise((resolve) => {
                    triggerRefreshTagsEvent()
                    resolve()
                  })
                  return promise
                })
            })
            .then(() => {
              // fetch note-detail
              return axios.get(`/notes/${note.slug}`)
                .then(response => {
                  let promise = new Promise((resolve) => {
                    notesDb.addNoteDetail(response.data)
                    resolve()
                  })
                  return promise
                })
            })
            .catch(err => {
              console.log('Error syncing data for note:created', err)
            })
          break

        case 'note:updated':
          // TL;DR: sync folder, tags
          // finally notify sw to display notification
          note = ev.data.noteData

          // sync folder
          folderId = note.meta.folder
          notesSync.syncFolder(folderId)
            .then(() => {
              let promise = new Promise((resolve) => {
                triggerRefreshFoldersEvent()
                resolve()
              })
              return promise
            })
            .then(() => {
              // sync tags
              tagIds = note.meta.tags
              promiseArray = tagIds.map(tagId => {
                return notesSync.syncTag(tagId)
              })
              return Promise.all(promiseArray)
                .then(() => {
                  let promise = new Promise((resolve) => {
                    triggerRefreshTagsEvent()
                    resolve()
                  })
                  return promise
                })
            })
            .catch(err => {
              console.log('Error syncing data for note:updated', err)
            })
          break

        case 'note:deleted':
          note = ev.data.noteData

          folderId = note.meta.folder
          notesDb.getFolderById(folderId)
            .then(folder => {
              // delete note from notesInFolders
              notesDb.deleteNoteFromFolder(note, folder.name)
                .then(() => {
                  console.log('Deleted from notesInFolder')
                })
            })

          tagIds = note.meta.tags
          tagIds.forEach(tagId => {
            notesDb.getTagById(tagId)
              .then(tag => {
                // delete note from notesWithTags
                notesDb.deleteNoteWithTag(note, tag.handle)
                  .then(() => {
                    console.log('Deleted from notesWithTag')
                  })
              })
          })

          notesDb.deleteNoteDetail(note.slug)
            .then(() => {
              console.log('Deleted noteDetail')
            })
          break

        case 'folder:created':
          folder = ev.data.folderData
          notesDb.addFolder(folder)
            .then(() => {
              console.log('Folder created')
              triggerRefreshFoldersEvent()
            })
          break

        case 'folder:updated':
          // very likely to be rename
          folder = ev.data.folderData
          // get old folder name from idb using the folder id
          notesDb.getFolderById(folder.id)
            .then(oldFolder => {
              // update folder
              notesDb.addFolder(folder)
                .then(() => {
                  console.log('Folder updated')
                  // get new notesInFolder
                  notesSync.syncFolder(folder.id)
                    .then(() => {
                      triggerRefreshFoldersEvent()
                    })
                })
              // delete notesInFolder (for old folder)
              notesDb.deleteAllNotesInFolder(oldFolder.name)
                .then(() => {
                  console.log('Deleted from notesInFolder')
                })
            })
          break

        case 'folder:deleted':
          // delete folder and notesInFolder
          folder = ev.data.folderData
          notesDb.deleteFolder(folder.id)
            .then(() => {
              console.log('Deleted from folders')
              triggerRefreshFoldersEvent()
            })
          notesDb.deleteAllNotesInFolder(folder.name)
            .then(() => {
              console.log('Deleted from notesInFolder')
            })
          break

        case 'tag:created':
          tag = ev.data.tagData
          notesDb.addTag(tag)
            .then(() => {
              console.log('Tag created')
              triggerRefreshTagsEvent()
            })
          break

        case 'tag:updated':
          // very likely to be rename
          tag = ev.data.tagData
          // get old tag handle using the tag id
          notesDb.getTagById(tag.id)
            .then(oldTag => {
              // update tag
              notesDb.addTag(tag)
                .then(() => {
                  console.log('Updated tag')
                  triggerRefreshTagsEvent()
                })

              // delete old notesWithTags
              notesDb.deleteAllNotesWithTag(oldTag.handle)
                .then(() => {
                  console.log('Deleted old notesWithTag record')
                })
            })
          break

        case 'tag:deleted':
          // delete tag and notesWithTags
          tag = ev.data.tagData
          notesDb.deleteTag(tag.id)
            .then(() => {
              console.log('Deleted from tags')
              triggerRefreshTagsEvent()
            })
          notesDb.deleteAllNotesWithTag(tag.handle)
            .then(() => {
              console.log('Deleted from notesWithTags')
            })
          break
      }
    })
  } else {
    reject('Browser does not support service-workers')
  }
})

/**
 * Triggers the refresh-folders event that updates the foldersList view after idb has been updated.
 */
function triggerRefreshFoldersEvent () {
  let foldersListEl = document.querySelector('.m-folders-list')
  if (foldersListEl) {
    let refreshEvent = new Event('refresh-folders')
    foldersListEl.dispatchEvent(refreshEvent)
  }
}

/**
 * Triggers the refresh-tags event that updates the tagsList view after idb has been updated.
 */
function triggerRefreshTagsEvent () {
  let tagsListEl = document.querySelector('.m-folders-list--tags')
  if (tagsListEl) {
    let refreshEvent = new Event('refresh-tags')
    tagsListEl.dispatchEvent(refreshEvent)
  }
}

isUpdateAvailable
  .then(isAvailable => {
    if (isAvailable) {
      notesApp.$data.updateAvailable = true
    }
  })
