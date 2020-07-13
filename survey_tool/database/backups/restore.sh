cat backup.sql | docker exec -i db /usr/bin/mysql -u homer --password="TEST" domain_user_study
