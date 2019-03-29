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
