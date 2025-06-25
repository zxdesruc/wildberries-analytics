видео превью: https://www.dropbox.com/scl/fi/mdhebfin7zb0trmrprle4/Vite-React-Google-Chrome-2025-06-24-17-57-04.mp4?rlkey=um90mdon2o464vndsctbuv5hw&st=nbc4h998&dl=0
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

парсер: 
в директории wildberries_analytics/wildberries_analytics
python3 manage.py shell
from products.parser import parse_wildberries
parse_wildberries("пауэрбанк", limit=50, delay=1.5)


соритровку делал по цене со скидкой, а не без скидки, посчитал, что так логичнее



