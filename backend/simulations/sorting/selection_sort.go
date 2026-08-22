package sorting

import "skillsync-learning-system/models"

func buildSelectionSortHud(i, j, minIndex, n int) []models.HudVariable {
	hud := []models.HudVariable{
		{"i", intToString(i)},
		{"j", intToString(j)},
		{"minIndex", intToString(minIndex)},
		{"n", intToString(n)},
	}
	return hud
}

func buildSelectionSortArrayState(arr []int, n int, i int, j int, minIndex int, swapping bool) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		var pointers []string
		
		if idx < i {
			color = "rgba(34, 197, 94, 0.7)" // green for sorted region
		}
		
		if idx == minIndex {
			pointers = append(pointers, "minIndex")
			if color == "transparent" {
				color = "rgba(59, 130, 246, 0.7)" // blue for min index
			}
		}

		if idx == i && !swapping {
			pointers = append(pointers, "i")
		}

		if idx == j {
			pointers = append(pointers, "j")
			color = "rgba(251, 146, 60, 0.7)" // soft orange for comparing
		}
		
		if swapping && (idx == i || idx == minIndex) {
			color = "rgba(251, 146, 60, 0.7)" // orange for swapping
			if idx == i {
				pointers = append(pointers, "i")
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

func GenerateSelectionSortSteps(req models.SimulationRequest) []models.StepState {
	arr := make([]int, len(req.Array))
	copy(arr, req.Array)
	n := len(arr)
	var steps []models.StepState

	if n == 0 {
		return steps
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Start Selection Sort",
		Status:       "checking",
		HudVariables: buildSelectionSortHud(0, 1, 0, n),
		ArrayState:   buildSelectionSortArrayState(arr, n, 0, -1, -1, false),
		MathSteps:    []models.MathStep{},
	})

	for i := 0; i < n-1; i++ {
		minIndex := i
		steps = append(steps, models.StepState{
			Line:         2,
			Action:       "Set minIndex = " + intToString(i),
			Status:       "checking",
			HudVariables: buildSelectionSortHud(i, i+1, minIndex, n),
			ArrayState:   buildSelectionSortArrayState(arr, n, i, -1, minIndex, false),
			MathSteps:    []models.MathStep{},
		})

		for j := i + 1; j < n; j++ {
			steps = append(steps, models.StepState{
				Line:         3,
				Action:       "Loop j = " + intToString(j),
				Status:       "checking",
				HudVariables: buildSelectionSortHud(i, j, minIndex, n),
				ArrayState:   buildSelectionSortArrayState(arr, n, i, j, minIndex, false),
				MathSteps:    []models.MathStep{},
			})

			steps = append(steps, models.StepState{
				Line:         4,
				Action:       "Check if A[" + intToString(j) + "] < A[" + intToString(minIndex) + "]",
				Status:       "checking",
				HudVariables: buildSelectionSortHud(i, j, minIndex, n),
				ArrayState:   buildSelectionSortArrayState(arr, n, i, j, minIndex, false),
				MathSteps:    []models.MathStep{},
			})

			if arr[j] < arr[minIndex] {
				minIndex = j
				steps = append(steps, models.StepState{
					Line:         5,
					Action:       "Update minIndex = " + intToString(j),
					Status:       "checking",
					HudVariables: buildSelectionSortHud(i, j, minIndex, n),
					ArrayState:   buildSelectionSortArrayState(arr, n, i, -1, minIndex, false),
					MathSteps:    []models.MathStep{},
				})
			}
		}

		steps = append(steps, models.StepState{
			Line:         6,
			Action:       "Swap A[" + intToString(i) + "] and A[" + intToString(minIndex) + "]",
			Status:       "swapping",
			HudVariables: buildSelectionSortHud(i, -1, minIndex, n),
			ArrayState:   buildSelectionSortArrayState(arr, n, i, -1, minIndex, true),
			MathSteps:    []models.MathStep{},
		})

		arr[i], arr[minIndex] = arr[minIndex], arr[i]

		steps = append(steps, models.StepState{
			Line:         6,
			Action:       "Elements Swapped",
			Status:       "checking",
			HudVariables: buildSelectionSortHud(i, -1, minIndex, n),
			ArrayState:   buildSelectionSortArrayState(arr, n, i+1, -1, -1, false),
			MathSteps:    []models.MathStep{},
		})
	}

	steps = append(steps, models.StepState{
		Line:         0,
		Action:       "Array is completely sorted.",
		Status:       "found",
		HudVariables: buildSelectionSortHud(n-1, -1, n-1, n),
		ArrayState:   buildSelectionSortArrayState(arr, n, n, -1, -1, false),
		MathSteps:    []models.MathStep{},
	})

	return steps
}
