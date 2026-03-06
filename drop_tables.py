import psycopg2

conn = psycopg2.connect("postgresql://postgres:password@localhost:5432/App Connectivity")
conn.autocommit = True
cur = conn.cursor()

tables = ["data_to_be_captured", "margin", "element_status", "transformation_capacity"]
for tbl in tables:
    cur.execute(f'DROP TABLE IF EXISTS "{tbl}" CASCADE')
    print(f"Dropped table {tbl}")
cur.close()
conn.close()
print("Success")
