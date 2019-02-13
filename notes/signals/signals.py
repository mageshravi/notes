import django.dispatch

# custom signals defined here.

folder_updated = django.dispatch.Signal(providing_args=['instance'])

note_updated = django.dispatch.Signal(providing_args=['instance'])
