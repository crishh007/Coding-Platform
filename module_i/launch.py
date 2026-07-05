import subprocess
import os
import sys
import time

def main():
    print("Starting Placement Preparation System (Module I)...")
    
    # Path setup
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, "frontend")
    backend_dir = os.path.join(base_dir, "backend")
    
    # Start MongoDB (Docker)
    print("Starting MongoDB via Docker...")
    try:
        # Check if container exists
        check_cmd = ["docker", "ps", "-a", "-q", "-f", "name=placement-mongodb"]
        result = subprocess.run(check_cmd, capture_output=True, text=True)
        if result.stdout.strip():
            # Container exists, start it
            subprocess.run(["docker", "start", "placement-mongodb"], check=True, stdout=subprocess.DEVNULL)
            print("Existing MongoDB container started.")
        else:
            # Create and start container
            subprocess.run(["docker", "run", "-d", "-p", "27017:27017", "--name", "placement-mongodb", "mongo:latest"], check=True, stdout=subprocess.DEVNULL)
            print("New MongoDB container created and started.")
    except Exception as e:
        print(f"WARNING: Failed to start MongoDB via Docker. Ensure Docker is installed and running. Details: {e}")
        print("Continuing anyway, assuming MongoDB might be running natively...")
    
    # Start Backend (Go)
    print("Starting Go Backend...")
    backend_cmd = ["go", "run", "cmd/server/main.go"]
    
    try:
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=backend_dir,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
    except FileNotFoundError:
        print("ERROR: Go is not installed or not in PATH.")
        print("Please install Go from https://go.dev/doc/install")
        backend_process = None
    
    # Start Frontend (React/Vite)
    print("Starting React Frontend...")
    npm_cmd = "npm.cmd" if os.name == 'nt' else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    
    try:
        frontend_process = subprocess.Popen(
            frontend_cmd,
            cwd=frontend_dir,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
    except FileNotFoundError:
        print("ERROR: npm is not installed or not in PATH.")
        frontend_process = None
    
    try:
        # Keep the script running
        print("\nAll services started. Press Ctrl+C to shut down.")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down services...")
        if backend_process:
            backend_process.terminate()
            backend_process.wait()
        if frontend_process:
            frontend_process.terminate()
            frontend_process.wait()
        try:
            print("Stopping MongoDB container...")
            subprocess.run(["docker", "stop", "placement-mongodb"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
        except Exception:
            pass
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
