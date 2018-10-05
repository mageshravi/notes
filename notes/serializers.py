from .models import Folder, Tag, Note


class FolderSerializer(object):

    def serialize(self, folder: Folder):
        """serializes the given object to dict
        """
        return {
            'id': folder.id,
            'name': folder.name
        }


class TagSerializer(object):

    def serialize(self, tag: Tag):
        """serializes the given object to dict
        """
        return {
            'id': tag.id,
            'handle': tag.handle
        }


class NoteSerializer(object):

    def serialize_minimal(self, note: Note):

        return {
            'id': note.id,
            'title': note.title,
            'slug': note.slug,
            'updated_at': note.updated_at
        }

    def serialize_full(self, note: Note):

        tag_serializer = TagSerializer()
        folder_serializer = FolderSerializer()

        return {
            'id': note.id,
            'title': note.title,
            'slug': note.slug,
            'content': note.content,
            'updated_at': note.updated_at,
            'tags': [tag_serializer.serialize(tag) for tag in note.tags.all()],
            'folder': folder_serializer.serialize(note.folder)
        }
