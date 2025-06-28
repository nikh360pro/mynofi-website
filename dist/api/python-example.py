
"""
Example Python code for desktop application to check for updates
and connect to real-time notifications

Requirements:
pip install supabase requests websockets
"""

import json
import asyncio
import websockets
import requests
from supabase import create_client

# Supabase configuration
SUPABASE_URL = "https://mizniptrapkrykarqaha.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pem5pcHRyYXBrcnlrYXJxYWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTc2MzUsImV4cCI6MjA2NDU5MzYzNX0.A6xmnfudPmPfnxeidJFQbJYRb96u06sDEQ0AdBpXz8s"

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Current application version
CURRENT_VERSION = "1.0.0"

def check_for_updates():
    """Check if updates are available for the application"""
    try:
        # Call the update checking endpoint
        response = supabase.functions.invoke(
            "check-update",
            invoke_options={"body": {"currentVersion": CURRENT_VERSION}}
        )
        
        if response["data"]["updateAvailable"]:
            print(f"Update available: version {response['data']['latestVersion']}")
            print(f"Release notes: {response['data']['releaseNotes']}")
            print(f"Download URL: {response['data']['downloadUrl']}")
            
            # Handle required updates
            if response["data"]["requiresUpdate"]:
                print("This update is required to continue using the application")
                # You might want to force the update here
                
            return response["data"]
        else:
            print("Your application is up to date")
            return None
            
    except Exception as e:
        print(f"Error checking for updates: {str(e)}")
        return None

async def listen_for_notifications():
    """Listen for real-time notifications from the server"""
    # Generate a unique channel ID
    channel_id = "app-notifications"
    
    # Construct the websocket URL with the channel ID
    ws_url = f"wss://mizniptrapkrykarqaha.supabase.co/realtime/v1/websocket?apikey={SUPABASE_KEY}&vsn=1.0.0"
    
    async with websockets.connect(ws_url) as websocket:
        # Join the channel
        join_message = {
            "topic": f"realtime:public:broadcasts",
            "event": "phx_join",
            "payload": {},
            "ref": 1
        }
        await websocket.send(json.dumps(join_message))
        
        # Keep listening for messages
        while True:
            try:
                response = await websocket.recv()
                data = json.loads(response)
                
                # Handle different message types
                if "event" in data and data["event"] == "INSERT":
                    payload = data["payload"]
                    if payload["action"] == "new_update":
                        print("New update notification received!")
                        print(f"Version: {payload['message']['version']}")
                        print(f"Release notes: {payload['message']['releaseNotes']}")
                        
                        # Check for the update details
                        update_info = check_for_updates()
                        
                        # You could prompt the user to update here
                        # show_update_dialog(update_info)
                        
            except Exception as e:
                print(f"Error in websocket connection: {str(e)}")
                # Try to reconnect
                break

def download_update(download_url):
    """Download the update file"""
    try:
        # Construct full URL if it's a relative path
        if download_url.startswith("/"):
            download_url = f"{SUPABASE_URL}{download_url}"
            
        print(f"Downloading update from: {download_url}")
        
        # Download the file
        response = requests.get(download_url)
        if response.status_code == 200:
            # Save the file
            with open("mynofi-installer-latest.exe", "wb") as f:
                f.write(response.content)
            print("Download complete. Ready to install.")
            return True
        else:
            print(f"Failed to download update: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading update: {str(e)}")
        return False

def install_update():
    """Install the downloaded update"""
    import subprocess
    try:
        # Run the installer
        subprocess.Popen(["mynofi-installer-latest.exe"])
        return True
    except Exception as e:
        print(f"Error installing update: {str(e)}")
        return False

async def main():
    # Check for updates on startup
    update_info = check_for_updates()
    
    # If an update is available, you might want to prompt the user
    if update_info and update_info["updateAvailable"]:
        # Simulating user choice to update
        user_wants_to_update = True
        
        if user_wants_to_update:
            success = download_update(update_info["downloadUrl"])
            if success:
                install_update()
    
    # Start listening for real-time notifications
    await listen_for_notifications()

if __name__ == "__main__":
    asyncio.run(main())
