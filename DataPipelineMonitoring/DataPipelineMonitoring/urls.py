"""DataPipelineMonitoring URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from DPMonitoringApp import views, setup_datalifetime

urlpatterns = [
    path('admin/', admin.site.urls),
    path('API/create_script/<user>/<project_id>', views.createScript, name='createScript'),
    path('API/receive_data/<project_id>', views.receiveData, name='receiveData'),
    path('API/input_data/<project_id>', views.getInputData, name='getInputData'),
    path('API/output_data/<script_id>', views.getOutputData, name='getOutputData'),
    path('API/output_data/<user>/<script_id>', views.getOutputData, name='getOutputData'),
    path('API/save_script/<script_id>', views.saveScript, name='saveScript'),
    path('API/delete_script/<script_id>', views.deleteScript, name='deleteScript'),
    path('API/user_script_list/<user>', views.getUserScriptList, name='getUserScriptList'),
    path('API/schedule_script/<script_id>', views.scheduleScript, name='scheduleScript'),
    path('API/create_project/<user>', views.createProject, name='createProject'),
    path('API/get_project_list/<user>', views.getProjectList, name='getProjectList'),
    path('API/testing/create_test_script/<user>/<test_script_id>/<test_project_id>', views.createTestScript, name='createTestScript'),
    path('API/delete_project/<user>/<project_id>', views.deleteProject, name='deleteProject'),
    path('API/save_project/<user>/<project_id>', views.saveProject, name='saveProject'),
    path('API/update_access/<user>/<project_id>', views.updateAccess, name='updateAccess'),
    path('API/remove_access/<user>/<project_id>', views.removeAccess, name='removeAccess'),
    path('API/set_data_lifetime/<user>/<project_id>', views.setDataLifetime, name='setDataLifetime'),
]


setup_datalifetime.initDataLifetimeManagement()
