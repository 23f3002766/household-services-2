from flask import current_app as app, render_template


@app.route('/')
def home():
    return render_template('index.html')
