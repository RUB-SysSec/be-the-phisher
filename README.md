# be-the-phisher
Code related to the study presented in "Be the Phisher - Understanding Users’ Perception of Malicious Domains" @ AsiaCCS 2020

## Survey tool
Please follow the instructions below if you want to test the survey tool.

### Prerequisites
The survey tool uses Docker [1] and docker-compose [2] so that you need to install them first.

[1] https://docs.docker.com/get-docker/
[2] https://docs.docker.com/compose/install/

### Instructions for testing

If you want to test the survey tool locally on your computer, please change the following settings:

* Replace the default database password "TEST" with an actual password in the following locations:
  * survey_tool/database/backups/backup.sh
  * survey_tool/database/backups/restore.sh
  * survey_tool/docker-compose.yml (option MYSQL_PASSWORD)
  * survey_tool/export_db_to_csv.py (line 11)
  * survey_tool/nodejs_server/src/app.js (line 39)

* Replace the default MySQL root password "TEST" with an actual password in the following locations:
  * survey_tool/docker-compose.yml (option MYSQL_ROOT_PASSWORD)

Executing survey_tool/deploy_testing.sh will spin up the necessary Docker containers and start the survey tool.
Afterwards, you can access the survey tool via localhost:5000 in your browser.

### Instructions for production
In addition to the settings mentioned in the previous section, please change the following settings:

* In survey_tool/init_letsencrypt.sh:
  * Replace the domain TEST in line 8 with your (sub)domain.
  * Replace the e-mail address in line 11 with an actual e-mail address.
* In survey_tool/data/nginx/app.conf, replace the server_name TEST in the following lines with your (sub)domain:
  * line 3
  * line 17
  * line 20
  * line 21

Executing survey_tool/deploy_production.sh will spin up the necessary Docker containers, generate the certificate, and start the survey tool.
Afterwards, you can access the survey tool via https://<your_domain>.

## Survey results
You can find the results of the conducted survey, which is the basis of our publication, in survey_tool/data/results/full_study/.
The results of the pre-study are available in survey_tool/data/results/pre_study/.

## Analysis notebooks
We used Jupyter Notebooks [1] to analyze the survey results.
You can find the corresponding notebooks in the folder notebooks.

[1] https://jupyter.org/install