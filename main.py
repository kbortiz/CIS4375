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

@app.route('/customercount', methods=['GET'])  # Endpoint to return all customers
def api_get_customercount():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT COUNT(*) FROM customer_information"
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
    sql = "SELECT ci.phone_number, ci.last_name, ci.first_name, cpo.current_points, cpo.lifetime_points, (select DATE_FORMAT(chk.ci_date, '%m-%d-%Y') FROM check_ins AS chk where ci.cust_id = chk.cust_id order by chk.ci_date DESC LIMIT 1) as'ci_date'  FROM customer_information AS ci inner join customer_points AS cpo ON ci.cust_id = cpo.cust_id  order by ci.last_name;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@app.route('/allreviews', methods=['GET'])  # Endpoint to return all reviews
def api_get_reviews():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT CONCAT (ci.first_name,' ', ci.last_name) AS 'Name', rev.rev_date, rev.rev_description, rev.rev_rating FROM customer_information AS ci inner join reviews AS rev ON ci.cust_id = rev.cust_id order by rev.rev_date DESC;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@app.route('/activepromos', methods=['GET'])  # Endpoint to return currently active promotions
def api_get_activepromos():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT * FROM promotions WHERE promo_status = 'ACTIVE' ORDER BY promo_cost"
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



@app.route('/updatepromo', methods=['PUT'])  # endpoint to unassign a car
def put_updatepromo():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    request_data = request.get_json()
    newstatus = request_data['promo_status']
    id_num = request_data['promo_id']

  ##  cursor = conn cursor = conn.cursor(dictionary=True)
 #       try:
 #       cursor.execute('SELECT * FROM promotions WHERE promo_status = "ACTIVE"')
 #       active = cursor.fetchone()
 #       if active:
 #           cursor.execute('SELECT * FROM promotions WHERE promo_id = %s'%(id_num))
            
 #       else:
 #           changestatus = "UPDATE promotions SET promo_status = UPPER('%s') WHERE promo_id = '%s'" % (newstatus, id_num)
 #           execute_query(conn, changestatus)  # executes above query to set given mechanics currentcar to NULL
  #  except mysql.connector.Error as err:
  #      return jsonify({"status": "fail", "message": f"Error: {err}"})
 #   finally:
 #       cursor.close()
  #      conn.close()

    changestatus = "UPDATE promotions SET promo_status = UPPER('%s') WHERE promo_id = '%s'" % (newstatus, id_num)
    execute_query(conn, changestatus)  # executes above query to set given mechanics currentcar to NULL
    return 'PUT REQUEST WORKED'

app.run()