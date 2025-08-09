import uvicorn
from .main_api import app

if __name__ == "__main__":
    # Runs the Uvicorn server when the script is executed
    # host="0.0.0.0" makes it accessible on your network
    # reload=True automatically restarts the server on code changes
    uvicorn.run("main_api:app", host="0.0.0.0", port=5000, reload=True)