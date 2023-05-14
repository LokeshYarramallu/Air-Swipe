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
    if 'pdfFile' in request.files:
        file = request.files['pdfFile']
        if file.filename != '':
            filename = secure_filename(file.filename)
            upload_path = os.path.join('uploads', filename)
            file.save(upload_path)

            # Start the mad function in a new thread
            mad_thread = Thread(target=mad)
            mad_thread.start()

            # Send the file in the current context
            return send_file(upload_path)
    return 'Please select a file to upload'


@app.route('/Home', methods=['GET'])
def home():
    return send_file('Home.html')

if __name__ == '__main__':
    app.run(host='localhost', port=port)
