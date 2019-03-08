import NotesDB from './NotesDB'
import axios from 'axios'

class NotesSync {   // eslint-disable-line no-unused-vars

  syncFolder (folderId) {
    let notesDb = new NotesDB()
    return notesDb.getFolderById(folderId)
      .then(folder => {
        // check if folder exists in idb
        let promise = new Promise((resolve) => {
          if (folder) {
            // folder exists
            resolve({
              folder: {
                id: folder.id,
                name: folder.name
              },
              syncFolders: false
            })
          } else {
            // folder does not exist
            resolve({
              folder: {
                id: folderId,
                name: null
              },
              syncFolders: true
            })
          }
        })
        return promise
      })
      .then(result => {
        // check if folders need to be synced
        let promise = new Promise((resolve, reject) => {
          if (result.folder.name && !result.syncFolders) {
            resolve(result.folder.name)
          } else {
            // folder not found in idb. sync folders
            axios.get(`/folders`)
              .then(response => {
                notesDb.addFolders(response.data)
                notesDb.getFolderById(result.folder.id)
                  .then(folder => {
                    if (folder) {
                      resolve(folder.name)
                    } else {
                      reject(`Unknown folder #${result.folder.id}`)
                    }
                  })
              })
          }
        })
        return promise
      })
      .then(folderName => {
        // refresh notes in folder
        let promise = new Promise((resolve, reject) => {
          axios.get(`/folders/${folderName}`)
            .then(response => {
              notesDb.addNotesToFolder(response.data, folderName)
              resolve(true)
            })
            .catch(err => {
              reject(`error fetching notes in folder ${folderName}: ${err}`)
            })
        })
        return promise
      })
  }

  syncTag (tagId) {
    let notesDb = new NotesDB()
    return notesDb.getTagById(tagId)
      .then(tag => {
        // check if tag exists in idb
        let promise = new Promise((resolve) => {
          if (tag) {
            // tag exists
            resolve({
              tag: {
                id: tag.id,
                handle: tag.handle
              },
              syncTags: false
            })
          } else {
            // tag does not exist
            resolve({
              tag: {
                id: tagId,
                handle: null
              },
              syncTags: true
            })
          }
        })
        return promise
      })
      .then(result => {
        // check if tags need to be synced
        let promise = new Promise((resolve, reject) => {
          if (result.tag.handle && !result.syncTags) {
            resolve(result.tag.handle)
          } else {
            // tag not found in idb. sync tags
            axios.get(`/tags`)
              .then(response => {
                notesDb.addTags(response.data)
                notesDb.getTagById(result.tag.id)
                  .then(tag => {
                    if (tag) {
                      console.log(`syncTag #${result.tag.id} => ${tag.handle}`)
                      resolve(tag.handle)
                    } else {
                      reject(`Unknown tag #${result.tag.id}`)
                    }
                  })
              })
          }
        })
        return promise
      })
      .then(tagHandle => {
        // refresh notes with tag
        let promise = new Promise((resolve, reject) => {
          axios.get(`/tags/${tagHandle}`)
            .then(response => {
              notesDb.addNotesToTag(response.data, tagHandle)
              resolve(true)
            })
            .catch(err => {
              reject(`error fetching notes with tag ${tagHandle}: ${err}`)
            })
        })
        return promise
      })
  }
}

export default NotesSync
