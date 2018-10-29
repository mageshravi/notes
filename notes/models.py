import re

from ckeditor.fields import RichTextField
from django.core.exceptions import ValidationError
from django.db import models


class Folder(models.Model):
    name = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def clean(self):
        # name has same rules as slug, but without slashes
        pattern = re.compile('^[a-z0-9_]+$', re.IGNORECASE)
        if not pattern.match(self.name):
            raise ValidationError({
                'name': ValidationError(
                    'Only alphanumeric characters and underscore allowed',
                    code='invalid'
                )
            })
        # endif


class Tag(models.Model):
    handle = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.handle

    def clean(self):
        # handle has same rules as slug, but without slashes
        pattern = re.compile('^[a-z0-9_]+$', re.IGNORECASE)
        if not pattern.match(self.handle):
            raise ValidationError({
                'handle': ValidationError(
                    'Only alphanumeric characters and underscore allowed',
                    code='invalid'
                )
            })
        # endif


class Note(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = RichTextField(extra_plugins=['codesnippet'])
    tags = models.ManyToManyField(Tag, related_name='notes')
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
