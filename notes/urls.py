from django.urls import path
from .views import *

app_name = 'notes'
urlpatterns = [
    path('', Home.as_view(), name='home'),
    path('folders/', FoldersList.as_view(), name='folders'),
    path('tags/', TagsList.as_view(), name='tags'),
    path('folders/<slug:folder_name>/',
         NotesInFolder.as_view(),
         name='in-folder'),
    path('tags/<slug:tag_handle>/', NotesWithTag.as_view(), name='with-tag'),
    path('notes/<slug:note_slug>/', NoteDetail.as_view(), name='detail'),
]
