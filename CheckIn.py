from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# CREATE TABLE IF NOT EXISTS customers (
#     phone VARCHAR(15) PRIMARY KEY,  -- phone is primary key
#     name VARCHAR(100) NULL,  -- name is optional
#     second_name VARCHAR(100) NULL,  -- second name is optional
#     email VARCHAR(100) NULL UNIQUE,  -- email is optional and unique
#     dob DATE NULL,  -- date of birth is optional
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
    name = data.get('name', None)  # Make it optional
    second_name = data.get('second_name', None)  # Second name, optional
    email = data.get('email', None)  # Make it optional
    phone = data['phone']  # This is required and primary key
    dob = data.get('dob', None)  # Date of birth, optional

    conn = create_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('INSERT INTO customers (name, second_name, email, phone, dob) VALUES (%s, %s, %s, %s, %s)', (name, second_name, email, phone, dob))
        conn.commit()
        return jsonify({"status": "success", "message": "Customer registered successfully"})
    except mysql.connector.Error as err:
        return jsonify({"status": "fail", "message": f"Error: {err}"})
    finally:
        cursor.close()
        conn.close()

@app.route('/check_customer', methods=['GET'])
def check_customer():
    phone = request.args.get('phone')  # Check by phone number

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute('SELECT * FROM customers WHERE phone = %s', (phone,))
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

