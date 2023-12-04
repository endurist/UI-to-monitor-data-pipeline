from pymongo import MongoClient
import pandas as pd
import numpy as np
import sys
import datetime

def checkDataLifetime():

    client = MongoClient()

    #Get all projects from project index
    indexdb = client['project-index']
    indexCollection = indexdb['project_index']
    projects = indexCollection.find()

    #Save current time to check against
    currentTime = datetime.now()

    #For each project, load time offset and check against old data
    for project in projects:

        projectdb = client['project-' + str(project.project_id)]
        projectInfo = projectdb['project_info'][0]

        timeOffset = datetime.timedelta()

        #If project has data lifetime then load into offset
        if projectInfo.dataLifetimeMinutes not None:
            timeOffset.minutes = projectInfo.dataLifetimeMinutes

        if projectInfo.dataLifetimeHours not None:
            timeOffset.hours = projectInfo.dataLifetimeHours

        if projectInfo.dataLifetimeDays not None:
            timeOffset.days = projectInfo.dataLifetimeDays

        if projectInfo.dataLifetimeMonths not None:
            timeOffset.months = projectInfo.dataLifetimeMonths

        if projectInfo.dataLifetimeYears not None:
            timeOffset.years = projectInfo.dataLifetimeYears


        #If datalife exists and time offset is not zero, then go through and delete old data
        if timeOffset != datetime.timedelta(0):

            createdBefore = currentTime - timeOffset
            projectInputData = projectdb['project_input_data']
            projectInputData.delete_many({'time_recieved': {'$lt': createdBefore}})

        client.close()
