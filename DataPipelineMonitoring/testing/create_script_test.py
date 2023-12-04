import requests
import uuid
import os
from pymongo import MongoClient
import pytest
from testing_helpers import generateTestProject, deleteTestProject, deleteTestScript, base_url, SCRIPT_FOLDER_LOCATION

#
# All helper methods and base_url in testing_helpers.py
#

#Used to delete created script during cleanup
currentScriptID = ''

#Fixture to handle setup and teardown for this test
@pytest.fixture()
def setupTeardownCreateScript():

    #SETUP
    client = MongoClient()
    testProjectID = uuid.uuid4()

    generateTestProject(client, testProjectID)


    #RUN TEST (Pass in needed params)
    yield (client, testProjectID)


    #TEARDOWN

    #Get currentScriptID to delete if a script was created
    global currentScriptID

    deleteTestProject(client, testProjectID)

    if currentScriptID != '' :
        deleteTestScript(client, currentScriptID)
        currentScriptID = ''

    client.close()






#Fixture runs the same test again using different data for each argument in params.
@pytest.fixture(scope='function', params=[{'name': 'createScriptTest', 'user': 'testUser'}, {'name': 'test123', 'user': 'user'}])
def create_script_params(request):
    p = request.param
    script_name = p['name']
    script_user = p['user']
    return (script_name, script_user)


# Create Script test
def test_create_script(setupTeardownCreateScript, create_script_params):

    #Get client and project id from setup
    client, testProjectID = setupTeardownCreateScript

    #Get script_name and script_user from params
    script_name, script_user = create_script_params

    #Make create script request to server
    url = base_url + "API/create_script/" + script_user + "/" + str(testProjectID)
    data_in = {'name': script_name}
    response = requests.post(url, data = data_in)
    response_body = response.json()
    response.close()


    #Get results from response
    project_id = str(response_body['project_id'])
    script_id = str(response_body['script_id'])
    script_filename = "script-" + script_id + ".py"
    scriptFolderPath = SCRIPT_FOLDER_LOCATION + "/" + script_filename

    #Set script id for cleanup
    global currentScriptID
    currentScriptID = script_id

    #Check that project contains script
    db = client['project-' + str(testProjectID)]
    project_info = db['project_info']
    info = project_info.find_one()
    scripts = info['scripts']

    assert response.status_code == 200
    assert response_body['name'] == script_name
    assert os.path.exists(scriptFolderPath)
    assert scripts[0] == str(script_id)





#Fixture runs the same test again using different data for each argument in params.
@pytest.fixture(scope='function', params=[1234, 'abcd', ''])
def create_script_invalid_pid_params(request):
    return request.param

#Test create script with invalid project_id
def test_create_script_invalid_project_id(setupTeardownCreateScript, create_script_invalid_pid_params):

    #Get client and legitimate project id from setup
    client, testProjectID = setupTeardownCreateScript

    #Get from params
    invalidProjectID = create_script_invalid_pid_params

    #Define static user and script_name
    script_user = 'testUser'
    script_name = 'createScriptTest'

    #Make create script request to server
    url = base_url + "API/create_script/" + script_user + "/" + str(invalidProjectID)
    data_in = {'name': script_name}
    response = requests.post(url, data = data_in)
    response.close()

    assert response.status_code != 200
