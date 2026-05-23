#!/usr/bin/env python3
import argparse
import asyncio
import json
import os
import sys
import time

class Orchestrator:
    def __init__(self, output_file, logs_dir):
        self.output_file = output_file
        self.logs_dir = os.path.abspath(logs_dir)
        os.makedirs(self.logs_dir, exist_ok=True)
        os.makedirs(os.path.dirname(os.path.abspath(self.output_file)), exist_ok=True)

    async def run_single_task(self, name, command):
        """
        Executes a single command asynchronously, redirecting output to a dedicated log file.
        """
        log_path = os.path.join(self.logs_dir, f"{name}.log")
        start_time = time.monotonic()
        
        try:
            # We run using the appropriate shell depending on OS
            is_windows = os.name == 'nt'
            
            # Start subprocess
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                shell=True
            )
            
            # Read stdout and stderr concurrently to avoid buffer deadlock
            stdout, stderr = await process.communicate()
            
            duration = time.monotonic() - start_time
            exit_code = process.returncode
            
            # Write full outputs to log file
            with open(log_path, 'wb') as log_file:
                log_file.write(b"--- STDOUT ---\n")
                log_file.write(stdout)
                log_file.write(b"\n--- STDERR ---\n")
                log_file.write(stderr)
                
            status = "success" if exit_code == 0 else "failed"
            
            return {
                "name": name,
                "command": command,
                "status": status,
                "exit_code": exit_code,
                "duration_seconds": round(duration, 3),
                "log_file": log_path,
                "error_snippet": stderr.decode('utf-8', errors='replace')[-500:] if exit_code != 0 else ""
            }
            
        except Exception as e:
            duration = time.monotonic() - start_time
            # Log the error
            with open(log_path, 'w', encoding='utf-8') as log_file:
                log_file.write(f"Orchestration Error: {str(e)}")
                
            return {
                "name": name,
                "command": command,
                "status": "failed",
                "exit_code": -1,
                "duration_seconds": round(duration, 3),
                "log_file": log_path,
                "error_snippet": str(e)
            }

    async def execute(self, tasks_list):
        """
        Executes all tasks in parallel using asyncio.gather.
        """
        print(f"[*] Starting {len(tasks_list)} tasks in parallel...")
        print(f"[*] Logs will be saved under: {self.logs_dir}")
        
        start_time = time.monotonic()
        coroutines = [self.run_single_task(t["name"], t["cmd"]) for t in tasks_list]
        results = await asyncio.gather(*coroutines)
        total_duration = time.monotonic() - start_time
        
        # Calculate summary
        total = len(results)
        failed = sum(1 for r in results if r["status"] == "failed")
        success = total - failed
        
        summary = {
            "summary": {
                "total": total,
                "success": success,
                "failed": failed,
                "total_duration_seconds": round(total_duration, 3)
            },
            "tasks": {r["name"]: r for r in results}
        }
        
        # Save output JSON file
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
            
        print(f"\n[+] Execution completed in {round(total_duration, 2)}s!")
        print(f"[+] Summary written to: {self.output_file}")
        print(f"    - Success: {success}/{total}")
        print(f"    - Failed: {failed}/{total}")
        
        if failed > 0:
            print("\n[!] The following tasks failed:")
            for r in results:
                if r["status"] == "failed":
                    print(f"    - {r['name']} (Exit Code: {r['exit_code']})")
                    print(f"      Log: {r['log_file']}")
            sys.exit(1)
        else:
            print("\n[+] All tasks finished successfully!")
            sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="PixonUI Parallel Task Orchestrator")
    
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    run_parser = subparsers.add_parser("run-parallel", help="Executes multiple terminal tasks in parallel.")
    run_parser.add_argument("--tasks", required=True, type=str, help="JSON string containing array of tasks, e.g. '[{\"name\": \"task1\", \"cmd\": \"echo 1\"}]'")
    run_parser.add_argument("--output", required=True, type=str, help="JSON file where the execution summary will be written.")
    run_parser.add_argument("--logs-dir", type=str, default="./scratch/logs", help="Directory where raw task logs will be saved.")
    
    args = parser.parse_args()
    
    if args.command == "run-parallel":
        try:
            tasks_list = json.loads(args.tasks)
            if not isinstance(tasks_list, list):
                raise ValueError("Tasks must be a list of task objects.")
            for i, task in enumerate(tasks_list):
                if "name" not in task or "cmd" not in task:
                    raise ValueError(f"Task index {i} is missing 'name' or 'cmd' properties.")
        except Exception as e:
            print(f"[-] Invalid --tasks JSON structure: {str(e)}")
            sys.exit(1)
            
        orchestrator = Orchestrator(args.output, args.logs_dir)
        
        # Run event loop
        asyncio.run(orchestrator.execute(tasks_list))

if __name__ == "__main__":
    main()
