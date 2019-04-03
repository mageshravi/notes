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

<style lang="scss">
@import './scss/_theme.scss';
@import './scss/_vars.scss';

.m-banner-notification {
  padding: 0.1px 15px;
  color: $banner-notification-txt-color;
  font-size: 1.2em;
  font-weight: bold;

  background: $banner-notification-gradient-color-light;
  background: -moz-linear-gradient(top, $banner-notification-gradient-color-light 0%, $banner-notification-gradient-color-dark 100%);
  background: -webkit-linear-gradient(top, $banner-notification-gradient-color-light 0%,$banner-notification-gradient-color-dark 100%);
  background: linear-gradient(to bottom, $banner-notification-gradient-color-light 0%,$banner-notification-gradient-color-dark 100%);

  width: 100vw;
  max-height: 0px;
  overflow: hidden;
  transition: max-height .6s linear;
  position: relative;
  z-index: $z-index-banner-notification;
  
  &.is-visible {
    max-height: 999px;
    transition: max-height .6s linear;
  }

  &__message {
    margin: 15px 0 8px 0;
  }

  &__btn-wrapper {
    margin: 0 0 15px 0;
  }
  
  .m-btn {
    font-size: 1rem;
    box-shadow: 0px 2px 3px $banner-notification-btn-shadow-color;
  }
}
</style>
