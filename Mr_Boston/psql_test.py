import psycopg2

dbname="cocktailproject"
user="postgres"
password="password"


conn = psycopg2.connect(dbname=dbname, user=user, password=password)
cur = conn.cursor()
cur.execute('SELECT version()')
db_ver = cur.fetchone()
print(db_ver)
cur.close()
conn.close()