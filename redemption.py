import flask
from flask import jsonify
from flask import request
from sql import create_connection
from sql import execute_query
from sql import execute_read_query
import datetime
from datetime import date

# creating connection to mysql database
conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password", "Davi_Nails")

# setting up an application name
app = flask.Flask(__name__)  # sets up the application
app.config["DEBUG"] = True  # allow to show errors in browser

today = date.today()  # sets today as today's date

authorizedusers = [
    {  # Creates user with username admin and password cars2000
        # admin user
        'username': 'admin',
        'password': 'password',
        'role': 'admin',
        'token': '1234657890',
        'admininfo': 'something super secret nobody can know'
    },
]
@app.route('/activepromos', methods=['GET'])  # Endpoint to return currently active promotions
def api_get_activepromos():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT * FROM promotions WHERE promo_status = 'Active' ORDER BY promo_cost"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@app.route('/allpromos', methods=['GET'])  # Endpoint to return all promotions
def api_get_allpromos():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT * FROM promotions ORDER BY promo_cost"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs
@app.route('/addpromotion', methods=['POST'])  # endpoint to submit a promotion
def post_create_promo():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    request_data = request.get_json()  # provids json inputs for the needed data to be inputted
    promoname = request_data['promo_name']
    promodescription = request_data['promo_description']
    promostatus = request_data['promo_status']
    promocost = request_data['promo_cost']
    addreview = "INSERT INTO promotions (promo_name, promo_description, promo_status, promo_cost) VALUES ('%s', '%s', '%s',%s)" % (
    promoname, promodescription, promostatus, promocost)
    execute_query(conn, addreview)  # executes above query to add the provided data to table
    return 'Promotion Added'


app.run()
