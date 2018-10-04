"use strict";

/* global Vue */
Vue.component('folders-item', {
  props: ['folder'],
  template: "<li class=\"m-folders-list__item\">\n    <a class=\"m-folders-list__link\" \n      v-bind:href=\"'#/folders/' + folder.name\"\n      v-on:click=\"selectFolder\">\n      {{ folder.name }}\n    </a>\n  </li>",
  methods: {
    selectFolder: function selectFolder(event) {
      var cssClassNames = {
        foldersListItem: 'm-folders-list__item',
        isActive: 'is-active'
      };
      document.querySelectorAll(".".concat(cssClassNames.foldersListItem)).forEach(function (el) {
        el.classList.remove(cssClassNames.isActive);
      });
      event.target.parentNode.classList.add(cssClassNames.isActive); // TODO: emit event to refresh notes
    }
  }
});
Vue.component('tags-item', {
  props: ['tag'],
  template: "<li class=\"m-folders-list__item\">\n    <a class=\"m-folders-list__link\" v-bind:href=\"'#/tags/' + tag.handle\">{{ tag.handle }}</a>\n  </li>"
});
Vue.component('note', {
  props: ['note'],
  template: "<div class=\"m-note\">\n    <p class=\"m-note__title\">{{ note.title }}</p>\n    <p class=\"m-note__updated\">{{ note.updated_at }}</p>\n  </div>"
});
Vue.component('notes-item', {
  props: ['note'],
  template: "<li class=\"m-notes-list__item\">\n    <note v-bind:note=\"note\"></note>\n  </li>"
});
var notesApp = new Vue({
  // eslint-disable-line no-unused-vars
  el: '#notes-app',
  data: {
    foldersList: [],
    tagsList: [],
    selectedFolder: 'Default',
    notesList: [{
      id: 1,
      title: 'Hello World',
      updated_at: 'Oct. 4, 2018, 10:39 a.m.'
    }]
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
    selectFolder: function selectFolder(resource) {
      console.log(this, resource);
    }
  },
  beforeMount: function beforeMount() {
    this.refreshFolders();
    this.refreshTags();
  }
});