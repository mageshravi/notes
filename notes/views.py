from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.generic import View

from .models import Folder, Note, Tag
from .serializers import FolderSerializer, TagSerializer, NoteSerializer
import urllib


class Home(View):

    def get(self, request):
        return render(request, 'default.html')


class FoldersList(View):

    def get(self, request):
        folders = Folder.objects.all()
        serializer = FolderSerializer()
        result = []
        for folder in folders:
            result.append(serializer.serialize(folder))
        # endfor
        return JsonResponse(result, safe=False)


class TagsList(View):

    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer()
        result = []
        for tag in tags:
            result.append(serializer.serialize(tag))
        # endfor
        return JsonResponse(result, safe=False)


class NotesInFolder(View):

    def get(self, request, folder_name):
        folder_name = urllib.parse.unquote(folder_name)
        folder = get_object_or_404(Folder, name=folder_name)
        notes = Note.objects.filter(folder=folder)
        serializer = NoteSerializer()
        result = [serializer.serialize_minimal(note) for note in notes]
        return JsonResponse(result, safe=False)


class NotesWithTag(View):

    def get(self, request, tag_handle):
        tag_handle = urllib.parse.unquote(tag_handle)
        tag = get_object_or_404(Tag, handle=tag_handle)
        notes = Note.objects.filter(tags=tag)
        serializer = NoteSerializer()
        result = [serializer.serialize_minimal(note) for note in notes]
        return JsonResponse(result, safe=False)


class NoteDetail(View):

    def get(self, request, note_slug):
        note = get_object_or_404(Note, slug=note_slug)
        serializer = NoteSerializer()
        return JsonResponse(serializer.serialize_full(note))
