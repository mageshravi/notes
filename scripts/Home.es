/* global Vue */

Vue.component('folders-item', {
  props: ['folder'],
  template: '<li class="m-folders-list__item">{{ folder.name }}</li>'
})

Vue.component('tags-item', {
  props: ['tag'],
  template: '<li class="m-folders-list__item">{{ tag.handle }}</li>'
})

Vue.component('note', {
  props: ['note'],
  template: `<div class="m-note">
    <p class="m-note__title">{{ note.title }}</p>
    <p class="m-note__updated">{{ note.updated_at }}</p>
  </div>`
})

Vue.component('notes-item', {
  props: ['note'],
  template: `<li class="m-notes-list__item">
    <note v-bind:note="note"></note>
  </li>`
})

var notesApp = new Vue({  // eslint-disable-line no-unused-vars
  el: '#notes-app',
  data: {
    foldersList: [
      { id: 1, name: 'Default' }
    ],
    tagsList: [
      { id: 1, handle: 'django' }
    ],
    selectedFolder: 'Default',
    notesList: [
      { id: 1, title: 'Hello World', updated_at: 'Oct. 4, 2018, 10:39 a.m.' }
    ]
  }
})
