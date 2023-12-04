from django.db import models
from mongoengine import Document, DynamicDocument, StringField, UUIDField, DateTimeField, ListField, IntField

# Create your models here

# Common list of script Id
class ScriptIndex(Document):
    script_id = UUIDField(binary=False)
    user = StringField(max_length=50)

# Individual Scripts
class ScriptInfo(Document):
    script_id = UUIDField(binary=False)
    project_id = UUIDField(binary=False)
    user = StringField(max_length=50)
    script_name = StringField(max_length=50)
    script_file = StringField(max_length=100)
    scheduled_runtime = DateTimeField()

# Common list of projects
class ProjectIndex(Document):
    project_id = UUIDField(binary=False)
    owner = StringField(max_length=50)
    editors = ListField()
    viewers = ListField()

# Individual Project info
class ProjectInfo(Document):
    project_id = UUIDField(binary=False)
    project_name = StringField(max_length=50)
    owner = StringField(max_length=50)     
    editors = ListField()
    viewers = ListField()
    scripts = ListField() # stores script ids

    dataLifetimeMinutes = IntField()
    dataLifetimeHours = IntField()
    dataLifetimeDays = IntField()
    dataLifetimeMonths = IntField()
    dataLifetimeYears = IntField()

class ProjectInputData(DynamicDocument):
    timeReceived = DateTimeField()

class ScriptOutputData(DynamicDocument):
    timeReceived = DateTimeField()
