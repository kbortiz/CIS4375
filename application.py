import flask
from flask import jsonify, request, session, redirect, url_for, flash
from flask_session import Session
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from sql import create_connection
from sql import execute_query
from sql import execute_read_query
import datetime
from datetime import date, datetime

# creating connection to mysql database
conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password", "Davi_Nails")

# setting up an application name
application = flask.Flask(__name__)  # sets up the application
CORS(application,resources={r"*": {"origins": "http://ec2-18-218-184-140.us-east-2.compute.amazonaws.com"}}, supports_credentials=True, expose_headers=["Content-Type", "Authorization"])
application.config["DEBUG"] = True  # allow to show errors in browser

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



@application.route('/checkinpromo', methods=['GET'])  # Endpoint to return all customers
@cross_origin(supports_credentials=True)
def get_checkinpromo():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT promo_name, promo_description, promo_cost FROM promotions WHERE promo_status = 'ACTIVE'"
    printlogs = execute_read_query(conn, sql)
    return jsonify(printlogs)  # Prints all logs

@application.route('/check_customer', methods=['POST'])
def check_customer():

    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    cursor = conn.cursor(dictionary=True)
    phone_number = request.form['phone_number']

    try:
        cursor.execute('SELECT * FROM customer_information WHERE phone_number = %s', (phone_number,))
        account = cursor.fetchone()
        if account:
            get_id = "SELECT cust_ID FROM customer_information WHERE phone_number = '%s'" % (phone_number)
            cust_id = execute_read_query(conn, get_id)
            add_points = "UPDATE customer_points SET current_points = current_points + 1, lifetime_points = lifetime_points + 1 WHERE cust_id = %s" %(cust_id[0]['cust_ID'])
            execute_query(conn, add_points)
            get_points = "SELECT lifetime_points FROM customer_points WHERE cust_ID = %s" %(cust_id[0]['cust_ID'])
            lifetimepoints = execute_read_query(conn, get_points)
            add_checkin = "INSERT INTO check_ins (cust_id, ci_date, ci_count) VALUES (%s, '%s', %s)" % (cust_id[0]['cust_ID'], today, lifetimepoints[0]['lifetime_points'])
            execute_query(conn, add_checkin)
            if lifetimepoints[0]['lifetime_points'] > 2 and lifetimepoints[0]['lifetime_points'] <= 4:
                changecategory = "UPDATE customer_points SET category_id = 2 WHERE cust_id = %s" % (cust_id[0]['cust_ID'])
                execute_query(conn, changecategory)
            elif lifetimepoints[0]['lifetime_points'] > 4 and lifetimepoints[0]['lifetime_points'] <= 20:
                changecategory = "UPDATE customer_points SET category_id = 3 WHERE cust_id = %s" % (cust_id[0]['cust_ID'])
                execute_query(conn, changecategory)
            elif lifetimepoints[0]['lifetime_points'] > 20:
                changecategory = "UPDATE customer_points SET category_id = 4 WHERE cust_id = %s" % (cust_id[0]['cust_ID'])
                execute_query(conn, changecategory)
            return redirect('http://ec2-18-218-184-140.us-east-2.compute.amazonaws.com/checkedin')
        else:
            createcustomer = "INSERT INTO customer_information (phone_number) VALUES ('%s')" % (phone_number)
            execute_query(conn, createcustomer)
            return redirect('http://ec2-18-218-184-140.us-east-2.compute.amazonaws.com/newcheckin')
    finally:
        cursor.close()
        conn.close()

@application.route('/checkedin', methods=['GET'])  # Endpoint to return all customers
@cross_origin(supports_credentials=True)
def get_checkedin():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT ci.cust_id, ci.last_name, ci.first_name, cpo.current_points, chk.checkin_id \
            FROM customer_information AS ci inner join customer_points AS cpo ON ci.cust_id = cpo.cust_id \
            JOIN check_ins chk ON ci.cust_id = chk.cust_id \
            order by chk.checkin_id DESC LIMIT 1;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@application.route('/newcheckin', methods=['GET'])  # Endpoint to return all customers
@cross_origin(supports_credentials=True)
def get_newcheckin():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "select cust_id from customer_information ORDER BY cust_id DESC LIMIT 1;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs


@application.route('/addcustomer', methods=['POST'])  # endpoint to submit a review
def post_add_customer():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    cursor = conn.cursor()

    cust_id = request.form['cust_id']
    firstname = request.form['first_name']
    lastname = request.form['last_name']
    email = request.form['email']
    birthday = request.form['birthday']
    # Check if birthday is not empty before parsing
    if birthday:
        input_date = datetime.strptime(birthday, "%m/%d/%Y")
        mysql_formatted_date = input_date.strftime("%Y-%m-%d")
    else:
        mysql_formatted_date = None  # or any default value you prefer

    #print(birthday)
    #print(mysql_formatted_date)

    addcustomer = "UPDATE customer_information SET first_name = %s, last_name = %s,email = %s, birthday = %s WHERE cust_id = %s"
    values = (firstname, lastname, email, mysql_formatted_date, cust_id)
    cursor.execute(addcustomer, values)  # executes above query to add the provided data to table

    add_points = "INSERT INTO customer_points VALUES(%s, 1, 1, 1)" %(cust_id)
    execute_query(conn, add_points)
    add_checkin = "INSERT INTO check_ins (cust_id, ci_date, ci_count) VALUES (%s, '%s', 1)" % (cust_id, today)
    execute_query(conn, add_checkin)


    conn.commit()
    conn.close()
    return redirect('http://ec2-18-218-184-140.us-east-2.compute.amazonaws.com/thankyou')



@application.route('/customers', methods=['GET'])  # Endpoint to return all customers
def api_get_customers():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT * FROM customer_information ORDER BY cust_ID"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@application.route('/customercount', methods=['GET'])  # Endpoint to return all customers
def api_get_customercount():
        
    try:
        conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
        cursor = conn.cursor()

        # Execute the SQL query to get the category counts
        query = """
        SELECT COUNT(*) as count
        FROM customer_points
        GROUP BY category_id;
        """
        cursor.execute(query)

        # Fetch the results
        results = cursor.fetchall()

        # Create an array to store the category counts
        category_counts = [result[0] for result in results]

        # Close the cursor and connection
        cursor.close()
        conn.close()

        # Return the category counts as JSON
        return jsonify(category_counts)

    except Exception as e:
        return jsonify({'error': str(e)})


@application.route('/customerinfo', methods=['GET'])  # Endpoint to return all customers
@cross_origin(supports_credentials=True)
def api_get_customerinfo():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "select ci.phone_number, ci.last_name, ci.first_name, ci.email, DATE_FORMAT(ci.birthday, '%m/%d/%Y') as 'birthday' ,(select DATE_FORMAT(chk.ci_date, '%m/%d/%Y') FROM check_ins AS chk where ci.cust_id = chk.cust_id order by chk.ci_date DESC LIMIT 1) as 'lastVisit',cpo.category_id from customer_information ci inner join customer_points cpo ON ci.cust_id = cpo.cust_id order by lastVisit DESC;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@application.route('/customerpoints', methods=['GET'])  # Endpoint to return all customers
@cross_origin(supports_credentials=True)
def api_get_customerpoints():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT ci. cust_id, ci.phone_number, ci.last_name, ci.first_name, cpo.current_points, cpo.lifetime_points, cpo.category_id, (select DATE_FORMAT(chk.ci_date, '%m/%d/%Y') FROM check_ins AS chk where ci.cust_id = chk.cust_id order by chk.ci_date DESC LIMIT 1) as'ci_date'  FROM customer_information AS ci inner join customer_points AS cpo ON ci.cust_id = cpo.cust_id  order by ci_date DESC;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@application.route('/updatepoints/<phone_number>', methods=['POST'])
def update_current_points(phone_number):
    try:
        conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
        new_points = request.json['newPoints']
        get_id = "SELECT cust_ID FROM customer_information WHERE phone_number = '%s'" % (phone_number)
        get_active = "SELECT promo_id, promo_cost FROM promotions WHERE promo_status = 'ACTIVE'"
        cust_id = execute_read_query(conn, get_id)
        print(cust_id[0]['cust_ID'])
        getpromo = execute_read_query(conn, get_active)
        get_current = "SELECT current_points FROM customer_points WHERE cust_id = '%s'" % (cust_id[0]['cust_ID'])
        currentpoints = execute_read_query(conn, get_current)
        print(new_points)
        print(currentpoints[0]['current_points'])
        # Update the 'current_points' for the customer with the given phone_number in your MySQL database
        # Your database update logic here
        if int(new_points) < int(currentpoints[0]['current_points']):
            updatepoints = "UPDATE customer_points SET current_points = '%s' WHERE cust_id = '%s' " % (new_points, cust_id[0]['cust_ID'])
            execute_query(conn, updatepoints)
            updateredemption = "INSERT INTO redemption_history (cust_ID, promo_id, promo_cost, redemption_date) VALUES(%s, %s, %s, '%s')" % (cust_id[0]['cust_ID'], getpromo[0]['promo_id'], getpromo[0]['promo_cost'], today)
            execute_query(conn, updateredemption)
        # Return a success response
        return jsonify({'message': 'Current Points updated successfully'})

    except Exception as e:
        return jsonify({'error': str(e)})

@application.route('/allreviews', methods=['GET'])  # Endpoint to return all reviews
def api_get_reviews():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT rev.review_id, CONCAT (ci.first_name,' ', ci.last_name) AS 'Name', DATE_FORMAT(rev.rev_date, '%M %d %Y') as rev_date , rev.rev_description, rev.rev_rating FROM customer_information AS ci inner join reviews AS rev ON ci.cust_id = rev.cust_id order by rev.review_id DESC;"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@application.route('/deletereview/<int:review_id>', methods=['POST'])  # endpoint to delete a review
def delete_review(review_id):
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    del_rev = "DELETE FROM reviews WHERE review_id = '%s'" % (review_id)
    execute_query(conn, del_rev)  # executes above query to delete data from the table
    return 'Review Removed!'

@application.route('/activepromos', methods=['GET'])  # Endpoint to return currently active promotions
def api_get_activepromos():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "SELECT promo_id, promo_name, promo_description, DATE_FORMAT(exp_date,'%m-%d-%Y'), promo_status, promo_cost FROM promotions WHERE promo_status = 'ACTIVE' ORDER BY promo_cost"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs


@application.route('/redemptionhistory', methods=['GET'])
def get_redemption_history():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password", "Davi_Nails")
    sql = "SELECT ci.first_name, ci.last_name, p.promo_name, p.promo_cost,rh.redemption_id, DATE_FORMAT(rh.redemption_date, '%m/%d/%Y') as redemption_date, cpo.current_points, cpo.lifetime_points " \
        "FROM redemption_history rh " \
        "JOIN customer_information ci ON rh.cust_id = ci.cust_ID " \
        "JOIN customer_points cpo ON cpo.cust_id = ci.cust_id " \
        "JOIN promotions p ON rh.promo_id = p.promo_ID " \
        "ORDER BY rh.redemption_id DESC"
    redemption_history = execute_read_query(conn, sql)
    return jsonify(redemption_history)   

@application.route('/allpromos', methods=['GET'])  # Endpoint to return all promotions
def api_get_allpromos():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
    sql = "select promo_id, promo_name, promo_description, DATE_FORMAT(exp_date,'%m/%d/%Y') as 'exp_date', promo_status, promo_cost from promotions ORDER BY promo_cost"
    printlogs = execute_read_query(conn, sql)

    return jsonify(printlogs)  # Prints all logs

@application.route('/addreview', methods=['POST'])  # endpoint to submit a review
def post_create_review():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    cust_id = request.form['cust_id']
    revdescription = request.form['rev_description']
    revrating = request.form['rev_rating']
    addreview = "INSERT INTO reviews (cust_ID, rev_date, rev_description, rev_rating) VALUES (%s, '%s', '%s',%s)" % (
    cust_id, today, revdescription, revrating)
    execute_query(conn, addreview)  # executes above query to add the provided data to table
    return redirect('http://ec2-18-218-184-140.us-east-2.compute.amazonaws.com/thankyou')

@application.route('/addpromotion', methods=['POST'])  # endpoint to submit a promotion
def post_create_promo():
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    request_data = request.get_json()  # provids json inputs for the needed data to be inputted
    promoname = request_data['promo_name']
    promodescription = request_data['promo_description']
    expdate = request_data['exp_date']
    promostatus = request_data['promo_status']
    promocost = request_data['promo_cost']
    if promostatus.upper() == 'ACTIVE':
        deactivate = "UPDATE promotions SET promo_status = 'INACTIVE' WHERE promo_status = 'ACTIVE' "
        addpromo = "INSERT INTO promotions (promo_name, promo_description,exp_date, promo_status, promo_cost) VALUES ('%s', '%s','%s', UPPER('%s'),%s)" % (
        promoname, promodescription,expdate, promostatus, promocost)
        execute_query(conn, deactivate)
        execute_query(conn, addpromo)
        return 'Active Promotion added'
    elif promostatus.upper() == 'INACTIVE':
        addpromo = "INSERT INTO promotions (promo_name, promo_description, exp_date, promo_status, promo_cost) VALUES ('%s', '%s','%s', UPPER('%s'),%s)" % (
        promoname, promodescription,expdate, promostatus, promocost)
        execute_query(conn, addpromo)  # executes above query to add the provided data to table
        return 'Inactive Promotion added'
    

@application.route('/deletepromotion/<int:promotion_id>', methods=['POST'])  # endpoint to submit a promotion
def post_delete_promo(promotion_id):
    conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")

    delete_query = "DELETE FROM promotions WHERE promo_id = '%s'" % (promotion_id)
    execute_query(conn, delete_query)
    
    return 'Promotion deleted successfully'


@application.route('/updatepromotion/<int:promotion_id>', methods=['PUT'])
def update_promotion(promotion_id):
    try:
        updated_values = request.get_json()
        newname = updated_values['promo_name']
        newdesc = updated_values['promo_description']
        newdate = updated_values['exp_date']
        newstatus = updated_values['promo_status']
        newcost = updated_values['promo_cost']

        print(newstatus)
        print(updated_values)
        # Create a database connection
        conn = create_connection("cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com", "admin", "password",
                             "Davi_Nails")
        cursor = conn.cursor()
        update_query = "UPDATE promotions SET promo_name = %s, promo_description = %s, exp_date = %s, promo_status = %s, promo_cost = %s WHERE promo_id = %s"
        values = (newname, newdesc, newdate, newstatus, newcost, promotion_id)
    

        if newstatus.upper() == 'ACTIVE':
            deactivate = "UPDATE promotions SET promo_status = 'INACTIVE' WHERE promo_status = 'ACTIVE' "
            execute_query(conn, deactivate)
            cursor.execute(update_query, values)
            conn.commit()
        elif newstatus.upper() == 'INACTIVE':
            cursor.execute(update_query, values)
            conn.commit()

        # Close the cursor and connection
        conn.close()

        # Return a success response
        return jsonify({'success': True})
    except Exception as e:
        # Handle errors, e.g., database errors
        return jsonify({'success': False, 'error': str(e)})

#application.run()
