from crontab import CronTab, CronSlices
from django.conf import settings


def initDataLifetimeManagement():
    cron = CronTab(user='root')

    #If cron string not valid, return error
    if not CronSlices.is_valid(settings.DATA_LIFETIME_FREQUENCY):
        raise ValueError('Invalid cronstring for DATA_LIFETIME_FREQUENCY')

    #Check for existing datalifetime cron job
    existing = cron.find_comment('DataLifetimeManagement')
    existing_list = []
    for e in existing:
        existing_list.append(e)

    #If exists, update with new time
    if len(existing_list) == 1:
        job = existing_list[0]
        job.setall(str(settings.DATA_LIFETIME_FREQUENCY))
        cron.write()

    #If doesn't exist, create new job
    elif len(existing_list) == 0:

        job = cron.new(command = settings.SCRIPT_ENV_LOCATION + ' ' + settings.SCRIPT_FOLDER_LOCATION + '/' + 'dataLifetime.py')

        job.set_comment('DataLifetimeManagement')
        job.setall(settings.DATA_LIFETIME_FREQUENCY)

        cron.write()

    #Else delete existing jobs and create a new one
    else:
        for job in existing_list:
            cron.remove(job)

        job = cron.new(command = settings.SCRIPT_ENV_LOCATION + ' ' + settings.SCRIPT_FOLDER_LOCATION + '/' + 'dataLifetime.py')

        job.set_comment('DataLifetimeManagement')
        job.setall(settings.DATA_LIFETIME_FREQUENCY)

        cron.write()
