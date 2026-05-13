import os
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

def run_command(command, shell=True):
    print(f"Executing: {command}")
    try:
        subprocess.check_call(command, shell=shell)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e}")
        return False

def main():
    project_root = Path(__file__).parent.absolute()
    os.chdir(project_root)

    print("--- QuestLog Python Launcher ---")

    # 1. Check for Node.js and NPM
    node_check = subprocess.run(["node", "-v"], capture_output=True, text=True)
    npm_check = subprocess.run(["npm", "-v"], capture_output=True, text=True)

    if node_check.returncode != 0 or npm_check.returncode != 0:
        print("ERROR: Node.js or NPM not found!")
        print("Please install them using: sudo apt update && sudo apt install nodejs npm")
        input("Press Enter to exit...")
        sys.exit(1)

    # 2. Install dependencies if node_modules is missing
    if not (project_root / "node_modules").exists():
        print("Dependencies missing. Installing (this may take a minute)...")
        if not run_command("npm install"):
            input("NPM install failed. Press Enter to exit...")
            sys.exit(1)

    # 3. Build the project if dist is missing
    if not (project_root / "dist").exists():
        print("Building project for production...")
        if not run_command("npm run build"):
            input("Build failed. Press Enter to exit...")
            sys.exit(1)

    # 4. Start the server
    print("Launching QuestLog server...")
    # Using Popen to start in background
    server_process = subprocess.Popen(["npm", "start"], 
                                    stdout=subprocess.PIPE, 
                                    stderr=subprocess.PIPE,
                                    text=True)

    # Give the server a moment to start
    time.sleep(3)

    print("QuestLog is running at http://localhost:3000")
    webbrowser.open("http://localhost:3000")

    print("\n------------------------------------------------")
    print("KEEP THIS WINDOW OPEN while using QuestLog.")
    print("Press Ctrl+C here to stop the server.")
    print("------------------------------------------------")

    try:
        server_process.wait()
    except KeyboardInterrupt:
        print("\nStopping QuestLog...")
        server_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
