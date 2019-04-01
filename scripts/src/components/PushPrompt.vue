<template>
  <div
    id="enable-push-prompt"
    class="m-push-prompt"
    v-if="showPushPrompt"
  >
    <div class="m-push-prompt__content">
      <img src="/static/wicons/push-notifications1.png">
      <p>This app relies on push notifications to keep your notes up-to-date on this device.</p>
      <button
        id="enable-push-notifications"
        v-on:click="enablePushNotifications"
      >Enable Push Notifications</button>
    </div>
  </div>
</template>

<script>
import NotesPushManager from "../NotesPushManager";

export default {
  props: [
    'showPushPrompt'
  ],
  methods: {
    enablePushNotifications() {
      let ev = new Event(NotesPushManager.EVENTS.ENABLE_PUSH_NOTIFICATION);
      document.dispatchEvent(ev);
    }
  }
};
</script>

<style lang="scss">
@import './scss/_theme.scss';
@import './scss/_vars.scss';

.m-push-prompt {
    background-color: $push-prompt-bg-color;

    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: $z-index-push-prompt;

    &__content {
        margin: 0 auto;
        max-width: 290px;
        text-align: center;
    }
}
</style>
