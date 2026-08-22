package searching

import "skillsync-learning-system/models"

func buildBinaryArrayState(arr []int, low, high, mid int, foundIdx int) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for i := 0; i < len(arr); i++ {
		color := "transparent"
		dim := true
		var pointers []string

		if i >= low && i <= high {
			dim = false
			color = "rgba(251, 146, 60, 0.2)" // light orange
		}
		if i == low {
			pointers = append(pointers, "low")
		}
		if i == high {
			pointers = append(pointers, "high")
		}
		if i == mid {
			pointers = append(pointers, "mid")
			color = "#fb923c" // orange
		}
		if i == foundIdx {
			color = "#22c55e" // green
		}

		state[i] = models.ArrayCellState{
			Value:    arr[i],
			Color:    color,
			Pointers: pointers,
			Dim:      dim,
		}
	}
	return state
}

func buildBinaryHud(arr []int, low, high, mid int) []models.HudVariable {
	midStr := "-"
	aMidStr := "-"
	if mid != -1 {
		midStr = intToString(mid)
		if mid >= 0 && mid < len(arr) {
			aMidStr = intToString(arr[mid])
		}
	}
	return []models.HudVariable{
		{"low", intToString(low)},
		{"high", intToString(high)},
		{"mid", midStr},
		{"A[mid]", aMidStr},
	}
}

func GenerateBinarySearchSteps(arr []int, target int) []models.StepState {
	var steps []models.StepState
	var currentMathSteps []models.MathStep
	low := 0
	high := len(arr) - 1
	lastMid := -1

	// Initialize
	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Initialize boundaries: low = 0, high = " + intToString(high) + ".",
		Status:       "checking",
		HudVariables: buildBinaryHud(arr, low, high, -1),
		ArrayState:   buildBinaryArrayState(arr, low, high, -1, -1),
		MathSteps:    currentMathSteps,
	})

	for low <= high {
		// Loop condition
		steps = append(steps, models.StepState{
			Line:         2,
			Action:       "Check loop condition: low (" + intToString(low) + ") <= high (" + intToString(high) + ") is True.",
			Status:       "checking",
			HudVariables: buildBinaryHud(arr, low, high, lastMid),
			ArrayState:   buildBinaryArrayState(arr, low, high, lastMid, -1),
			MathSteps:    currentMathSteps,
		})

		mid := low + (high-low)/2
		lastMid = mid

		// Mid calculation
		diff := high - low
		halfDiff := diff / 2
		
		currentMathSteps = []models.MathStep{
			{Label: "high - low", Expression: intToString(high) + " - " + intToString(low) + " = " + intToString(diff), Highlight: false},
			{Label: "÷ 2", Expression: intToString(diff) + " ÷ 2 = " + intToString(halfDiff), Highlight: false},
			{Label: "low +", Expression: intToString(low) + " + " + intToString(halfDiff) + " =", Highlight: false},
			{Label: "mid", Expression: intToString(mid), Highlight: true},
		}

		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Calculate mid: " + intToString(low) + " + (" + intToString(high) + " - " + intToString(low) + ") / 2 = " + intToString(mid) + ".",
			Status:       "checking",
			HudVariables: buildBinaryHud(arr, low, high, mid),
			ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
			MathSteps:    currentMathSteps,
		})

		// Compare
		if arr[mid] == target {
			steps = append(steps, models.StepState{
				Line:         4,
				Action:       "Check if A[mid] == target: " + intToString(arr[mid]) + " == " + intToString(target) + " is True.",
				Status:       "checking",
				HudVariables: buildBinaryHud(arr, low, high, mid),
				ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
				MathSteps:    currentMathSteps,
			})
			steps = append(steps, models.StepState{
				Line:         5,
				Action:       "Target found at index " + intToString(mid) + "! Return mid.",
				Status:       "found",
				HudVariables: buildBinaryHud(arr, low, high, mid),
				ArrayState:   buildBinaryArrayState(arr, low, high, mid, mid),
				MathSteps:    currentMathSteps,
			})
			return steps
		} else {
			steps = append(steps, models.StepState{
				Line:         4,
				Action:       "Check if A[mid] == target: " + intToString(arr[mid]) + " == " + intToString(target) + " is False.",
				Status:       "checking",
				HudVariables: buildBinaryHud(arr, low, high, mid),
				ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
				MathSteps:    currentMathSteps,
			})

			if arr[mid] < target {
				steps = append(steps, models.StepState{
					Line:         6,
					Action:       "Check if A[mid] < target: " + intToString(arr[mid]) + " < " + intToString(target) + " is True.",
					Status:       "checking",
					HudVariables: buildBinaryHud(arr, low, high, mid),
					ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
					MathSteps:    currentMathSteps,
				})
				low = mid + 1
				steps = append(steps, models.StepState{
					Line:         7,
					Action:       "Update low = mid + 1 -> " + intToString(low) + ".",
					Status:       "checking",
					HudVariables: buildBinaryHud(arr, low, high, mid),
					ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
					MathSteps:    currentMathSteps,
				})
			} else {
				steps = append(steps, models.StepState{
					Line:         6,
					Action:       "Check if A[mid] < target: " + intToString(arr[mid]) + " < " + intToString(target) + " is False.",
					Status:       "checking",
					HudVariables: buildBinaryHud(arr, low, high, mid),
					ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
					MathSteps:    currentMathSteps,
				})
				steps = append(steps, models.StepState{
					Line:         8,
					Action:       "Else condition met. Target is in left half.",
					Status:       "checking",
					HudVariables: buildBinaryHud(arr, low, high, mid),
					ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
					MathSteps:    currentMathSteps,
				})
				high = mid - 1
				steps = append(steps, models.StepState{
					Line:         9,
					Action:       "Update high = mid - 1 -> " + intToString(high) + ".",
					Status:       "checking",
					HudVariables: buildBinaryHud(arr, low, high, mid),
					ArrayState:   buildBinaryArrayState(arr, low, high, mid, -1),
					MathSteps:    currentMathSteps,
				})
			}
		}
	}

	steps = append(steps, models.StepState{
		Line:         2,
		Action:       "Check loop condition: low (" + intToString(low) + ") <= high (" + intToString(high) + ") is False. Loop ends.",
		Status:       "checking",
		HudVariables: buildBinaryHud(arr, low, high, lastMid),
		ArrayState:   buildBinaryArrayState(arr, low, high, lastMid, -1),
		MathSteps:    currentMathSteps,
	})

	steps = append(steps, models.StepState{
		Line:         10,
		Action:       "Target not found in array. Return -1.",
		Status:       "not_found",
		HudVariables: buildBinaryHud(arr, low, high, lastMid),
		ArrayState:   buildBinaryArrayState(arr, low, high, lastMid, -1),
		MathSteps:    currentMathSteps,
	})

	return steps
}

func buildLinearArrayState(arr []int, currIdx int, foundIdx int) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for i := 0; i < len(arr); i++ {
		color := "transparent"
		dim := false
		var pointers []string

		if i < currIdx {
			dim = true
		}
		if i == currIdx {
			pointers = append(pointers, "i")
			color = "#38bdf8" // blue
		}
		if i == foundIdx {
			pointers = append(pointers, "i")
			color = "#22c55e" // green
		}

		state[i] = models.ArrayCellState{
			Value:    arr[i],
			Color:    color,
			Pointers: pointers,
			Dim:      dim,
		}
	}
	return state
}

