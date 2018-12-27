import logging

from django.contrib import admin
from django.conf import settings
from django.forms import ModelForm
from django.http import HttpRequest

from webpush import send_group_notification

from .models import *
from .serializers import *


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    pass


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    pass


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):

    def save_model(self,
                   request: HttpRequest,
                   note: Note,
                   form: ModelForm,
                   change: bool):
        """overriding to implement push notifications after saving
        """
        # get the 'notes' logger (__name__ = notes.admin)
        logger = logging.getLogger(__name__)

        super().save_model(request, note, form, change)

        note_serializer = NoteSerializer()
        serialized_note = note_serializer.serialize_minimal(note)

        note_meta = {
            'folder': note.folder.id,
            'tags': [tag.id for tag in note.tags.all()]
        }

        serialized_note['meta'] = note_meta

        payload = {
            'noteData': serialized_note
        }

        if change:
            # update
            if form.changed_data:
                payload['type'] = 'note:updated'
            else:
                logger.debug('Nothing changed')
                return
            # endif
        else:
            # create
            payload['type'] = 'note:created'
        # endif

        push_groups = getattr(settings, 'PUSH_NOTIFICATION_GROUPS', {})
        default_group = push_groups.get('default')
        try:
            send_group_notification(group_name=default_group,
                                    payload=payload,
                                    ttl=1000)
        except Exception as err:
            logger.error('An error occurred when trying to send '
                         'push notifications in '
                         'notes.admin.NoteAdmin.save_model: %s' % err)
            pass
