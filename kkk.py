from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL  

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '2505'
app.config['MYSQL_DB'] = 'snake_game'  

mysql = MySQL(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.json
    nickname = data.get('nickname')
    score = data.get('score')
    difficulty = data.get('difficulty')

    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO scores (nickname, score, difficulty) VALUES (%s, %s, %s)",
                   (nickname, score, difficulty))
    mysql.connection.commit()
    cursor.close()
    return jsonify({"message": "Score saved!"})

if __name__ == '__main__':
    app.run(debug=True)
