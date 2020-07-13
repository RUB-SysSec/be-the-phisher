# stop and remove old containers
docker stop survey_tool_nginx_1
docker rm survey_tool_nginx_1
docker stop nodejs_server
docker rm nodejs_server
docker stop db
docker rm db

# remove old images
docker rmi nodejs_server:latest
docker rmi nginx:1.17.5-alpine
docker rmi mysql:latest
docker rmi certbot/certbot:latest
docker rmi node:10-alpine

# start database, nginx, and nodejs containers and init certificate 
docker-compose up -d database
docker-compose up -d nodejs_server
sudo /bin/bash ./init_letsencrypt.sh