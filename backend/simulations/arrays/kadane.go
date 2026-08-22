package arrays

import "skillsync-learning-system/models"

func buildKadanesHud(currentSum, maxSum, i int, n int) []models.HudVariable {
	return []models.HudVariable{
		{"i", intToString(i)},
		{"currentSum", intToString(currentSum)},
		{"maxSum", intToString(maxSum)},
		{"n", intToString(n)},
	}
}

func buildKadanesArrayState(arr []int, i int, currentStart, currentEnd int, maxStart, maxEnd int) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		var pointers []string
		
		if idx >= maxStart && idx <= maxEnd && maxStart != -1 {
			color = "rgba(34, 197, 94, 0.7)" // green for max subarray
		} else if idx >= currentStart && idx <= currentEnd && currentStart != -1 {
			color = "rgba(59, 130, 246, 0.7)" // blue for current subarray
		}
		
		if idx == i {
			pointers = append(pointers, "i")
			if color == "transparent" {
				color = "rgba(234, 179, 8, 0.7)" // yellow just for iteration
			}
		}

		state[idx] = models.ArrayCellState{
			Value:    arr[idx],
			Color:    color,
			Pointers: pointers,
			Dim:      false,
		}
	}
	return state
}

func GenerateKadanesAlgorithmSteps(req models.SimulationRequest) []models.StepState {
	arr := req.Array
	n := len(arr)
	if n == 0 {
		return []models.StepState{}
	}
	var steps []models.StepState

	currentSum := arr[0]
	maxSum := arr[0]
	currentStart := 0
	currentEnd := 0
	maxStart := 0
	maxEnd := 0

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Initialize currentSum = arr[0] (" + intToString(arr[0]) + ")",
		Status:       "checking",
		HudVariables: buildKadanesHud(currentSum, 0, 0, n),
		ArrayState:   buildKadanesArrayState(arr, 0, currentStart, currentEnd, -1, -1),
		MathSteps:    []models.MathStep{},
	})

	steps = append(steps, models.StepState{
		Line:         2,
		Action:       "Initialize maxSum = arr[0] (" + intToString(arr[0]) + ")",
		Status:       "checking",
		HudVariables: buildKadanesHud(currentSum, maxSum, 0, n),
		ArrayState:   buildKadanesArrayState(arr, 0, currentStart, currentEnd, maxStart, maxEnd),
		MathSteps:    []models.MathStep{},
	})

	for i := 1; i < n; i++ {
		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Loop i = " + intToString(i),
			Status:       "checking",
			HudVariables: buildKadanesHud(currentSum, maxSum, i, n),
			ArrayState:   buildKadanesArrayState(arr, i, currentStart, currentEnd, maxStart, maxEnd),
			MathSteps:    []models.MathStep{},
		})

		prevCurrentSum := currentSum
		if arr[i] > currentSum+arr[i] {
			currentSum = arr[i]
			currentStart = i
			currentEnd = i
		} else {
			currentSum = currentSum + arr[i]
			currentEnd = i
		}

		mathSteps := []models.MathStep{
			{Label: "arr[i]", Expression: intToString(arr[i]), Highlight: false},
			{Label: "currentSum + arr[i]", Expression: intToString(prevCurrentSum) + " + " + intToString(arr[i]) + " = " + intToString(prevCurrentSum+arr[i]), Highlight: false},
			{Label: "max()", Expression: intToString(currentSum), Highlight: true},
		}

		steps = append(steps, models.StepState{
			Line:         4,
			Action:       "Update currentSum = max(arr[i], currentSum + arr[i]) -> " + intToString(currentSum),
			Status:       "checking",
			HudVariables: buildKadanesHud(currentSum, maxSum, i, n),
			ArrayState:   buildKadanesArrayState(arr, i, currentStart, currentEnd, maxStart, maxEnd),
			MathSteps:    mathSteps,
		})

		prevMaxSum := maxSum
		if currentSum > maxSum {
			maxSum = currentSum
			maxStart = currentStart
			maxEnd = currentEnd
		}

		maxMathSteps := []models.MathStep{
			{Label: "maxSum", Expression: intToString(prevMaxSum), Highlight: false},
			{Label: "currentSum", Expression: intToString(currentSum), Highlight: false},
			{Label: "max()", Expression: intToString(maxSum), Highlight: true},
		}

		steps = append(steps, models.StepState{
			Line:         5,
			Action:       "Update maxSum = max(maxSum, currentSum) -> " + intToString(maxSum),
			Status:       "checking",
			HudVariables: buildKadanesHud(currentSum, maxSum, i, n),
			ArrayState:   buildKadanesArrayState(arr, i, currentStart, currentEnd, maxStart, maxEnd),
			MathSteps:    maxMathSteps,
		})
	}

	steps = append(steps, models.StepState{
		Line:         6,
		Action:       "Return maxSum = " + intToString(maxSum),
		Status:       "found",
		HudVariables: buildKadanesHud(currentSum, maxSum, -1, n),
		ArrayState:   buildKadanesArrayState(arr, -1, -1, -1, maxStart, maxEnd),
		MathSteps:    []models.MathStep{},
	})

	return steps
}

// -- ARRAY ROTATION --
