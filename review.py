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


@app.route('/customers', methods=['GET'])  # Endpoint to return all customers
def api_get_customers():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT * FROM customer_information ORDER BY cust_ID"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@app.route('/customerinfo', methods=['GET'])  # Endpoint to return all customers
def api_get_customerinfo():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "select ci.phone_number, ci.last_name, ci.first_name, ci.email, ci.birthday,( select chk.ci_date FROM check_ins AS chk where ci.cust_id = chk.cust_id order by chk.ci_date DESC LIMIT 1) as 'Last Visit' from customer_information ci order by ci.last_name;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@app.route('/customerpoints', methods=['GET'])  # Endpoint to return all customers
def api_get_customerpoints():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT ci.phone_number, ci.last_name, ci.first_name, cpo.current_points, cpo.lifetime_points  FROM customer_information AS ci inner join customer_points AS cpo ON ci.cust_id = cpo.cust_id  order by ci.last_name;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@app.route('/allreviews', methods=['GET'])  # Endpoint to return all reviews
def api_get_reviews():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT * FROM reviews ORDER BY rev_date DESC"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

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

@app.route('/addreview', methods=['POST'])  # endpoint to submit a review
def post_create_review():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    request_data = request.get_json()  # provids json inputs for the needed data to be inputted
    customerphone = request_data['phone_number']
    revdescription = request_data['rev_description']
    revrating = request_data['rev_rating']
    get_id = "SELECT cust_ID FROM customer_information WHERE phone_number = '%s'" % (customerphone)
    cust_id = execute_read_query(conn, get_id)
    addreview = "INSERT INTO reviews (cust_ID, rev_date, rev_description, rev_rating) VALUES (%s, '%s', '%s',%s)" % (
    cust_id[0]['cust_ID'], today, revdescription, revrating)
    execute_query(conn, addreview)  # executes above query to add the provided data to table
    return 'Thank You for the Review!'

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

@app.route('/deletereview', methods=['DELETE'])  # endpoint to delete a review
def delete_review():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    request_data = request.get_json()  # provids json inputs for the needed data to be deleted
    customerphone = request_data['phone_number']
    del_id = "DELETE FROM reviews WHERE phone_number = '%s'" % (customerphone)
    execute_read_query(conn, del_id)  # executes above query to delete data from the table
    return 'Review Removed!'


app.run()
