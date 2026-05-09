# Используем официальный образ MySQL
FROM mysql:8.0

# Устанавливаем переменные окружения по умолчанию
# (Их также можно переопределить в docker-compose.yml)
ENV MYSQL_DATABASE=drevo_db
ENV MYSQL_ROOT_PASSWORD=root_password

# Копируем наш скрипт инициализации в специальную папку контейнера
COPY ./init.sql /docker-entrypoint-initdb.d/

# Открываем стандартный порт MySQL
EXPOSE 3306