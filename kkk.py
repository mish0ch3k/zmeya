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

@app.route('/top_scores')
def top_scores():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT nickname, score, difficulty FROM scores ORDER BY score DESC LIMIT 10")
    results = cursor.fetchall()
    cursor.close()

    top_list = [{"nickname": row[0], "score": row[1], "difficulty": row[2]} for row in results]
    return jsonify(top_list)


if __name__ == '__main__':
    app.run(debug=True)
