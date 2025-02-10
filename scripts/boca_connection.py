

import psycopg2


def list_tables_and_content():
    # Database connection parameters
    host = "boca.inf.ufes.br"
    port = 15432
    user = "postgres"
    password = "filipe"
    database = "filipe_teste"

    try:
        # Establish the connection
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )
        cursor = conn.cursor()

        # Retrieve the list of tables
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()

        # Iterate over each table and retrieve its content
        for table in tables:
            table_name = table[0]
            print(f"Table: {table_name}")

            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()

            for row in rows:
                print(row)
            print("\n")

        # Close the cursor and connection
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")


# Call the function
list_tables_and_content()
