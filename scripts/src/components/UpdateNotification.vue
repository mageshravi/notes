<template>
  <div
    id="app-update-available"
    class="m-banner-notification"
    v-bind:class="{'is-visible': isVisible}"
  >
    <p class="m-banner-notification__message">An update is available</p>
    <div class="m-banner-notification__btn-wrapper">
      <button id="update-app" class="m-btn" v-on:click="update">Update</button>&nbsp;
      <button class="m-btn" v-on:click="dismiss">Later</button>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'updateAvailable'
  ],
  data: function () {
    return {
      dismissed: false
    }
  },
  computed: {
    isVisible: function() {
      return this.updateAvailable && !this.dismissed;
    }
  },
  methods: {
    dismiss() {
      this.$data.dismissed = true;
    },
    update() {
      this.$emit('ready-to-update');
    }
  }
};
</script>
