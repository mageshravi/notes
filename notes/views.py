from django.shortcuts import render
from django.views.generic import View

from .models import Folder, Tag, Note


class Home(View):

    def get(self, request):
        # folders
        folders = Folder.objects.all()
        tags = Tag.objects.all()

        default_folder = Folder.objects.get(pk=1)
        notes = Note.objects.filter(folder=default_folder)
        note = notes[0] if len(notes) else None

        context = {
            'folders': folders,
            'tags': tags,
            'notes': notes,
            'note': note
        }
        return render(request, 'default.html', context)
