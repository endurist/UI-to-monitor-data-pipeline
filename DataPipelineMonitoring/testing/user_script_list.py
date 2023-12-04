import requests
from crontab import CrontTab
import uuid
import os

base_url = 'http://localhost:8080/'

script_id = '4ba6ef55-f0d0-4f92-a3b4-ef1ba0f987bb'

#User Script List Test
def test_user_script_list():
    user = 'user1'
    r = requests.get(base_url + 'API/user_script_list/' + user)

    data = r.json()

    assert(len(data) > 0)
    assert(data[0]['name'] == 'test1')
    assert(data[0]['scriptText'] != '')
