from flask import Flask, render_template, request
import base64, re, time
from glob import glob
from random import randint

app = Flask(__name__)

@app.route('/index')
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/end')
def end():
    files = glob("static/things/*.png")
    file_numbers = list(reversed(range(1, len(files)+1)))
    latest = list(reversed(sorted(files)))
    return render_template('end.html', img_list=zip(latest,file_numbers))

@app.route('/save', methods=["POST"])
def save_image():
    dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
    image_data = request.form.get("imgdata")
    image_data = dataUrlPattern.match(image_data).group(2)
    image_data = image_data.encode()
    image_data = base64.b64decode(image_data)

    filename = "static/things/" + str(time.time()) + ".png"
    with open(filename, 'wb') as f:
        f.write(image_data)
    return "success"

