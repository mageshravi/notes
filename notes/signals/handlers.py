import logging

from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from notes.models import Folder, Note, Tag
from notes.notifications import PushNotification
from notes.serializers import FolderSerializer, TagSerializer, NoteSerializer
from notes.signals.signals import folder_updated, tag_updated, note_updated
from webpush import send_group_notification


@receiver(post_save, sender=Folder)
def folder_created_handler(sender, **kwargs):
    """handles the built-in post_save signal for Folder.
    Used for folder:created scenario.
    Not useful for folder:updated as there is no reliable way to detect changes

    Arguments:
        sender {django.db.models.Model} -- The object dispatching the signal
    """

    if not kwargs.get('created'):
        return
    # endif

    folder: Folder = kwargs.get('instance')
    serialized_folder = FolderSerializer().serialize(folder)

    payload = {
        'head': 'New folder',
        'body': folder.name,
        'url': '/#%s' % serialized_folder.get('url'),
        'type': 'folder:created',
        'folderData': serialized_folder,
    }

    PushNotification().send_to_default_group(payload)


@receiver(folder_updated, sender=Folder)
def folder_updated_handler(sender, **kwargs):
    """handles the folder_updated signal
    """

    folder: Folder = kwargs.get('instance')
    serialized_folder = FolderSerializer().serialize(folder)

    payload = {
        'head': 'Folder updated',
        'body': folder.name,
        'url': '/#%s' % serialized_folder.get('url'),
        'type': 'folder:updated',
        'folderData': serialized_folder,
    }

    PushNotification().send_to_default_group(payload)


@receiver(post_delete, sender=Folder)
def folder_deleted_handler(sender, **kwargs):
    """handles the post_delete signal for Folder
    """

    folder: Folder = kwargs.get('instance')
    serialized_folder = FolderSerializer().serialize(folder)

    payload = {
        'head': 'Folder deleted',
        'body': folder.name,
        'url': '/#%s' % serialized_folder.get('url'),
        'type': 'folder:deleted',
        'folderData': serialized_folder,
    }

    PushNotification().send_to_default_group(payload)


@receiver(post_save, sender=Note)
def note_post_save_handler(sender, **kwargs):
    """handles the built-in post_save signal for Note.
    Used for note:created notification.
    Not useful for note:updated as there is no reliable way to detect changes

    Arguments:
        sender {django.db.models.Model} -- The object dispatching the signal
    """

    if not kwargs.get('created'):
        return
    # endif

    note: Note = kwargs.get('instance')
    serialized_note = NoteSerializer().serialize_minimal(note)
    serialized_note['meta'] = {
        'folder': note.folder.id,
        'tags': [tag.id for tag in note.tags.all()]
    }

    payload = {
        'head': 'New note',
        'body': note.title,
        'url': '/#%s' % (serialized_note.get('url')),
        'type': 'note:created',
        'noteData': serialized_note
    }

    PushNotification().send_to_default_group(payload)


@receiver(note_updated, sender=Note)
def note_updated_handler(sender, **kwargs):
    """handles the note_updated signal
    """

    note: Note = kwargs.get('instance')
    serialized_note = NoteSerializer().serialize_minimal(note)
    serialized_note['meta'] = {
        'folder': note.folder.id,
        'tags': [tag.id for tag in note.tags.all()]
    }

    payload = {
        'head': 'Note updated',
        'body': note.title,
        'url': '/#%s' % (serialized_note.get('url')),
        'type': 'note:updated',
        'noteData': serialized_note
    }

    PushNotification().send_to_default_group(payload)


@receiver(post_delete, sender=Note)
def note_deleted_handler(sender, **kwargs):
    """handles the post_delete signal for Note
    """

    note: Note = kwargs.get('instance')
    serialized_note = NoteSerializer().serialize_minimal(note)
    serialized_note['meta'] = {
        'folder': note.folder.id,
        'tags': [tag.id for tag in note.tags.all()]
    }

    payload = {
        'head': 'Note deleted',
        'body': note.title,
        'url': '/#%s' % (serialized_note.get('url')),
        'type': 'note:deleted',
        'noteData': serialized_note
    }

    PushNotification().send_to_default_group(payload)


@receiver(post_save, sender=Tag)
def tag_created_handler(sender, **kwargs):
    """handles the build-in post_save signal for Tag.
    Used for tag:created scenario.
    Not useful for tag:updated as there is no reliable way to detect changes

    Arguments:
        sender {django.db.models.Model} -- The object dispatching the signal
    """

    if not kwargs.get('created'):
        return
    # endif

    tag: Tag = kwargs.get('instance')
    serialized_tag = TagSerializer().serialize(tag)

    payload = {
        'head': 'New tag',
        'body': tag.handle,
        'url': '/#%s' % serialized_tag.get('url'),
        'type': 'tag:created',
        'tagData': serialized_tag,
    }

    PushNotification().send_to_default_group(payload)


@receiver(tag_updated, sender=Tag)
def tag_updated_handler(sender, **kwargs):
    """handles the tag_updated signal
    """

    tag: Tag = kwargs.get('instance')
    serialized_tag = TagSerializer().serialize(tag)

    payload = {
        'head': 'Tag updated',
        'body': tag.handle,
        'url': '/#%s' % (serialized_tag.get('url')),
        'type': 'tag:updated',
        'tagData': serialized_tag,
    }

    PushNotification().send_to_default_group(payload)


@receiver(post_delete, sender=Tag)
def tag_deleted_handler(sender, **kwargs):
    """handles the post_delete signal for tag
    """

    tag: Tag = kwargs.get('instance')
    serialized_tag = TagSerializer().serialize(tag)

    payload = {
        'head': 'Tag deleted',
        'body': tag.handle,
        'url': '/#%s' % serialized_tag.get('url'),
        'type': 'tag:deleted',
        'tagData': serialized_tag,
    }

    PushNotification().send_to_default_group(payload)
