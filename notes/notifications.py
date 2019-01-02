from django.conf import settings
from webpush import send_group_notification
from logging import getLogger


class PushNotification(object):

    push_groups = getattr(settings, 'PUSH_NOTIFICATION_GROUPS', {})
    default_group = push_groups.get('default')

    def send_to_default_group(self, payload):
        logger = getLogger(__name__)
        logger.debug('Sending push notification: %s' % payload.get('type'))
        try:
            send_group_notification(group_name=self.default_group,
                                    payload=payload,
                                    ttl=1000)
        except Exception as err:
            logger.error(
                'An error occurred when trying to send '
                'a push notification: %s' % err
            )
