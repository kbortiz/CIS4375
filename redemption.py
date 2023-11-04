import flask
from flask import jsonify
from flask import request
from sql import create_connection
from sql import execute_query
from sql import execute_read_query
import datetime
from datetime import date
app = flask(__name__)

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

@app.route('/redeempromotion', methods=['POST'])
def redeem_promotion():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password", "Davi_Nails")
    
    request_data = request.get_json()
    customer_phone = request_data['phone_number']
    promotion_name = request_data['promo_name']

    # Get customer ID based on phone number
    get_customer_id_sql = "SELECT cust_ID FROM customer_information WHERE phone_number = %s"
    customer_id = execute_read_query(conn, get_customer_id_sql, (customer_phone,))

    # Get promotion ID based on promotion name
    get_promotion_id_sql = "SELECT promo_ID FROM promotions WHERE promo_name = %s"
    promotion_id = execute_read_query(conn, get_promotion_id_sql, (promotion_name,))

    if customer_id and promotion_id:
       
        add_redemption_sql = "INSERT INTO redemption_history (customer_id, promotion_id, redemption_date) VALUES (%s, %s, %s)"
        execute_query(conn, add_redemption_sql, (customer_id[0]['cust_ID'], promotion_id[0]['promo_ID'], redemption_date))
        return 'Promotion Redeemed successfully!'
    else:
        return 'Customer or Promotion not found. Please check the provided information.'
    
@app.route('/redemptionhistory', methods=['GET'])
def get_redemption_history():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password", "Davi_Nails")
    sql = "SELECT rh.redemption_id, ci.first_name, ci.last_name, p.promo_name, rh.redemption_date " \
        "FROM redemption_history rh " \
        "JOIN customer_information ci ON rh.customer_id = ci.cust_ID " \
        "JOIN promotions p ON rh.promotion_id = p.promo_ID " \
        "ORDER BY rh.redemption_date DESC"
    redemption_history = execute_read_query(conn, sql)
    return jsonify(redemption_history)   