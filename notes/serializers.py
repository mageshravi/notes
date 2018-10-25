from datetime import datetime

from .models import Folder, Note, Tag
from django.urls import reverse


class FolderSerializer(object):

    def serialize(self, folder: Folder):
        """serializes the given object to dict
        """
        return {
            'id': folder.id,
            'name': folder.name,
            'url': reverse('notes:in-folder', kwargs={'folder_name': folder.name})
        }


class TagSerializer(object):

    def serialize(self, tag: Tag):
        """serializes the given object to dict
        """
        return {
            'id': tag.id,
            'handle': tag.handle,
            'url': reverse('notes:with-tag', kwargs={'tag_handle': tag.handle})
        }


class NoteSerializer(object):

    def _format_datetime(self, dt: datetime):
        """returns time if today, the date otherwise
        """

        today = datetime.now()
        if today.date() == dt.date():
            return dt.strftime('%H:%M %P')
        else:
            return dt.strftime('%d %b %Y')

    def serialize_minimal(self, note: Note):

        return {
            'id': note.id,
            'title': note.title,
            'slug': note.slug,
            'url': reverse('notes:detail', kwargs={'note_slug': note.slug}),
            'updated_at': self._format_datetime(note.updated_at)
        }

    def serialize_full(self, note: Note):

        tag_serializer = TagSerializer()
        folder_serializer = FolderSerializer()

        return {
            'id': note.id,
            'title': note.title,
            'slug': note.slug,
            'content': note.content,
            'updated_at': self._format_datetime(note.updated_at),
            'tags': [tag_serializer.serialize(tag) for tag in note.tags.all()],
            'folder': folder_serializer.serialize(note.folder)
        }
