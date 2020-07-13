docker rm nodejs_server
docker rmi nodejs_server:latest
docker-compose up -d database
docker-compose up --build nodejs_server