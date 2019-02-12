import logging

from django.conf import settings
from django.contrib import admin
from django.forms import ModelForm
from django.http import HttpRequest

from webpush import send_group_notification

from .models import *
from .notifications import PushNotification
from .serializers import *
from .signals import signals


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):

    def save_model(self,
                   request: HttpRequest,
                   folder: Folder,
                   form: ModelForm,
                   change: bool):
        """overriding to implement push notifications after saving
        """

        super().save_model(request, folder, form, change)

        if not change:
            # folder:created handled by post_save signal
            return
        # endif

        if change and not form.changed_data:
            # no fields were modified
            return
        # endif

        signals.folder_updated.send(sender=folder.__class__, instance=folder)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):

    def save_model(self,
                   request: HttpRequest,
                   tag: Tag,
                   form: ModelForm,
                   change: bool):
        """overriding to implement push notifications after saving
        """

        super().save_model(request, tag, form, change)

        if not change:
            # tag:created handled by post_save signal
            return
        # endif

        if change and not form.changed_data:
            # no fields were modified
            return
        # endif

        signals.tag_updated.send(sender=tag.__class__, instance=tag)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):

    def save_model(self,
                   request: HttpRequest,
                   note: Note,
                   form: ModelForm,
                   change: bool):
        """overriding to implement push notifications after saving
        """

        super().save_model(request, note, form, change)

        if not change:
            # note:created handled by post_save signal
            return
        # endif

        if change and not form.changed_data:
            # no fields were modified
            return
        # endif

        signals.note_updated.send(sender=note.__class__, instance=note)
