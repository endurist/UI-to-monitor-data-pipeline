from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.core import serializers
from django.shortcuts import render
from django.conf import settings
from DPMonitoringApp import models
import uuid
from datetime import datetime
from mongoengine import *
import pymongo
from django.core.files import File
from crontab import CronTab, CronSlices
import os
import json
import re

# Create your views here.

def createTestScript(request, user, test_script_id, test_project_id):
    disconnect()

    #Get data from host
    newScriptName = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        newScriptName = data['name']
    else:
        # use request to collect text
        newScriptName = request.POST.get('name', '')

    #Write to script index
    connect('script-index')
    testIdStr = str(test_script_id)
    newScriptIndex = models.ScriptIndex(script_id=test_script_id, user=user).save()
    disconnect()

    #Write to new script database
    connect('script-' + testIdStr)
    scriptInfo = models.ScriptInfo(script_id=id, user=user, script_name=newScriptName,
                                    script_file="script-" + testIdStr + ".py", scheduled_runtime=None, project_id=test_project_id).save()
    disconnect()

    scriptFileObj = open(settings.SCRIPT_FOLDER_LOCATION + "/script-" + testIdStr + ".py", "w+")

    connect('project-' + str(test_project_id))
    projectInfo = models.ProjectInfo.objects().update_one(push__scripts=str(test_script_id))
    projectInfo.save()
    disconnect()
    return JsonResponse({'name':newScriptName, 'script_id':test_script_id, 'project_id':test_project_id})

def createScript(request, user, project_id):
    disconnect()
    #Get data from host
    
    newScriptName = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        newScriptName = data['name']
    else:
        # use request to collect text
        newScriptName = request.POST.get('name', '')

    #Write to script index
    connect('script-index')
    id = uuid.uuid4()
    idStr = str(id)
    newScriptIndex = models.ScriptIndex(script_id=id, user=user).save()
    disconnect()

    #Write to new script database
    connect('script-' + idStr)
    scriptInfo = models.ScriptInfo(script_id=id, user=user, script_name=newScriptName,
                                    script_file="script-" + idStr + ".py", scheduled_runtime=None, project_id=project_id).save()
    disconnect()
    scriptFileObj = open(settings.SCRIPT_FOLDER_LOCATION + "/script-" + idStr + ".py", "w+")


    connect('project-' + str(project_id))
    projectInfo = models.ProjectInfo.objects()[0]
    projectInfo.update(push__scripts=str(id))
    projectInfo.reload()
    disconnect()

    return JsonResponse({'name': newScriptName, 'script_id':id, 'project_id':project_id});

def receiveData(request, project_id):
    csvData = request.POST.get('data', '')
    #if(data == '') return error

    #Get list of columns from input data
    dataRows = csvData.split('\n')
    columns = dataRows.pop(0).split(',')

    #Check if last row is empty, in case of extra newline
    if dataRows[-1] == '' or dataRows[-1] == '\n':
        dataRows.pop(-1)

    #should probably trim whitespace here
    #Should also skip over rows of just whitespace

    #Write data to DB
    connect('project-' + str(project_id))
    currentDateTime = datetime.now()

    #Each row of text
    for row in dataRows:
        #Split into list of text
        row=row.split(',')

        #Create script data object, set time recieved
        projectData = models.ProjectInputData(time_received=currentDateTime)

        #For each column
        for i in range(0, len(columns)):
            #Add the attribute to the data
            setattr(projectData, columns[i], row[i])

        #Save row of data
        projectData.save()

    disconnect() 
    return HttpResponse("Data Received")

def getInputData(request, project_id):

    connect('project-' + str(project_id))
    inputData = models.ProjectInputData.objects().order_by('-time_received').exclude('_id')[:10]
    disconnect()

    docList = []
    for document in inputData:
        docDict = document.to_mongo().to_dict()
        docDict['time_received'] = docDict['time_received'].strftime("%m/%d/%Y %H:%M:%S")
        docList.append(docDict)

    #Return as an HTTP response instead of JSON to avoid double serializing, as mongoengine is already doing it
    return JsonResponse(docList, safe=False)

# Collect script text from frontend ace editor and save to script file
# Will need to validate scriptText at some point
def saveScript(request, script_id):
    # need to deal with script already created vs not
    # assuming it has already been created
    print(request.encoding)
    print('ScriptID: ' + str(script_id))
    scriptText = ''
    scriptName = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        scriptText = data['script_text']
        scriptName = data['name']
    else:
        # use request to collect text
        scriptText = request.POST.get('script_text')
        scriptName = request.POST.get('name')

    connect('script-' + str(script_id))

    # access script info collection
    cursor = models.ScriptInfo.objects(script_id = script_id) # returns cursor to all records matching this query. should only return one record
    scriptInfo = cursor[0]
    if scriptName != '' :
        scriptInfo.script_name = scriptName
        scriptInfo.save()

    disconnect() 

    # save scriptText to respective file in scriptsFolder directory script_file from scriptInfo
    filename = scriptInfo.script_file
    scriptFileObj = open(settings.SCRIPT_FOLDER_LOCATION + '/' + filename, "w+")
    scriptFileObj.write(scriptText)
    scriptFileObj.close()

    return JsonResponse({})

def getUserScriptList(request, user):
    disconnect()
    unityID = user
    connect('script-index')
    userScripts = models.ScriptIndex.objects(user=unityID)

    disconnect() 

    userScriptList = []

    for script in userScripts:
        scriptID = script.script_id
        connect('script-' + str(scriptID))
        scriptinfo = models.ScriptInfo.objects()
        scriptName = scriptinfo[0].script_name
        filename = scriptinfo[0].script_file
        #Read in script file and write text

        scriptFile = open(settings.SCRIPT_FOLDER_LOCATION + '/' + filename, "r")
        scriptText = scriptFile.read()

        userScriptList.append({'name': scriptName, 'id': scriptID, 'scriptText': scriptText})
        disconnect()

    return JsonResponse(userScriptList, safe=False)

# delete script file, cron entry, database, script index entry associated with scripts
def deleteScript(request, script_id):

    disconnect()
    # remove script file
    connect('script-' + script_id)

    scriptInfoSet = models.ScriptInfo.objects()
    scriptInfo = scriptInfoSet[0]

    disconnect()

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")

    if scriptInfoSet.count() > 0:

        # remove script file
        if os.path.exists(settings.SCRIPT_FOLDER_LOCATION + '/' + scriptInfo.script_file):
    	    os.remove(settings.SCRIPT_FOLDER_LOCATION + '/' + scriptInfo.script_file)

    	# remove script cron entry
        cron = CronTab(user='root')
        jobIter = cron.find_comment(re.compile(str(script_id)))
        for job in jobIter: # there should only be one, doing due diligence here
            cron.remove(job)
        cron.write()

        #Remove script from project database
        project_id = scriptInfo.project_id
        print(project_id)
        connect('project-' + str(project_id))

        projectInfo = models.ProjectInfo.objects()[0]
        projectInfo.update(pull__scripts=script_id)
        projectInfo.reload()
        disconnect()


        # Delete Script Database
        myclient.drop_database('script-' + str(script_id))
        

        # remove script index entry
        connect('script-index')

        indexCursor = models.ScriptIndex.objects(script_id=script_id)
        index = indexCursor[0]
        index.delete()

        disconnect()

    return JsonResponse({})

def scheduleScript(request, script_id):

    #Get Cron String from request
    cronString = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        cronString = data['schedule']
    else:
        cronString = request.POST.get('schedule')

    #If cron string not valid, return error
    if not CronSlices.is_valid(cronString):
        return HttpResponse(status=400)


    #Get script file name + project_id
    connect('script-' + str(script_id))

    scriptinfo = models.ScriptInfo.objects()
    scriptFileName = scriptinfo[0].script_file
    project_id = scriptinfo[0].project_id

    disconnect()


    #Access cron as root user
    cron = CronTab(user='root')


    #Check for existing script cron job
    existing = cron.find_comment(re.compile(script_id))
    existing_list = []
    for e in existing:
        existing_list.append(e)

    #If only one job, then update to new time
    if len(existing_list) == 1:
        job = existing_list[0]
        job.setall(str(cronString))
        cron.write()
        return HttpResponse("Successfully Scheduled")

    #If more than one job, remove existing jobs and create one new one
    elif len(existing_list) > 1:
        for job in existing_list:
            cron.remove(job)

        newJob = cron.new(command = settings.SCRIPT_ENV_LOCATION + ' ' + settings.SCRIPT_FOLDER_LOCATION + '/' + scriptFileName + ' ' + str(project_id) + ' ' + str(script_id))

        newJob.set_comment('project_id: ' + str(project_id) + ' ' + 'script_id: ' + str(script_id))
        newJob.setall(str(cronString))

        cron.write()
        return HttpResponse("Sucessfully Scheduled")

    else:

        #Else create new job
        job = cron.new(command = settings.SCRIPT_ENV_LOCATION + ' ' + settings.SCRIPT_FOLDER_LOCATION + '/' + scriptFileName + ' ' + str(project_id) + ' ' + str(script_id))

        job.set_comment('project_id: ' + str(project_id) + ' ' + 'script_id: ' + str(script_id))
        job.setall(str(cronString))

        cron.write()
        return HttpResponse("Sucessfully Scheduled")

# Create a project that will contain many scripts. 
def createProject(request, user):
    disconnect()
    projectName = ""
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        projectName = data['name']
    else:
        projectName = request.POST.get('name')
    
    project_id = uuid.uuid4()
    idStr = str(project_id)
    connect('project-' + idStr)
    projectInfo = models.ProjectInfo(project_id = project_id, project_name = projectName, owner = user)
    projectInfo.save()
    disconnect()
    
    connect('project-index')
    projectIndex = models.ProjectIndex(project_id=project_id, owner=user, editors=[], viewers=[])
    projectIndex.save()
    disconnect()
   
    return JsonResponse({'name':projectName, 'id':project_id}) 

# Return list of projects owned by current user
def getProjectList(request, user):
    disconnect()
    unityID = user
    connect('project-index')

    #Get each project with user access
    userProjects = models.ProjectIndex.objects(owner=unityID)
    editorProjects = models.ProjectIndex.objects(editors__contains=unityID)
    viewerProjects = models.ProjectIndex.objects(viewers__contains=unityID)

    disconnect()

    #Compile list of all projects with user access
    projectList = []

    #For each project in user owner projects
    for project in userProjects:
        #Get project information
        projectId = project.project_id
        connect('project-' + str(projectId))
        projectInfo = models.ProjectInfo.objects()
        projectName = projectInfo[0].project_name
        projectScripts = projectInfo[0].scripts
        projectOwner = projectInfo[0].owner
        projectEditors = projectInfo[0].editors
        projectViewers = projectInfo[0].viewers
        disconnect()

        #Get information on each script in the project
        scriptList = []
        for scriptId in projectScripts:
           connect('script-' + str(scriptId))
           scriptInfo = models.ScriptInfo.objects()
           scriptName = scriptInfo[0].script_name
           filename = scriptInfo[0].script_file
           scriptFile = open(settings.SCRIPT_FOLDER_LOCATION + '/' + filename, "r")
           scriptText = scriptFile.read()
           scriptFile.close()
           scriptList.append({'name': scriptName, 'id': scriptId, 'scriptText': scriptText})
           disconnect()

        #Add this to the list of projects
        projectList.append({'name': projectName, 'id': projectId, 'scripts': scriptList, 'user_access':'owner', 'project_access': {'owner': projectOwner, 'editors': projectEditors, 'viewers': projectViewers}})

    #For each project the user is an editor for
    for project in editorProjects:
        #Get project information
        projectId = project.project_id
        connect('project-' + str(projectId))
        projectInfo = models.ProjectInfo.objects()
        projectName = projectInfo[0].project_name
        projectScripts = projectInfo[0].scripts
        projectOwner = projectInfo[0].owner
        projectEditors = projectInfo[0].editors
        projectViewers = projectInfo[0].viewers
        disconnect()

        #Get information on each script in the project
        scriptList = []
        for scriptId in projectScripts:
           connect('script-' + str(scriptId))
           scriptInfo = models.ScriptInfo.objects()
           scriptName = scriptInfo[0].script_name
           filename = scriptInfo[0].script_file
           scriptFile = open(settings.SCRIPT_FOLDER_LOCATION + '/' + filename, "r")
           scriptText = scriptFile.read()
           scriptFile.close()
           scriptList.append({'name': scriptName, 'id': scriptId, 'scriptText': scriptText})
           disconnect()

        #Add this to the list of projects
        projectList.append({'name': projectName, 'id': projectId, 'scripts': scriptList, 'user_access':'editor', 'project_access': {'owner': projectOwner, 'editors': projectEditors, 'viewers': projectViewers}})

    #For each project the user has viewer access for
    for project in viewerProjects:
        #Get project information
        projectId = project.project_id
        connect('project-' + str(projectId))
        projectInfo = models.ProjectInfo.objects()
        projectName = projectInfo[0].project_name
        projectScripts = projectInfo[0].scripts
        projectOwner = projectInfo[0].owner
        projectEditors = projectInfo[0].editors
        projectViewers = projectInfo[0].viewers
        disconnect()

        #Get info on each script in the project
        scriptList = []
        for scriptId in projectScripts:
           connect('script-' + str(scriptId))
           scriptInfo = models.ScriptInfo.objects()
           scriptName = scriptInfo[0].script_name
           filename = scriptInfo[0].script_file
           scriptFile = open(settings.SCRIPT_FOLDER_LOCATION + '/' + filename, "r")
           scriptText = scriptFile.read()
           scriptFile.close()
           scriptList.append({'name': scriptName, 'id': scriptId, 'scriptText': scriptText})
           disconnect()

        #Add this to the list of projects
        projectList.append({'name': projectName, 'id': projectId, 'scripts': scriptList, 'user_access':'viewer', 'project_access': {'owner': projectOwner, 'editors': projectEditors, 'viewers': projectViewers}})

    return JsonResponse(projectList, safe=False)

def getOutputData(request, script_id, user=''):
    disconnect()

    connect('script-' + str(script_id))
    outputData = models.ScriptOutputData.objects().order_by('-time_received').exclude('_id')[:10]
    disconnect()

    docList = []
    for document in outputData:
        docDict = document.to_mongo().to_dict()
        docDict['time_received'] = docDict['time_received'].strftime("%m/%d/%Y %H:%M:%S")
        docList.append(docDict)

    #Return as an HTTP response instead of JSON to avoid double serializing, as mongoengine is already doing it
    return JsonResponse(docList, safe=False)

# delete script file, cron entry, database, script index entry associated with scripts
def deleteProject(request, project_id, user):
    
    disconnect()
    # Get Project Info
    connect('project-' + project_id)

    cursor = models.ProjectInfo.objects(project_id=project_id)
    ProjectInfo = cursor[0]

    disconnect()

    script_list = ProjectInfo.scripts

    print(script_list)

    #Open pymongo client to fully delete databases
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")

    #Delete All script in project
    for script_id in script_list:
        connect('script-' + str(script_id))

        cursor = models.ScriptInfo.objects(script_id=script_id)
        scriptInfo = cursor[0]

        disconnect()


        #Delete Script File
        if os.path.exists(settings.SCRIPT_FOLDER_LOCATION + '/' + scriptInfo.script_file ):
            os.remove(settings.SCRIPT_FOLDER_LOCATION + '/' + scriptInfo.script_file )

        #Delete script cron entry
        cron = CronTab(user='root')
        jobIter = cron.find_comment(re.compile(str(script_id)))
        for job in jobIter: # there should only be one, doing due diligence here
            cron.remove(job)
        cron.write()

        #Remove script db
        myclient.drop_database('script-' + str(script_id))

        #Remove script index entry
        connect('script-index')

        indexCursor = models.ScriptIndex.objects(script_id=script_id)
        index = indexCursor[0]
        index.delete()

        disconnect()


    #Delete Project

    #Delete Project Index
    connect('project-index')

    indexCursor = models.ProjectIndex.objects(project_id=project_id)
    index = indexCursor[0]
    index.delete()

    disconnect()

    #Delete Project Database
    myclient.drop_database('project-' + str(project_id))

    disconnect()

    #Close pymongo client
    myclient.close()

    return JsonResponse({})




def saveProject(request, project_id, user=''):
    
    print(request.encoding)
    projectName = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        projectName = data['name']
    else:
        # use request to collect text
        projectName = request.POST.get('name')

    connect('project-' + str(project_id))

    # access project info collection
    cursor = models.ProjectInfo.objects(project_id = project_id) # returns cursor to all records matching this query. should only return one record
    projectInfo = cursor[0]
    if projectName != '' :
        projectInfo.project_name = projectName
        projectInfo.save()

    disconnect()

    return JsonResponse({})


#Update a users access to a project
def updateAccess(request, project_id, user):


    userToAdd = ''
    accessLevel = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        userToAdd = data['user']
        accessLevel = data['access_level']
    else:
        # use request to collect text
        userToAdd = request.POST.get('user')
        accessLevel = request.POST.get('access_level')


    #Add to unique project database
    connect('project-' + str(project_id))
    projectInfo = models.ProjectInfo.objects()[0]

    if accessLevel == 'editor':

        #If previously owner, throw error because there must be an owner
        if projectInfo.owner == userToAdd:
            return HttpResponseBadRequest('Can not change owner to editor, there must be an owner')

        #Remove from viewer list if present
        projectInfo.update(pull__viewers=str(userToAdd))

        #Remove from editor list if present
        projectInfo.update(pull__editors=str(userToAdd))

        #Add to editors list
        projectInfo.update(push__editors=str(userToAdd))
        projectInfo.reload()

    elif accessLevel == 'viewer':

        #If previously owner, throw error because there must be an owner
        if projectInfo.owner == userToAdd:
            return HttpResponseBadRequest('Can not change owner to editor, there must be an owner')

        #Remove from viewer list if present
        projectInfo.update(pull__viewers=str(userToAdd))

        #Remove from editor list if present
        projectInfo.update(pull__editors=str(userToAdd))

        #Add to viewers list
        projectInfo.update(push__viewers=str(userToAdd))
        projectInfo.reload()

    elif accessLevel == 'owner':

        #Remove from viewer list if present
        projectInfo.update(pull__viewers=str(userToAdd))

        #Remove from editor list if present
        projectInfo.update(pull__editors=str(userToAdd))

        #Add previous owner to editors
        oldOwner = projectInfo.owner
        projectInfo.update(push__editors=str(oldOwner))

        #Set new owner
        projectInfo.update(owner = userToAdd)

        projectInfo.reload()

    else:
        return HttpResponseBadRequest('Invalid access level')

    disconnect()






    #Add to project index database
    connect('project-index')
    projectIndex = models.ProjectIndex.objects(project_id=project_id)[0]

    if accessLevel == 'editor':

        #If previously owner, throw error because there must be an owner
        if projectIndex.owner == userToAdd:
            return HttpResponseBadRequest('Can not change owner to editor, there must be an owner')

        #Remove from viewer list if present
        projectIndex.update(pull__viewers=str(userToAdd))

        #Remove from editor list if present
        projectIndex.update(pull__editors=str(userToAdd))

        #Add to editors list
        projectIndex.update(push__editors=str(userToAdd))
        projectIndex.reload()

    elif accessLevel == 'viewer':

        #If previously owner, throw error because there must be an owner
        if projectIndex.owner == userToAdd:
            return HttpResponseBadRequest('Can not change owner to editor, there must be an owner')

        #Remove from viewer list if present
        projectIndex.update(pull__viewers=str(userToAdd))

        #Remove from editor list if present
        projectIndex.update(pull__editors=str(userToAdd))

        #Add to viewers list
        projectIndex.update(push__viewers=str(userToAdd))
        projectIndex.reload()

    elif accessLevel == 'owner':

        #Remove from viewer list if present
        projectIndex.update(pull__viewers=str(userToAdd))

        #Remove from editor list if present
        projectIndex.update(pull__editors=str(userToAdd))

        #Add previous owner to editors
        oldOwner = projectIndex.owner
        projectIndex.update(push__editors=str(oldOwner))

        #Set new owner
        projectIndex.update(owner = userToAdd)

        projectIndex.reload()

    else:
        return HttpResponseBadRequest('Invalid access level')

    disconnect()

    return HttpResponse("Success")



def removeAccess(request, project_id, user):

    userToRemove = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        userToRemove = data['user']
    else:
        # use request to collect text
        userToRemove = request.POST.get('user')


    #Remove from unique project database
    connect('project-' + str(project_id))
    projectInfo = models.ProjectInfo.objects()[0]

    #If trying to remove owner, throw error because there must be an owner
    if projectInfo.owner == userToRemove:
        return HttpResponseBadRequest('Can not remove owner, there must be an owner')

    #Remove from viewer list if present
    projectInfo.update(pull__viewers=str(userToRemove))

    #Remove from editor list if present
    projectInfo.update(pull__editors=str(userToRemove))

    disconnect()



    #Remove from project index
    connect('project-index')
    projectIndex = models.ProjectIndex.objects(project_id=project_id)[0]

    #If trying to remove owner, throw error because there must be an owner
    if projectIndex.owner == userToRemove:
        return HttpResponseBadRequest('Can not remove owner, there must be an owner')

    #Remove from viewer list if present
    projectIndex.update(pull__viewers=str(userToRemove))

    #Remove from editor list if present
    projectIndex.update(pull__editors=str(userToRemove))

    disconnect()

    return HttpResponse("Success")


def setDataLifetime(request, project_id, user):

    cronString = ''
    if(request.encoding == 'UTF-8'):
        data = json.loads(request.body.decode('utf-8'))
        cronString = data['lifetime']
    else:
        cronString = request.POST.get('lifetime')

    #If cron string not valid, return error
    if not CronSlices.is_valid(cronString):
        return HttpResponse(status=400)

    connect('project-' + str(project_id))
    projectInfo = models.ProjectInfo.objects()[0]

    schedule = cronString.split(' ')

    minutes = schedule[0]
    if minutes != '*':
        projectInfo.update(dataLifetimeMinutes = int(schedule[0]))

    hours = schedule[1]
    if hours != '*':
        projectInfo.update(dataLifetimeHours = int(schedule[1]))

    days = schedule[2]
    if days != '*':
        projectInfo.update(dataLifetimeDays = int(schedule[2]))

    months = schedule[3]
    if months != '*':
        projectInfo.update(dataLifetimeMonths = int(schedule[3]))


    return HttpResponse("Success")
