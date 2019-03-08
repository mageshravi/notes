<template>
  <div id="notes-app">
    <update-notification
      v-bind:update-available="updateAvailable"
      v-bind:dismissed="updateNotificationDismissed"
    ></update-notification>

    <push-prompt v-bind:show-push-prompt="showPushPrompt"></push-prompt>

    <div class="l-wrapper">
      <div class="l-folders m-folders">
        <h2 class="m-folders__title">Folders</h2>
        <folders-list
          v-bind:folders-list="foldersList"
          v-bind:selected-folder="selectedFolder"
          v-on:slide-to-mobile-panel="slideToMobilePanel"
          v-on:refresh-folders.native="refreshFolders"
        ></folders-list>

        <h2 class="m-folders__title">Tags</h2>
        <tags-list
          v-bind:tags-list="tagsList"
          v-bind:selected-tag="selectedTag"
          v-on:slide-to-mobile-panel="slideToMobilePanel"
          v-on:refresh-tags.native="refreshTags"
        ></tags-list>
      </div>

      <div class="l-notes m-notes">
        <div class="m-notes__header" v-if="selectedFolder">
          <a
            class="m-notes__folders-list-link"
            v-bind:href="'#/folders/' + selectedFolder"
            v-on:click="slideToFoldersListInMobileView"
          >
            <i class="fa fa-angle-left"></i> Folders
          </a>
          <h2 class="m-notes__title">{{ selectedFolder }}</h2>
        </div>

        <div class="m-notes__header" v-if="selectedTag">
          <a
            class="m-notes__folders-list-link"
            v-bind:href="'#/tags/' + selectedTag"
            v-on:click="slideToFoldersListInMobileView"
          >
            <i class="fa fa-angle-left"></i> Tags
          </a>
          <h2 class="m-notes__title">#{{ selectedTag }}</h2>
        </div>

        <ul class="m-notes-list">
          <notes-item
            v-for="note in notesList"
            v-bind:note="note"
            v-bind:selected-note="selectedNote"
            v-bind:key="note.id"
            v-on:note-change="noteChangeHandler"
            v-on:slide-to-mobile-panel="slideToMobilePanel"
          ></notes-item>
        </ul>
      </div>

      <div class="l-note-detail">
        <note-detail
          v-bind:note="noteDetail"
          v-bind:selected-tag="selectedTag"
          v-on:slide-to-mobile-panel="slideToMobilePanel"
        ></note-detail>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
import axios from "axios";
import NotesDB from "./NotesDB";
import PushPrompt from "./components/PushPrompt.vue";
import UpdateNotification from "./components/UpdateNotification.vue";
import FoldersList from "./components/FoldersList.vue";
import TagsList from "./components/TagsList.vue";
import NotesItem from "./components/NotesItem.vue";
import NoteDetail from "./components/NoteDetail.vue";

export default {
  components: {
    PushPrompt,
    UpdateNotification,
    FoldersList,
    TagsList,
    NotesItem,
    NoteDetail
  },
  data: function() {
    return {
      updateAvailable: false,
      updateNotificationDismissed: false,
      showPushPrompt: window.Notification
        ? Notification.permission === "default"
        : false,
      foldersList: [],
      tagsList: [],
      notesList: [],
      noteDetail: false,
      selectedFolder: false,
      selectedTag: false,
      selectedNote: false
    };
  },
  methods: {
    startSpinner() {
      // TODO: start spinner
    },
    stopSpinner() {
      // TODO: stop spinner
    },
    refreshPushPrompt() {
      this.showPushPrompt = window.Notification
        ? Notification.permission === "default"
        : false;
    },
    populateDatabase() {
      if (this.dbPopulated) {
        return;
      }

      // folders
      axios.get("/folders").then(response => {
        this.foldersList = response.data;

        let notesDb = new NotesDB();
        this.foldersList.forEach(folder => {
          notesDb.addFolder(folder);
        });

        // notes in folders
        this.foldersList.forEach(folder => {
          axios.get(folder.url).then(response => {
            notesDb.addNotesToFolder(response.data, folder.name);

            // note detail
            response.data.forEach(note => {
              axios.get(note.url).then(response => {
                notesDb.addNoteDetail(response.data);
              });
            });
          });
        });
      });

      // tags
      axios.get("/tags").then(response => {
        this.tagsList = response.data;

        let notesDb = new NotesDB();
        this.tagsList.forEach(tag => {
          notesDb.addTag(tag);
        });

        // notes with tags
        this.tagsList.forEach(tag => {
          axios.get(tag.url).then(response => {
            notesDb.addNotesToTag(response.data, tag.handle);
          });
        });
      });

      this.dbPopulated = true;
    },
    refreshFolders() {
      let receivedNetworkData = false;

      // from idb
      let notesDb = new NotesDB();
      notesDb.getAllFolders().then(foldersList => {
        if (!receivedNetworkData) {
          this.foldersList = foldersList;
        }
      });

      // from network
      axios
        .get("/folders")
        .then(response => {
          receivedNetworkData = true;
          this.foldersList = response.data;

          notesDb.addFolders(this.foldersList);
        })
        .catch(err => {
          console.log(` |- refresh folders ${err}`);
        });
    },
    refreshTags() {
      let receivedNetworkData = false;

      // from idb
      let notesDb = new NotesDB();
      notesDb.getAllTags().then(tagsList => {
        if (!receivedNetworkData) {
          this.tagsList = tagsList;
        }
      });

      // from network
      axios
        .get("/tags")
        .then(response => {
          receivedNetworkData = true;
          this.tagsList = response.data;

          notesDb.addTags(this.tagsList);
        })
        .catch(err => {
          console.log(` |- refresh tags ${err}`);
        });
    },
    getNotesInFolder(folderName) {
      folderName = encodeURIComponent(folderName);
      let receivedNetworkData = false;

      // from idb
      let notesDb = new NotesDB();
      notesDb.getNotesInFolder(folderName).then(notesList => {
        if (!receivedNetworkData) {
          this.notesList = notesList;
        }
      });

      // from network
      axios
        .get(`/folders/${folderName}`)
        .then(response => {
          receivedNetworkData = true;
          this.notesList = response.data;

          notesDb.addNotesToFolder(this.notesList, folderName);
        })
        .catch(err => {
          console.log(` |- get notes in folder ${folderName}: ${err}`);
        });
    },
    getNotesWithTag(tagHandle) {
      tagHandle = encodeURIComponent(tagHandle);
      let receivedNetworkData = false;

      // from idb
      let notesDb = new NotesDB();
      notesDb.getNotesWithTag(tagHandle).then(notesList => {
        if (!receivedNetworkData) {
          this.notesList = notesList;
        }
      });

      // from network
      axios
        .get(`/tags/${tagHandle}`)
        .then(response => {
          receivedNetworkData = true;
          this.notesList = response.data;

          notesDb.addNotesToTag(this.notesList, tagHandle);
        })
        .catch(err => {
          console.log(` |- get notes with tag ${tagHandle}: ${err}`);
        });
    },
    folderChangeHandler(folderName) {
      this.selectedFolder = folderName;
      this.selectedTag = false;
      this.selectedNote = false;
      this.noteDetail = false;
      this.getNotesInFolder(folderName);
    },
    tagChangeHandler(tagHandle) {
      this.selectedFolder = false;
      this.selectedTag = tagHandle;
      this.selectedNote = false;
      this.noteDetail = false;
      this.getNotesWithTag(tagHandle);
    },
    noteChangeHandler(noteSlug) {
      let notesDb = new NotesDB();
      notesDb.getNoteDetail(noteSlug).then(noteDetail => {
        this.noteDetail = noteDetail;
      });
    },
    slideToFoldersListInMobileView(ev) {
      ev.preventDefaul();
      this.slideToMobilePanel("folders-list");
      return false;
    },
    slideToMobilePanel(area) {
      let wrapperEl = document.querySelector(".l-wrapper");

      switch (area) {
        case "folders-list":
          wrapperEl.classList.add("folders-visible");
          wrapperEl.classList.remove("notes-list-visible");
          wrapperEl.classList.remove("note-detail-visible");
          break;

        case "notes-list":
          wrapperEl.classList.remove("folders-visible");
          wrapperEl.classList.add("notes-list-visible");
          wrapperEl.classList.remove("note-detail-visible");
          break;

        case "note-detail":
          wrapperEl.classList.remove("folders-visible");
          wrapperEl.classList.remove("notes-list-visible");
          wrapperEl.classList.add("note-detail-visible");
          break;
      }
    },
    init() {
      this.refreshPushPrompt();

      if (!this.dbPopulated) {
        this.populateDatabase();
      }

      if (!this.foldersList.length) {
        this.refreshFolders();
      }

      if (!this.tagsList.length) {
        this.refreshTags();
      }

      if (!window.location.hash) {
        this._noHashInit(); // no hash provided = home page
        return;
      }

      let foldersPattern = /^#\/folders\/([^/]+)\/?$/;
      let foldersMatch = window.location.hash.match(foldersPattern);
      if (foldersMatch) {
        let folderName = foldersMatch[1];
        this.folderChangeHandler(folderName);
        this.slideToMobilePanel("notes-list");
        return;
      }

      let tagsPattern = /^#\/tags\/([^/]+)\/?$/;
      let tagsMatch = window.location.hash.match(tagsPattern);
      if (tagsMatch) {
        let tagHandle = tagsMatch[1];
        this.tagChangeHandler(tagHandle);
        this.slideToMobilePanel("notes-list");
        return;
      }

      let notePattern = /^#\/notes\/([^/]+)\/?$/;
      let noteMatch = window.location.hash.match(notePattern);
      if (noteMatch) {
        let noteSlug = noteMatch[1];

        let notesDb = new NotesDB();
        let receivedNetworkData = false;

        // from idb
        notesDb.getNoteDetail(noteSlug).then(noteDetail => {
          if (!receivedNetworkData) {
            this._noteDetailSuccessHandler(noteDetail);
          }
        });

        // from network
        axios
          .get(`/notes/${noteSlug}`)
          .then(response => {
            receivedNetworkData = true;
            // update idb with latest response
            notesDb.addNoteDetail(response.data);

            this._noteDetailSuccessHandler(response.data);
          })
          .catch(err => {
            console.log(` |- note-detail ${err}`);
          });
      }
    },
    _noHashInit() {
      let notesDB = new NotesDB();
      notesDB.getAllFolders().then(folders => {
        if (!folders.length) {
          return;
        }

        this.foldersList = folders;

        // get notes in first folder
        let folderName = this.foldersList[0].name;
        this.selectedFolder = folderName;

        notesDB.getNotesInFolder(folderName).then(notesList => {
          this.notesList = notesList;
          if (notesList.length) {
            // get the first note
            let firstNoteSlug = this.notesList[0].slug;
            this.selectedNote = firstNoteSlug;
            this.noteChangeHandler(firstNoteSlug);
          }

          this.slideToMobilePanel("folders-list");
        });
      });
    },
    /**
     * Success handler for a promise dealing with note-detail (on inital load only)
     * @param {Object} noteDetail The note detail object
     */
    _noteDetailSuccessHandler(noteDetail) {
      this.noteDetail = noteDetail;
      this.selectedNote = this.noteDetail.slug;
      let folderName = this.noteDetail.folder.name;
      let isParentFolderSelected = folderName === this.selectedFolder;

      let isTagSelected = false;
      for (let i = 0; i < this.noteDetail.tags.length; i++) {
        let curTag = this.noteDetail.tags[i];
        if (curTag.handle === this.selectedTag) {
          isTagSelected = true;
        }
      }

      if (!isTagSelected) {
        this.selectedTag = false;
      }

      if (!isParentFolderSelected && !isTagSelected) {
        this.selectedFolder = folderName;

        // get other notes in same folder

        // from idb
        let receivedNetworkData = false;
        let notesDb = new NotesDB();
        notesDb.getNotesInFolder(folderName).then(notesList => {
          if (!receivedNetworkData) {
            this._notesInFolderSuccessHandler(notesList);
          }
        });

        // from network
        axios
          .get(`/folders/${folderName}`)
          .then(response => {
            receivedNetworkData = true;
            // update idb with latest response
            notesDb.addNotesToFolder(response.data, folderName);

            this._notesInFolderSuccessHandler(response.data);
          })
          .catch(err => {
            console.log(` |- get notes in folder ${folderName}: ${err}`);
          });
      } else {
        this.slideToMobilePanel("note-detail");
      }
    },
    /**
     * Success handler for a promise dealing with notes-in-folder (on initial load only)
     * @param {Object} notesList The list of notes in a specific folder
     * @param {Boolean} animate Flag to denote if animation is required
     */
    _notesInFolderSuccessHandler(notesList) {
      this.notesList = notesList;
      this.slideToMobilePanel("note-detail");
    }
  },
  mounted() {
    this.init();

    let _this = this;
    window.onhashchange = function() {
      _this.init();
    };
  }
};
</script>
