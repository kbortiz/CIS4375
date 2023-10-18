from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# CREATE TABLE IF NOT EXISTS customers (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     name VARCHAR(100),
#     email VARCHAR(100) UNIQUE,
#     phone VARCHAR(15), -- new phone field
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );

# Configure database connection
def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host="localhost", 
            user="root",     
            passwd="your_password",  
            database="MyDatabase"
        )
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection


@app.route('/register', methods=['POST'])
def register_customer():
    data = request.json
    name = data['name']
    email = data['email']
    phone = data['phone']  

    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('INSERT INTO customers (name, email, phone) VALUES (%s, %s, %s)', (name, email, phone))  # include phone in SQL query
        conn.commit()
        return jsonify({"status": "success", "message": "Customer registered successfully"})
    except mysql.connector.Error as err:
        return jsonify({"status": "fail", "message": f"Error: {err}"})
    finally:
        cursor.close()
        conn.close()


@app.route('/check_customer', methods=['GET'])
def check_customer():
    email = request.args.get('email')

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute('SELECT * FROM customers WHERE email = %s', (email,))
        account = cursor.fetchone()
        if account:
            return jsonify({"status": "exists", "data": account})
        else:
            return jsonify({"status": "not_exists", "message": "Customer does not exist"})
    except mysql.connector.Error as err:
        return jsonify({"status": "fail", "message": f"Error: {err}"})
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
