from web_app import Webapi, app


# Start terminal for requests
api = Webapi()
app.api = api


if __name__ == "__main__":
    app.run(host="0.0.0.0")