import django.dispatch

folder_updated = django.dispatch.Signal(providing_args=['instance'])

tag_updated = django.dispatch.Signal(providing_args=['instance'])

note_updated = django.dispatch.Signal(providing_args=['instance'])
