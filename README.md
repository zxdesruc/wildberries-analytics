установка:

git clone https://github.com/zxdesruc/wildberries-analytics.git
cd wildberries-analytics

python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt

sudo -u postgres psql
--------------------
-- Создаём базу данных
CREATE DATABASE wildberries;

-- Создаём пользователя с паролем
CREATE USER wbuser WITH PASSWORD 'P@ssw0rd';

-- Настройки
ALTER ROLE wbuser SET client_encoding TO 'utf8';
ALTER ROLE wbuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE wbuser SET timezone TO 'UTC';

-- Даем все права на базу
GRANT ALL PRIVILEGES ON DATABASE wildberries TO wbuser;

\q
--------------------

cd wildberries-frontend
npm install
npm run dev



