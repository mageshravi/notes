"use strict";

/* global Vue */

/* global hljs */
Vue.component('folder-item', {
  props: ['folder', 'selectedFolder'],
  template: "\n  <li class=\"m-folders-list__item\"\n      v-bind:class=\"{'is-active': isActive}\">\n    <a class=\"m-folders-list__link\"\n       v-bind:href=\"route\"\n       v-on:click=\"selectFolder\">\n      {{ folder.name }}\n    </a>\n  </li>",
  computed: {
    isActive: function isActive() {
      return this.folder.name === this.selectedFolder;
    },
    route: function route() {
      return "#".concat(this.folder.url);
    }
  },
  methods: {
    selectFolder: function selectFolder(ev) {
      var selectedFolder = ev.currentTarget.parentNode;

      if (selectedFolder.classList.contains('is-active')) {
        ev.preventDefault();
        this.$emit('slide-to-mobile-panel', 'notes-list');
        return false;
      }
    }
  }
});
Vue.component('tags-folder-item', {
  props: ['tag', 'selectedTag'],
  template: "\n  <li class=\"m-folders-list__item\"\n      v-bind:class=\"{'is-active': isActive}\">\n    <a class=\"m-folders-list__link\"\n       v-bind:href=\"route\"\n       v-on:click=\"selectFolder\">\n      {{ tag.handle }}\n    </a>\n  </li>",
  computed: {
    isActive: function isActive() {
      return this.tag.handle === this.selectedTag;
    },
    route: function route() {
      return "#".concat(this.tag.url);
    }
  },
  methods: {
    selectFolder: function selectFolder(ev) {
      var selectedFolder = ev.currentTarget.parentNode;

      if (selectedFolder.classList.contains('is-active')) {
        ev.preventDefault();
        this.$emit('slide-to-mobile-panel', 'notes-list');
        return false;
      }
    }
  }
});
Vue.component('notes-item', {
  props: ['note', 'selectedNote'],
  template: "\n  <li class=\"m-notes-list__item\">\n    <div class=\"m-note\"\n        v-bind:slug=\"note.slug\"\n        v-bind:url=\"note.url\"\n        v-bind:class=\"{'is-active': isActive}\"\n        v-on:click=\"selectNote\">\n      <p class=\"m-note__title\">{{ note.title }}</p>\n      <p class=\"m-note__updated\">{{ note.updated_at }}</p>\n    </div>\n  </li>",
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
      var url = curNote.getAttribute('url');
      var noteRoute = "#".concat(url);

      if (window.location.hash === noteRoute) {
        this.$emit('slide-to-mobile-panel', 'note-detail');
        return;
      }

      window.location.hash = noteRoute;
    }
  }
});
Vue.component('note-tag', {
  props: ['tag'],
  template: "\n  <li class=\"m-tags-list__item\"\n      v-bind:key=\"tag.id\">\n    <a class=\"m-tags-list__link\"\n       v-bind:href=\"route\">{{ tag.handle }}</a>\n  </li>\n  ",
  computed: {
    route: function route() {
      return "#".concat(this.tag.url);
    }
  }
});
Vue.component('note-detail', {
  props: ['note', 'selectedTag'],
  template: "\n  <div class=\"m-note-detail\" v-if=\"note\">\n      <a class=\"m-note-detail__notes-list-link\"\n         v-if=\"selectedTag\"\n         v-bind:href=\"route\"\n         v-on:click=\"slideToNotesListInMobileView\"\n         ><i class=\"fa fa-angle-left\" aria-hidden=\"true\"></i> #{{ selectedTag }}\n      </a>\n      <a class=\"m-note-detail__notes-list-link\"\n         v-else\n         v-bind:href=\"route\"\n         v-on:click=\"slideToNotesListInMobileView\"\n         ><i class=\"fa fa-angle-left\" aria-hidden=\"true\"></i> {{ note.folder.name }}\n      </a>\n      <h1>{{ note.title }}</h1>\n      <ul class=\"m-tags-list\">\n        <note-tag\n          v-for=\"tag in note.tags\"\n          v-bind:tag=\"tag\"\n          v-bind:key=\"tag.id\"></note-tag>\n      </ul>\n      <hr>\n      <div v-html=\"note.content\"></div>\n  </div>",
  computed: {
    route: function route() {
      return "#".concat(this.note.folder.url);
    }
  },
  updated: function updated() {
    document.querySelectorAll('.m-note-detail pre code').forEach(function (el) {
      hljs.highlightBlock(el);
    });
  },
  methods: {
    slideToNotesListInMobileView: function slideToNotesListInMobileView(ev) {
      ev.preventDefault();
      this.$emit('slide-to-mobile-panel', 'notes-list');
      return false;
    }
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
    selectedTag: false,
    selectedNote: false
  },
  computed: {
    notEmptyFoldersList: function notEmptyFoldersList() {
      return Boolean(this.foldersList.length);
    },
    notEmptyTagsList: function notEmptyTagsList() {
      return Boolean(this.tagsList.length);
    }
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
    getNotesInFolder: function getNotesInFolder(folderName) {
      var _this3 = this;

      folderName = encodeURIComponent(folderName);
      this.$http.get("/folders/".concat(folderName)).then(function (response) {
        _this3.notesList = response.data;
      });
    },
    getNotesWithTag: function getNotesWithTag(tagHandle) {
      var _this4 = this;

      tagHandle = encodeURIComponent(tagHandle);
      this.$http.get("/tags/".concat(tagHandle)).then(function (response) {
        _this4.notesList = response.data;
      });
    },
    folderChangeHandler: function folderChangeHandler(folderName) {
      this.selectedFolder = folderName;
      this.selectedTag = false;
      this.selectedNote = false;
      this.noteDetail = false;
      this.getNotesInFolder(folderName);
    },
    tagChangeHandler: function tagChangeHandler(tagHandle) {
      this.selectedFolder = false;
      this.selectedTag = tagHandle;
      this.selectedNote = false;
      this.noteDetail = false;
      this.getNotesWithTag(tagHandle);
    },
    noteChangeHandler: function noteChangeHandler(noteSlug) {
      var _this5 = this;

      this.$http.get("/notes/".concat(noteSlug)).then(function (response) {
        _this5.noteDetail = response.data;
      });
    },
    slideToFoldersListInMobileView: function slideToFoldersListInMobileView(ev) {
      ev.preventDefault();
      this.slideToMobilePanel('folders-list');
      return false;
    },
    slideToMobilePanel: function slideToMobilePanel(area) {
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
      var _this6 = this;

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

      var foldersPattern = /^#\/folders\/([^/]+)\/?$/;
      var foldersMatch = window.location.hash.match(foldersPattern);

      if (foldersMatch) {
        var folderName = foldersMatch[1];
        this.folderChangeHandler(folderName);
        this.slideToMobilePanel('notes-list');
        return;
      }

      var tagsPattern = /^#\/tags\/([^/]+)\/?$/;
      var tagsMatch = window.location.hash.match(tagsPattern);

      if (tagsMatch) {
        var tagHandle = tagsMatch[1];
        this.tagChangeHandler(tagHandle);
        this.slideToMobilePanel('notes-list');
        return;
      }

      var notePattern = /^#\/notes\/([^/]+)\/?$/;
      var noteMatch = window.location.hash.match(notePattern);

      if (noteMatch) {
        var noteSlug = noteMatch[1]; // fetch note-detail

        this.$http.get("/notes/".concat(noteSlug)).then(function (response) {
          _this6.noteDetail = response.data;
          _this6.selectedNote = _this6.noteDetail.slug;
          var folderName = _this6.noteDetail.folder.name;
          var isParentFolderSelected = folderName === _this6.selectedFolder;
          var isTagSelected = false;

          for (var i = 0; i < _this6.noteDetail.tags.length; i++) {
            var curTag = _this6.noteDetail.tags[i];

            if (curTag.handle === _this6.selectedTag) {
              isTagSelected = true;
            }
          }

          if (!isTagSelected) {
            _this6.selectedTag = false;
          }

          if (!isParentFolderSelected && !isTagSelected) {
            _this6.selectedFolder = folderName; // fetch other notes in same folder

            _this6.$http.get("/folders/".concat(folderName)).then(function (response) {
              _this6.notesList = response.data;

              _this6.slideToMobilePanel('note-detail');
            });
          } else {
            _this6.slideToMobilePanel('note-detail');
          }
        });
      }
    },
    _noHashInit: function _noHashInit() {
      var _this7 = this;

      this.$http.get('/folders').then(function (response) {
        _this7.foldersList = response.data;

        if (!_this7.foldersList.length) {
          return;
        } // get notes in first folder


        var folderName = _this7.foldersList[0].name;
        _this7.selectedFolder = folderName;

        _this7.$http.get("/folders/".concat(folderName)).then(function (response) {
          _this7.notesList = response.data;

          if (_this7.notesList.length) {
            // get the first note
            var firstNoteSlug = _this7.notesList[0].slug;
            _this7.selectedNote = firstNoteSlug;

            _this7.noteChangeHandler(firstNoteSlug);
          }

          _this7.slideToMobilePanel('folders-list');
        });
      });
    }
  },
  beforeMount: function beforeMount() {
    this.init();
  }
});

window.onhashchange = function (ev) {
  notesApp.init();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/sw.js').then(function () {
    console.log('Service Worker registered');
  });
}