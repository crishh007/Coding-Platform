package searching

import (
	"math"
	"strconv"

	"codemastery-learning-system/models"
)

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func buildJumpArrayState(arr []int, step, prev, i, foundIdx int) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		dim := false
		var pointers []string

		if idx < prev {
			dim = true
		} else if idx <= min(step, len(arr))-1 {
			color = "rgba(251, 146, 60, 0.2)" // light orange for active block
		} else {
			dim = true
		}

		if idx == prev {
			pointers = append(pointers, "prev")
		}
		if idx == min(step, len(arr))-1 {
			pointers = append(pointers, "step")
		}
		if i != -1 && idx == i {
			pointers = append(pointers, "i")
			color = "#38bdf8" // blue for linear scan
		}
		if idx == foundIdx {
			pointers = append(pointers, "i")
			color = "#22c55e" // green
		}

		state[idx] = models.ArrayCellState{
			Value:    arr[idx],
			Color:    color,
			Pointers: pointers,
			Dim:      dim,
		}
	}
	return state
}

func buildJumpHud(arr []int, step, prev, i int) []models.HudVariable {
	iStr := "-"
	aiStr := "-"
	aPrevStr := "-"
	if i != -1 {
		iStr = intToString(i)
		if i >= 0 && i < len(arr) {
			aiStr = intToString(arr[i])
		}
	}
	if prev >= 0 && prev < len(arr) {
		aPrevStr = intToString(arr[prev])
	}
	return []models.HudVariable{
		{"step", intToString(step)},
		{"prev", intToString(prev)},
		{"A[prev]", aPrevStr},
		{"i", iStr},
		{"A[i]", aiStr},
	}
}

func GenerateJumpSearchSteps(arr []int, target int) []models.StepState {
	var steps []models.StepState
	n := len(arr)
	stepSize := int(math.Floor(math.Sqrt(float64(n))))
	step := stepSize

	currentMathSteps := []models.MathStep{
		{Label: "length (n)", Expression: intToString(n), Highlight: false},
		{Label: "sqrt(n)", Expression: "√" + intToString(n) + " ≈ " + strconv.FormatFloat(math.Sqrt(float64(n)), 'f', 2, 64), Highlight: false},
		{Label: "floor", Expression: "floor", Highlight: false},
		{Label: "step", Expression: intToString(stepSize), Highlight: true},
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Calculate step size = floor(sqrt(" + intToString(n) + ")) = " + intToString(stepSize) + ".",
		Status:       "checking",
		HudVariables: buildJumpHud(arr, step, 0, -1),
		ArrayState:   buildJumpArrayState(arr, step, 0, -1, -1),
		MathSteps:    currentMathSteps,
	})

	prev := 0
	steps = append(steps, models.StepState{
		Line:         2,
		Action:       "Initialize prev = 0.",
		Status:       "checking",
		HudVariables: buildJumpHud(arr, step, prev, -1),
		ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
		MathSteps:    currentMathSteps,
	})

	for arr[min(step, n)-1] < target {
		loopMathSteps := []models.MathStep{
			{Label: "step", Expression: intToString(step), Highlight: false},
			{Label: "n", Expression: intToString(n), Highlight: false},
			{Label: "min(step, n)", Expression: intToString(min(step, n)), Highlight: false},
			{Label: "index", Expression: intToString(min(step, n)-1), Highlight: true},
		}
		
		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Check A[min(step, n)-1] < target: A[" + intToString(min(step, n)-1) + "] < " + intToString(target) + " is True.",
			Status:       "checking",
			HudVariables: buildJumpHud(arr, step, prev, -1),
			ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
			MathSteps:    loopMathSteps,
		})

		prev = step
		steps = append(steps, models.StepState{
			Line:         4,
			Action:       "Update prev = step -> " + intToString(prev) + ".",
			Status:       "checking",
			HudVariables: buildJumpHud(arr, step, prev, -1),
			ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
			MathSteps:    loopMathSteps,
		})

		step += stepSize
		updateMathSteps := []models.MathStep{
			{Label: "prev step", Expression: intToString(step - stepSize), Highlight: false},
			{Label: "+ stepSize", Expression: "+ " + intToString(stepSize), Highlight: false},
			{Label: "new step", Expression: intToString(step), Highlight: true},
		}

		steps = append(steps, models.StepState{
			Line:         5,
			Action:       "Update step += " + intToString(stepSize) + " -> " + intToString(step) + ".",
			Status:       "checking",
			HudVariables: buildJumpHud(arr, step, prev, -1),
			ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
			MathSteps:    updateMathSteps,
		})

		if prev >= n {
			steps = append(steps, models.StepState{
				Line:         3,
				Action:       "prev >= n, target is out of bounds.",
				Status:       "not_found",
				HudVariables: buildJumpHud(arr, step, prev, -1),
				ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
				MathSteps:    updateMathSteps,
			})
			steps = append(steps, models.StepState{
				Line:         9,
				Action:       "Target not found. Return -1.",
				Status:       "not_found",
				HudVariables: buildJumpHud(arr, step, prev, -1),
				ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
				MathSteps:    currentMathSteps,
			})
			return steps
		}
	}

	finalLoopMathSteps := []models.MathStep{
		{Label: "step", Expression: intToString(step), Highlight: false},
		{Label: "n", Expression: intToString(n), Highlight: false},
		{Label: "min(step, n)", Expression: intToString(min(step, n)), Highlight: false},
		{Label: "index", Expression: intToString(min(step, n)-1), Highlight: true},
	}

	steps = append(steps, models.StepState{
		Line:         3,
		Action:       "Check A[min(step, n)-1] < target: A[" + intToString(min(step, n)-1) + "] < " + intToString(target) + " is False.",
		Status:       "checking",
		HudVariables: buildJumpHud(arr, step, prev, -1),
		ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
		MathSteps:    finalLoopMathSteps,
	})

	for i := prev; i < min(step, n); i++ {
		steps = append(steps, models.StepState{
			Line:         6,
			Action:       "Loop: i = " + intToString(i) + " is less than min(step, n) = " + intToString(min(step, n)) + ".",
			Status:       "checking",
			HudVariables: buildJumpHud(arr, step, prev, i),
			ArrayState:   buildJumpArrayState(arr, step, prev, i, -1),
			MathSteps:    currentMathSteps,
		})

		if arr[i] == target {
			steps = append(steps, models.StepState{
				Line:         7,
				Action:       "Check if A[i] == target: A[" + intToString(i) + "] == " + intToString(target) + " is True.",
				Status:       "checking",
				HudVariables: buildJumpHud(arr, step, prev, i),
				ArrayState:   buildJumpArrayState(arr, step, prev, i, -1),
				MathSteps:    currentMathSteps,
			})
			steps = append(steps, models.StepState{
				Line:         8,
				Action:       "Target found at index " + intToString(i) + "! Return i.",
				Status:       "found",
				HudVariables: buildJumpHud(arr, step, prev, i),
				ArrayState:   buildJumpArrayState(arr, step, prev, -1, i),
				MathSteps:    currentMathSteps,
			})
			return steps
		} else {
			steps = append(steps, models.StepState{
				Line:         7,
				Action:       "Check if A[i] == target: A[" + intToString(i) + "] == " + intToString(target) + " is False.",
				Status:       "checking",
				HudVariables: buildJumpHud(arr, step, prev, i),
				ArrayState:   buildJumpArrayState(arr, step, prev, i, -1),
				MathSteps:    currentMathSteps,
			})
		}
	}

	steps = append(steps, models.StepState{
		Line:         6,
		Action:       "Loop condition failed: i reached block end.",
		Status:       "checking",
		HudVariables: buildJumpHud(arr, step, prev, min(step, n)),
		ArrayState:   buildJumpArrayState(arr, step, prev, min(step, n), -1),
		MathSteps:    currentMathSteps,
	})

	steps = append(steps, models.StepState{
		Line:         9,
		Action:       "Target not found. Return -1.",
		Status:       "not_found",
		HudVariables: buildJumpHud(arr, step, prev, -1),
		ArrayState:   buildJumpArrayState(arr, step, prev, -1, -1),
		MathSteps:    currentMathSteps,
	})

	return steps
}

func intToString(i int) string {
	return strconv.Itoa(i)
}