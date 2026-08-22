package arrays

import "skillsync-learning-system/models"

func buildArrayRotationHud(k int, n int) []models.HudVariable {
	return []models.HudVariable{
		{"k", intToString(k)},
		{"n", intToString(n)},
	}
}

func buildArrayRotationState(arr []int, highlightStart, highlightEnd int) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		if idx >= highlightStart && idx <= highlightEnd && highlightStart != -1 {
			color = "rgba(59, 130, 246, 0.7)"
		}
		state[idx] = models.ArrayCellState{
			Value:    arr[idx],
			Color:    color,
			Pointers: []string{},
			Dim:      false,
		}
	}
	return state
}

func reverseSubarray(arr []int, start, end int) {
	for start < end {
		arr[start], arr[end] = arr[end], arr[start]
		start++
		end--
	}
}

func GenerateArrayRotationSteps(req models.SimulationRequest) []models.StepState {
	arr := make([]int, len(req.Array))
	copy(arr, req.Array)
	n := len(arr)
	k := req.K
	var steps []models.StepState

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Initial array",
		Status:       "checking",
		HudVariables: buildArrayRotationHud(k, n),
		ArrayState:   buildArrayRotationState(arr, -1, -1),
	})

	originalK := k
	k = k % n
	if k < 0 {
		k += n // Handle negative rotation if passed
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "k = " + intToString(originalK) + " % " + intToString(n) + " = " + intToString(k),
		Status:       "checking",
		HudVariables: buildArrayRotationHud(k, n),
		ArrayState:   buildArrayRotationState(arr, -1, -1),
	})

	reverseSubarray(arr, 0, n-1)
	steps = append(steps, models.StepState{
		Line:         2,
		Action:       "Reverse entire array",
		Status:       "checking",
		HudVariables: buildArrayRotationHud(k, n),
		ArrayState:   buildArrayRotationState(arr, 0, n-1),
	})

	if req.RotationType == "right" {
		reverseSubarray(arr, 0, k-1)
		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Reverse first k (" + intToString(k) + ") elements",
			Status:       "checking",
			HudVariables: buildArrayRotationHud(k, n),
			ArrayState:   buildArrayRotationState(arr, 0, k-1),
		})

		reverseSubarray(arr, k, n-1)
		steps = append(steps, models.StepState{
			Line:         4,
			Action:       "Reverse remaining elements",
			Status:       "checking",
			HudVariables: buildArrayRotationHud(k, n),
			ArrayState:   buildArrayRotationState(arr, k, n-1),
		})
	}

	steps = append(steps, models.StepState{
		Line:         5,
		Action:       "Return rotated array",
		Status:       "found",
		HudVariables: buildArrayRotationHud(k, n),
		ArrayState:   buildArrayRotationState(arr, -1, -1),
	})

	return steps
}

// -- MATRIX TRANSPOSE --
