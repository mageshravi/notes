/* global Notification, fetch, Event */
class NotesPushManager {

  static get EVENTS () {
    return {
      ENABLE_PUSH_NOTIFICATION: 'push-notification:enable',
      SUBSCRIPTION_SUCCESS_NOTIFICATION: 'push-subscription:success',
      NOTE_CREATED_SYNC_COMPLETE: 'note:created:sync-complete',
      NOTE_UPDATED_SYNC_COMPLETE: 'note:update:sync-complete'
    }
  }

  constructor (reg) {
    this.reg = reg
    this.subscriptionGroup = 'notes-app-public'
    this.subscriptionSaveUrl = '/webpush/save_information'
  }

  initialize () {
    if (!this.reg.showNotification) {
      console.log('Showing notifications isn\'t supported')
      return
    }

    if (Notification.permission === 'denied') {
      console.log('You prevented us from showing notifications')
      return
    }

    if (!('PushManager' in window)) {
      console.log('Your browser does not support/allow push notifications')
      return
    }

    if (Notification.permission === 'granted') {
      this.subscribe(this.reg)
    }

    // DONT SUBSCRIBE YET. LET USERS KNOW WHY YOU NEED PUSH NOTIFICATION.
    // ON CLICK, SUBSCRIBE.
    let _this = this
    document.addEventListener(NotesPushManager.EVENTS.ENABLE_PUSH_NOTIFICATION, () => {
      _this.subscribe(_this.reg)
    })
  }

  /**
   * ES5 implementation of repeat function
   * @param str The string to repeat
   * @param times No. of times to repeat
   */
  repeatStr (str, times) {
    let outputStr = ''
    for (let i = 0; i < times; i++) {
      outputStr += str
    }
    return outputStr
  }

  /**
   * Convert base64 encoded string to Uint8Array
   * @param base64String The base64 encoded string
   */
  urlB64ToUint8Array (base64String) {
    // const padding = '='.repeat((4 - base64String.length % 4) % 4)    // ES6 => repeat
    const repeatCount = (4 - base64String.length % 4) % 4
    const padding = this.repeatStr('=', repeatCount)

    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    const outputData = outputArray.map((output, index) => rawData.charCodeAt(index))

    return outputData
  }

  subscribe (reg) {
    reg.pushManager.getSubscription().then(subscription => {
      if (subscription) {
        this.sendSubscriptionData(subscription, false)
        return
      }

      const vapidMeta = document.querySelector('meta[name="vapid-key"]')
      const key = vapidMeta.content
      const options = {
        userVisibleOnly: true,
        ...(key && { applicationServerKey: this.urlB64ToUint8Array(key) })
      }

      reg.pushManager.subscribe(options).then(sub => {
        this.sendSubscriptionData(sub, true)
      })
    })
  }

  sendSubscriptionData (subscription, notifyOnSuccess) {
    const browser = navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/ig)[0].toLowerCase()
    const data = {
      status_type: 'subscribe',
      subscription: subscription.toJSON(),
      browser: browser,
      group: this.subscriptionGroup   // very important
    }

    fetch(
      this.subscriptionSaveUrl,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'content-type': 'application/json'
        },
        credentials: 'include'
      }
    ).then(response => {
      // handle response
      console.log('Push notification subscription saved successfully')

      // show off a dummy notification
      if (notifyOnSuccess) {
        navigator.serviceWorker.controller.postMessage({action: NotesPushManager.EVENTS.SUBSCRIPTION_SUCCESS_NOTIFICATION})
      }

      // get rid of the prompt
      var pushPrompt = document.querySelector('#enable-push-prompt')
      if (pushPrompt) {
        var ev = new Event('refresh')
        pushPrompt.dispatchEvent(ev)
      }
    })
  }
}

export default NotesPushManager
