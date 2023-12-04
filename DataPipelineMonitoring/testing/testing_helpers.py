import os

base_url = 'http://localhost:8080/'

SCRIPT_FOLDER_LOCATION = '/var/lib/dpmonitoring_scripts'

#Manually creates a test project in the database with the given project id
def generateTestProject(client, test_project_id, owner="testUser"):

    #Create unique project db
    db = client['project-' + str(test_project_id)]
    project_info = db['project_info']
    info_object = { "project_id" : test_project_id, "project_name" : "TestProject", "owner" : owner, "editors" : [ ], "viewers" : [ ], "scripts" : [ ] }
    project_info.insert_one(info_object)

    #Create project index entry
    db = client['project-index']
    indexCollection = db['project_index']
    index_object = {"project_id" : test_project_id, "owner" : owner, "editors" : [ ], "viewers" : [ ] }
    indexCollection.insert_one(index_object)

#Manually deletes a project from the database
def deleteTestProject(client, test_project_id):

    #Delete unique project db
    client.drop_database('project-' + str(test_project_id))

    #Delete project index entry
    db = client['project-index']
    indexCollection = db['project_index']
    indexCollection.delete_one({'project_id': test_project_id})


#Manually deletes a script from the database
def deleteTestScript(client, test_script_id):
    #Delete unique script db
    client.drop_database('script-' + str(test_script_id))

    #Delete script index entry
    db = client['script-index']
    indexCollection = db['script_index']
    indexCollection.delete_one({'script_id': test_script_id})

    #Delete script file
    script_filename = "script-" + test_script_id + ".py"
    scriptFolderPath = SCRIPT_FOLDER_LOCATION + "/" + script_filename
    os.remove(scriptFolderPath)
