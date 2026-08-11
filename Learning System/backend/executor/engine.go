package executor

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type ExecutionRequest struct {
	Language string `json:"language"`
	Code     string `json:"code"`
	Input    string `json:"input"`
}

type ExecutionResponse struct {
	Output string `json:"output"`
	Error  string `json:"error"`
	Status string `json:"status"` // "Accepted", "Compile Error", "Time Limit Exceeded", "Runtime Error"
	Time   string `json:"time"`
}

// Run executes the code based on the language
func Run(req ExecutionRequest) ExecutionResponse {
	// 1. Create a temporary directory for this execution
	tmpDir, err := os.MkdirTemp("", "exec_*")
	if err != nil {
		return errorResponse("Internal Error: Could not create temp directory")
	}
	defer os.RemoveAll(tmpDir)

	// 2. Select execution strategy
	switch req.Language {
	case "python":
		return runPython(tmpDir, req.Code, req.Input)
	case "go":
		return runGo(tmpDir, req.Code, req.Input)
	case "cpp", "c++":
		return runCpp(tmpDir, req.Code, req.Input)
	case "c":
		return runC(tmpDir, req.Code, req.Input)
	case "java":
		return runJava(tmpDir, req.Code, req.Input)
	default:
		return errorResponse(fmt.Sprintf("Language not supported: %s", req.Language))
	}
}

func errorResponse(msg string) ExecutionResponse {
	return ExecutionResponse{
		Error:  msg,
		Status: "Internal Error",
	}
}

// executeCommand runs a command with a timeout and input
func executeCommand(dir, cmdName string, args []string, input string, timeout time.Duration) ExecutionResponse {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, cmdName, args...)
	cmd.Dir = dir

	if input != "" {
		cmd.Stdin = strings.NewReader(input)
	}

	start := time.Now()
	out, err := cmd.CombinedOutput()
	elapsed := time.Since(start)

	timeStr := fmt.Sprintf("%d ms", elapsed.Milliseconds())

	if ctx.Err() == context.DeadlineExceeded {
		return ExecutionResponse{
			Error:  "Time Limit Exceeded",
			Status: "Time Limit Exceeded",
			Time:   timeStr,
		}
	}

	if err != nil {
		return ExecutionResponse{
			Output: string(out),
			Error:  err.Error() + "\n" + string(out),
			Status: "Runtime Error",
			Time:   timeStr,
		}
	}

	return ExecutionResponse{
		Output: string(out),
		Status: "Accepted",
		Time:   timeStr,
	}
}

func runPython(dir, code, input string) ExecutionResponse {
	filePath := filepath.Join(dir, "main.py")
	os.WriteFile(filePath, []byte(code), 0644)
	return executeCommand(dir, "python3", []string{"main.py"}, input, 5*time.Second)
}

func runGo(dir, code, input string) ExecutionResponse {
	filePath := filepath.Join(dir, "main.go")
	os.WriteFile(filePath, []byte(code), 0644)
	return executeCommand(dir, "go", []string{"run", "main.go"}, input, 10*time.Second)
}

func runCpp(dir, code, input string) ExecutionResponse {
	srcPath := filepath.Join(dir, "main.cpp")
	exePath := filepath.Join(dir, "main")
	os.WriteFile(srcPath, []byte(code), 0644)

	// Compile
	compileCmd := exec.Command("g++", "-O2", "-o", exePath, srcPath)
	compileOut, err := compileCmd.CombinedOutput()
	if err != nil {
		return ExecutionResponse{
			Error:  string(compileOut),
			Status: "Compile Error",
		}
	}

	// Run
	return executeCommand(dir, exePath, []string{}, input, 3*time.Second)
}

func runC(dir, code, input string) ExecutionResponse {
	srcPath := filepath.Join(dir, "main.c")
	exePath := filepath.Join(dir, "main")
	os.WriteFile(srcPath, []byte(code), 0644)

	// Compile
	compileCmd := exec.Command("gcc", "-O2", "-o", exePath, srcPath)
	compileOut, err := compileCmd.CombinedOutput()
	if err != nil {
		return ExecutionResponse{
			Error:  string(compileOut),
			Status: "Compile Error",
		}
	}

	// Run
	return executeCommand(dir, exePath, []string{}, input, 3*time.Second)
}

func runJava(dir, code, input string) ExecutionResponse {
	// Java requires the filename to match the public class. We assume "Main"
	srcPath := filepath.Join(dir, "Main.java")
	os.WriteFile(srcPath, []byte(code), 0644)

	// Compile
	compileCmd := exec.Command("javac", srcPath)
	compileOut, err := compileCmd.CombinedOutput()
	if err != nil {
		return ExecutionResponse{
			Error:  string(compileOut),
			Status: "Compile Error",
		}
	}

	// Run
	return executeCommand(dir, "java", []string{"Main"}, input, 5*time.Second)
}
