from pymongo import MongoClient
import pandas as pd
import numpy as np
import sys
import datetime

def readScriptData():

    projectId = sys.argv[1]
    assert(projectId != '')

    #Connect to database for script
    client = MongoClient()
    db = client['project-' + str(projectId)]

    #Read in data from collection
    dataInputCollection = db['project_input_data']

    #for data in dataInputCollection.find():

    #Import into dataframe
    df = pd.DataFrame(list(dataInputCollection.find()))

    #Return data
    return df


def writeScriptDataDict(outputDataDict):
    scriptId = sys.argv[2]
    assert(scriptId != '')

    #Connect to database for script
    client = MongoClient()
    db = client['script-' + str(scriptId)]

    #Connect to collection
    dataOutputCollection = db['script_output_data']

    for key in outputDataDict:
        if isinstance(outputDataDict[key], np.int64):
            outputDataDict[key] = int(outputDataDict[key])

    outputDataDict['time_received'] =  datetime.datetime.utcnow()

    dataOutputCollection.insert(outputDataDict)


def writeScriptDataFrame(outputDataFrame):

    scriptId = sys.argv[2]
    assert(scriptId != '')

    #Connect to database for script
    client = MongoClient()
    db = client['script-' + str(scriptId)]

    #Connect to collection
    dataOutputCollection = db['script_output_data']
    print(outputDataFrame.to_dict())

    dataOutputCollection.insert(outputDataFrame.to_dict())
