from threading import Thread
from flask import Flask, request, send_file
from werkzeug.utils import secure_filename
import os
import time
import pyCode

app = Flask(__name__)
port = 3001


def mad():
    pyCode.main()
    time.sleep(0)  # Yield to the event loop


@app.route('/')
def index():
    return send_file('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    link = request.form.get('code')

    link = link.replace('width="476px"', 'width="100%"')
    link = link.replace('height="288px"', 'height="100%"')

    if 'pdfFile' in request.files:
        pdf_file = request.files['pdfFile']
        file_path = os.path.join(os.getcwd(), secure_filename(pdf_file.filename))
        pdf_file.save(file_path)
        if os.path.exists(file_path):
            madThread = Thread(target=mad)
            madThread.start()
            return send_file(file_path)
        else:
            return "File not found", 404
    elif link != "":
        if link.startswith("<i"):
            madThread = Thread(target=mad)
            madThread.start()
            return link
        else:
            return "Enter a valid link"
    else:
        return "Please select a file to upload"


@app.route('/Home', methods=['GET'])
def home():
    return send_file('Home.html')


if __name__ == '__main__':
    app.run(host='localhost', port=port)
