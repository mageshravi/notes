import idb from 'idb'

class NotesDB { // eslint-disable-line no-unused-vars
  constructor () {
    this.dbPromise = idb.open('notesDB', 1, upgradeDB => { // eslint-disable-line no-unused-vars
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('folders', {keyPath: 'id'})
          upgradeDB.createObjectStore('tags', {keyPath: 'id'})
          upgradeDB.createObjectStore('notesInFolders')
          upgradeDB.createObjectStore('notesWithTags')
          upgradeDB.createObjectStore('noteDetail', {keyPath: 'slug'})
      }
    })
  }

  addFolder (folder) {
    this.dbPromise.then(db => {
      var tx = db.transaction('folders', 'readwrite')
      var folderStore = tx.objectStore('folders')
      folderStore.put(folder)
      return tx.complete
    })
  }

  addTag (tag) {
    this.dbPromise.then(db => {
      var tx = db.transaction('tags', 'readwrite')
      var tagStore = tx.objectStore('tags')
      tagStore.put(tag)
      return tx.complete
    })
  }

  addNotesToFolder (notes, folderName) {
    this.dbPromise.then(db => {
      var tx = db.transaction('notesInFolders', 'readwrite')
      var notesStore = tx.objectStore('notesInFolders')
      notesStore.put(notes, folderName)
      return tx.complete
    })
  }

  addNotesToTag (notes, tagHandle) {
    this.dbPromise.then(db => {
      var tx = db.transaction('notesWithTags', 'readwrite')
      var notesStore = tx.objectStore('notesWithTags')
      notesStore.put(notes, tagHandle)
      return tx.complete
    })
  }

  addNoteDetail (note) {
    this.dbPromise.then(db => {
      var tx = db.transaction('noteDetail', 'readwrite')
      var noteDetailStore = tx.objectStore('noteDetail')
      noteDetailStore.put(note)
      return tx.complete
    })
  }

  getAllFolders () {
    return this.dbPromise.then(db => {
      var tx = db.transaction('folders')
      var folderStore = tx.objectStore('folders')
      return folderStore.getAll()
    })
  }

  getAllTags () {
    return this.dbPromise.then(db => {
      var tx = db.transaction('tags')
      var tagStore = tx.objectStore('tags')
      return tagStore.getAll()
    })
  }

  getNotesInFolder (folderName) {
    return this.dbPromise.then(db => {
      var tx = db.transaction('notesInFolders')
      var notesStore = tx.objectStore('notesInFolders')
      return notesStore.get(folderName)
    })
  }

  getNotesWithTag (tagHandle) {
    return this.dbPromise.then(db => {
      var tx = db.transaction('notesWithTags')
      var notesStore = tx.objectStore('notesWithTags')
      return notesStore.get(tagHandle)
    })
  }

  getNoteDetail (noteSlug) {
    return this.dbPromise.then(db => {
      var tx = db.transaction('noteDetail')
      var noteDetailStore = tx.objectStore('noteDetail')
      return noteDetailStore.get(noteSlug)
    })
  }
}

export default NotesDB
