package arrays

import "codemastery-learning-system/models"

func buildMatrixHud(i, j, rows, cols int) []models.HudVariable {
	return []models.HudVariable{
		{"i", intToString(i)},
		{"j", intToString(j)},
		{"rows", intToString(rows)},
		{"cols", intToString(cols)},
	}
}

func buildMatrixState(matrix [][]int, highlightR, highlightC int) [][]models.ArrayCellState {
	state := make([][]models.ArrayCellState, len(matrix))
	for r := 0; r < len(matrix); r++ {
		state[r] = make([]models.ArrayCellState, len(matrix[r]))
		for c := 0; c < len(matrix[r]); c++ {
			color := "transparent"
			if r == highlightR && c == highlightC {
				color = "rgba(234, 179, 8, 0.7)"
			}
			state[r][c] = models.ArrayCellState{
				Value:    matrix[r][c],
				Color:    color,
				Pointers: []string{},
				Dim:      false,
			}
		}
	}
	return state
}

func GenerateMatrixTransposeSteps(req models.SimulationRequest) []models.StepState {
	original := req.Original
	if len(original) == 0 {
		return []models.StepState{}
	}
	rows := len(original)
	cols := len(original[0])
	
	// Create an empty transpose matrix
	transpose := make([][]int, cols)
	for i := range transpose {
		transpose[i] = make([]int, rows)
	}

	var steps []models.StepState
	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Initialize Transpose Matrix",
		Status:       "checking",
		HudVariables: buildMatrixHud(0, 0, rows, cols),
		MatrixState:  buildMatrixState(transpose, -1, -1),
	})

	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			steps = append(steps, models.StepState{
				Line:         2,
				Action:       "Visit matrix[" + intToString(i) + "][" + intToString(j) + "] = " + intToString(original[i][j]),
				Status:       "checking",
				HudVariables: buildMatrixHud(i, j, rows, cols),
				MatrixState:  buildMatrixState(transpose, -1, -1),
			})

			transpose[j][i] = original[i][j]

			steps = append(steps, models.StepState{
				Line:         3,
				Action:       "Set transpose[" + intToString(j) + "][" + intToString(i) + "] = " + intToString(original[i][j]),
				Status:       "checking",
				HudVariables: buildMatrixHud(i, j, rows, cols),
				MatrixState:  buildMatrixState(transpose, j, i),
			})
		}
	}

	steps = append(steps, models.StepState{
		Line:         0,
		Action:       "Transpose Complete",
		Status:       "found",
		HudVariables: buildMatrixHud(-1, -1, rows, cols),
		MatrixState:  buildMatrixState(transpose, -1, -1),
	})

	return steps
}

// -- MATRIX ROTATION (90 deg clockwise) --
func GenerateMatrixRotationSteps(req models.SimulationRequest) []models.StepState {
	// Deep copy original to matrix
	matrix := make([][]int, len(req.Original))
	for i := range req.Original {
		matrix[i] = make([]int, len(req.Original[i]))
		copy(matrix[i], req.Original[i])
	}

	if len(matrix) == 0 {
		return []models.StepState{}
	}
	n := len(matrix) // assuming square for simplicity
	var steps []models.StepState

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Initial Matrix",
		Status:       "checking",
		HudVariables: buildMatrixHud(-1, -1, n, n),
		MatrixState:  buildMatrixState(matrix, -1, -1),
	})

	// 1. Transpose in-place
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
		}
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Transpose matrix",
		Status:       "checking",
		HudVariables: buildMatrixHud(-1, -1, n, n),
		MatrixState:  buildMatrixState(matrix, -1, -1),
	})

	// 2. Reverse each row
	for i := 0; i < n; i++ {
		steps = append(steps, models.StepState{
			Line:         2,
			Action:       "For row " + intToString(i),
			Status:       "checking",
			HudVariables: buildMatrixHud(i, -1, n, n),
			MatrixState:  buildMatrixState(matrix, i, -1),
		})
		
		left, right := 0, n-1
		for left < right {
			matrix[i][left], matrix[i][right] = matrix[i][right], matrix[i][left]
			left++
			right--
		}

		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Reverse row " + intToString(i),
			Status:       "checking",
			HudVariables: buildMatrixHud(i, -1, n, n),
			MatrixState:  buildMatrixState(matrix, i, -1),
		})
	}

	steps = append(steps, models.StepState{
		Line:         4,
		Action:       "Return rotated matrix",
		Status:       "found",
		HudVariables: buildMatrixHud(-1, -1, n, n),
		MatrixState:  buildMatrixState(matrix, -1, -1),
	})

	return steps
}