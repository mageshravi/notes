from django.conf import settings


def vapid_attrs(request):
    webpush_settings = getattr(settings, 'WEBPUSH_SETTINGS', {})
    vapid_key = webpush_settings.get('VAPID_PUBLIC_KEY')
    return {
        'vapid_key': vapid_key
    }
