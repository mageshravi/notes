"use strict";

/* global Vue */

/* global hljs */
Vue.component('folders-item', {
  props: ['folder', 'selectedFolder'],
  template: "\n  <li class=\"m-folders-list__item\"\n      v-bind:class=\"{'is-active': isActive}\">\n    <a class=\"m-folders-list__link\" \n      v-bind:href=\"'#/folders/' + folder.name\"\n      v-on:click=\"selectFolder\">\n      {{ folder.name }}\n    </a>\n  </li>",
  computed: {
    isActive: function isActive() {
      return this.folder.name === this.selectedFolder;
    }
  },
  methods: {
    selectFolder: function selectFolder(event) {
      var cssClassNames = {
        foldersListItem: 'm-folders-list__item',
        isActive: 'is-active'
      };
      document.querySelectorAll(".".concat(cssClassNames.foldersListItem)).forEach(function (el) {
        el.classList.remove(cssClassNames.isActive);
      });
      event.target.parentNode.classList.add(cssClassNames.isActive); // tell parent to refresh notes

      this.$emit('folder-change', event.target.innerText);
    }
  }
});
Vue.component('tags-item', {
  props: ['tag'],
  template: "\n  <li class=\"m-folders-list__item\">\n    <a class=\"m-folders-list__link\" v-bind:href=\"'#/tags/' + tag.handle\">{{ tag.handle }}</a>\n  </li>"
});
Vue.component('notes-item', {
  props: ['note', 'selectedNote'],
  template: "\n  <li class=\"m-notes-list__item\">\n    <div class=\"m-note\"\n        v-bind:slug=\"note.slug\"\n        v-bind:class=\"{'is-active': isActive}\"\n        v-on:click=\"selectNote\">\n      <p class=\"m-note__title\">{{ note.title }}</p>\n      <p class=\"m-note__updated\">{{ note.updated_at }}</p>\n    </div>\n  </li>",
  computed: {
    isActive: function isActive() {
      return this.note.slug === this.selectedNote;
    }
  },
  methods: {
    selectNote: function selectNote(event) {
      var cssClassNames = {
        note: 'm-note',
        isActive: 'is-active'
      };
      var curNote = event.currentTarget;
      document.querySelectorAll(".".concat(cssClassNames.note)).forEach(function (el) {
        el.classList.remove(cssClassNames.isActive);
      });
      curNote.classList.add(cssClassNames.isActive);
      var slug = curNote.getAttribute('slug');
      window.location.hash = "#/".concat(slug); // tell parent to refresh note-detail

      this.$emit('note-change', slug);
    }
  }
});
Vue.component('note-detail', {
  props: ['note'],
  template: "\n  <div class=\"m-note-detail\" v-if=\"note\">\n      <h1>{{ note.title }}</h1>\n      <span v-for=\"tag in note.tags\"\n            v-bind:tag=\"tag\"\n            v-bind:key=\"tag.id\">\n          {{ tag.handle }}\n      </span>\n      <hr>\n      <div v-html=\"note.content\"></div>\n  </div>",
  updated: function updated() {
    document.querySelectorAll('.m-note-detail pre code').forEach(function (el) {
      hljs.highlightBlock(el);
    });
  }
});
var notesApp = new Vue({
  // eslint-disable-line no-unused-vars
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
    refreshFolders: function refreshFolders(resource) {
      var _this = this;

      this.$http.get('/folders').then(function (response) {
        _this.foldersList = response.data;
      });
    },
    refreshTags: function refreshTags(resource) {
      var _this2 = this;

      this.$http.get('/tags').then(function (response) {
        _this2.tagsList = response.data;
      });
    },
    refreshNotes: function refreshNotes(folderName) {
      var _this3 = this;

      folderName = encodeURIComponent(folderName);
      this.$http.get("/folders/".concat(folderName)).then(function (response) {
        _this3.notesList = response.data;
      });
    },
    folderChangeHandler: function folderChangeHandler(folderName) {
      this.selectedFolder = folderName;
      this.selectedNote = false;
      this.noteDetail = false;
      this.refreshNotes(folderName);
    },
    noteChangeHandler: function noteChangeHandler(noteSlug) {
      var _this4 = this;

      this.$http.get("/notes/".concat(noteSlug)).then(function (response) {
        _this4.noteDetail = response.data;
      });
    },
    slideToMobileFocusArea: function slideToMobileFocusArea(area) {
      var wrapperEl = document.querySelector('.l-wrapper');

      switch (area) {
        case 'folders-list':
          wrapperEl.classList.add('folders-visible');
          wrapperEl.classList.remove('notes-list-visible');
          wrapperEl.classList.remove('note-detail-visible');
          break;

        case 'notes-list':
          wrapperEl.classList.remove('folders-visible');
          wrapperEl.classList.add('notes-list-visible');
          wrapperEl.classList.remove('note-detail-visible');
          break;

        case 'note-detail':
          wrapperEl.classList.remove('folders-visible');
          wrapperEl.classList.remove('notes-list-visible');
          wrapperEl.classList.add('note-detail-visible');
          break;
      }
    },
    init: function init() {
      var _this5 = this;

      this.refreshFolders();
      this.refreshTags();

      if (!window.location.hash) {
        // no hash provided = home page
        this.$http.get('/folders').then(function (response) {
          _this5.foldersList = response.data;

          if (!_this5.foldersList.length) {
            return;
          } // get notes in first folder


          var folderName = _this5.foldersList[0].name;
          _this5.selectedFolder = folderName;

          _this5.$http.get("/folders/".concat(folderName)).then(function (response) {
            _this5.notesList = response.data;

            if (_this5.notesList.length) {
              // get the first note
              var firstNoteSlug = _this5.notesList[0].slug;
              _this5.selectedNote = firstNoteSlug;

              _this5.noteChangeHandler(firstNoteSlug);
            }

            _this5.slideToMobileFocusArea('folders-list');
          });
        });
        return;
      }

      var foldersPattern = /^#\/folders\/([^/]+)\/?$/;
      var foldersMatch = window.location.hash.match(foldersPattern);

      if (foldersMatch) {
        var folderName = foldersMatch[1];
        this.folderChangeHandler(folderName);
        this.slideToMobileFocusArea('notes-list');
        return;
      }

      var notePattern = /^#\/([^/]+)\/?$/;
      var noteMatch = window.location.hash.match(notePattern);

      if (noteMatch) {
        var noteSlug = noteMatch[1]; // fetch note-detail

        this.$http.get("/notes/".concat(noteSlug)).then(function (response) {
          _this5.noteDetail = response.data;
          _this5.selectedNote = _this5.noteDetail.slug;
          var folderName = _this5.noteDetail.folder.name;
          _this5.selectedFolder = folderName; // fetch other notes in same folder

          _this5.$http.get("/folders/".concat(folderName)).then(function (response) {
            _this5.notesList = response.data;

            _this5.slideToMobileFocusArea('note-detail');
          });
        });
      }
    }
  },
  beforeMount: function beforeMount() {
    this.init();
  }
});

window.onhashchange = function (ev) {
  notesApp.init();
};