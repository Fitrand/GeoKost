import psycopg2

conn = psycopg2.connect('postgresql://postgres:geokost1411@[2406:da12:5ca:b700:e552:b6d2:9ce2:a4ed]:5432/postgres?sslmode=require')
cur = conn.cursor()
cur.execute("SELECT id, nama, is_active FROM kost WHERE nama ILIKE '%jakfar%'")
rows = cur.fetchall()
print("ROWS JAKFAR:", rows)

cur.execute("SELECT id, nama, is_active FROM kost")
all_rows = cur.fetchall()
print("TOTAL KOST IN DB:", len(all_rows))
