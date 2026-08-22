package sorting

import "skillsync-learning-system/models"

func buildBubbleSortHud(i, j, n int) []models.HudVariable {
	return []models.HudVariable{
		{"i", intToString(i)},
		{"j", intToString(j)},
		{"n", intToString(n)},
	}
}

func buildBubbleSortArrayState(arr []int, n int, i int, j int, swapping bool) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		var pointers []string

		if idx >= n-i {
			color = "rgba(34, 197, 94, 0.7)" // green for sorted region
		}

		if idx == j || idx == j+1 {
			if swapping {
				color = "rgba(251, 146, 60, 0.7)" // orange for swapping
			} else {
				color = "rgba(251, 146, 60, 0.7)" // orange for comparing
			}
			if idx == j {
				pointers = append(pointers, "j")
			} else {
				pointers = append(pointers, "j+1")
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

func GenerateBubbleSortSteps(req models.SimulationRequest) []models.StepState {
	arr := make([]int, len(req.Array))
	copy(arr, req.Array)
	n := len(arr)
	var steps []models.StepState

	if n == 0 {
		return steps
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Start Bubble Sort",
		Status:       "checking",
		HudVariables: buildBubbleSortHud(0, 0, n),
		ArrayState:   buildBubbleSortArrayState(arr, n, 0, -1, false),
		MathSteps:    []models.MathStep{},
	})

	for i := 0; i < n-1; i++ {
		steps = append(steps, models.StepState{
			Line:         2,
			Action:       "Loop i = " + intToString(i),
			Status:       "checking",
			HudVariables: buildBubbleSortHud(i, 0, n),
			ArrayState:   buildBubbleSortArrayState(arr, n, i, -1, false),
			MathSteps:    []models.MathStep{},
		})

		for j := 0; j < n-i-1; j++ {
			steps = append(steps, models.StepState{
				Line:         3,
				Action:       "Compare A[" + intToString(j) + "] and A[" + intToString(j+1) + "]",
				Status:       "checking",
				HudVariables: buildBubbleSortHud(i, j, n),
				ArrayState:   buildBubbleSortArrayState(arr, n, i, j, false),
				MathSteps:    []models.MathStep{},
			})

			if arr[j] > arr[j+1] {
				steps = append(steps, models.StepState{
					Line:         4,
					Action:       "Swap A[" + intToString(j) + "] and A[" + intToString(j+1) + "]",
					Status:       "swapping",
					HudVariables: buildBubbleSortHud(i, j, n),
					ArrayState:   buildBubbleSortArrayState(arr, n, i, j, true),
					MathSteps:    []models.MathStep{},
				})

				arr[j], arr[j+1] = arr[j+1], arr[j]

				steps = append(steps, models.StepState{
					Line:         4,
					Action:       "Elements Swapped",
					Status:       "checking",
					HudVariables: buildBubbleSortHud(i, j, n),
					ArrayState:   buildBubbleSortArrayState(arr, n, i, -1, false),
					MathSteps:    []models.MathStep{},
				})
			}
		}
	}

	steps = append(steps, models.StepState{
		Line:         0,
		Action:       "Array is completely sorted.",
		Status:       "found",
		HudVariables: buildBubbleSortHud(n-1, 0, n),
		ArrayState:   buildBubbleSortArrayState(arr, n, n, -1, false),
		MathSteps:    []models.MathStep{},
	})

	return steps
}
