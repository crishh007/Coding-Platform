package sorting

import "codemastery-learning-system/models"

func buildInsertionSortHud(i, j, key, n int) []models.HudVariable {
	return []models.HudVariable{
		{"i", intToString(i)},
		{"j", intToString(j)},
		{"key", intToString(key)},
		{"n", intToString(n)},
	}
}

func buildInsertionSortArrayState(arr []int, n int, sortedUpTo int, i int, j int, comparing bool, shifting bool, inserting bool) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		var pointers []string

		if idx <= sortedUpTo {
			color = "rgba(34, 197, 94, 0.7)" // green for sorted region
		}

		if idx == i {
			pointers = append(pointers, "i")
			if color == "transparent" {
				color = "rgba(59, 130, 246, 0.7)" // blue for current element
			}
		}

		if idx == j {
			pointers = append(pointers, "j")
			if comparing {
				color = "rgba(251, 146, 60, 0.7)" // orange for comparing
			}
		}

		if shifting && (idx == j || idx == j+1) {
			color = "rgba(251, 146, 60, 0.7)" // orange for shifting
		}
		
		if inserting && idx == j+1 {
			color = "rgba(251, 146, 60, 0.7)" // orange for inserting
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

func GenerateInsertionSortSteps(req models.SimulationRequest) []models.StepState {
	arr := make([]int, len(req.Array))
	copy(arr, req.Array)
	n := len(arr)
	var steps []models.StepState

	if n == 0 {
		return steps
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Start Insertion Sort",
		Status:       "checking",
		HudVariables: buildInsertionSortHud(1, 0, 0, n),
		ArrayState:   buildInsertionSortArrayState(arr, n, 0, -1, -1, false, false, false),
		MathSteps:    []models.MathStep{},
	})

	for i := 1; i < n; i++ {
		key := arr[i]
		j := i - 1

		steps = append(steps, models.StepState{
			Line:         2,
			Action:       "Set key = " + intToString(key),
			Status:       "checking",
			HudVariables: buildInsertionSortHud(i, j, key, n),
			ArrayState:   buildInsertionSortArrayState(arr, n, i-1, i, -1, false, false, false),
			MathSteps:    []models.MathStep{},
		})

		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Set j = " + intToString(j),
			Status:       "checking",
			HudVariables: buildInsertionSortHud(i, j, key, n),
			ArrayState:   buildInsertionSortArrayState(arr, n, i-1, i, j, false, false, false),
			MathSteps:    []models.MathStep{},
		})

		for j >= 0 {
			steps = append(steps, models.StepState{
				Line:         4,
				Action:       "Check if A[" + intToString(j) + "] > key",
				Status:       "checking",
				HudVariables: buildInsertionSortHud(i, j, key, n),
				ArrayState:   buildInsertionSortArrayState(arr, n, i-1, i, j, true, false, false),
				MathSteps:    []models.MathStep{},
			})

			if arr[j] > key {
				steps = append(steps, models.StepState{
					Line:         5,
					Action:       "Shift A[" + intToString(j) + "] to A[" + intToString(j+1) + "]",
					Status:       "swapping",
					HudVariables: buildInsertionSortHud(i, j, key, n),
					ArrayState:   buildInsertionSortArrayState(arr, n, i-1, i, j, false, true, false),
					MathSteps:    []models.MathStep{},
				})

				arr[j+1] = arr[j]

				steps = append(steps, models.StepState{
					Line:         6,
					Action:       "Decrement j to " + intToString(j-1),
					Status:       "checking",
					HudVariables: buildInsertionSortHud(i, j-1, key, n),
					ArrayState:   buildInsertionSortArrayState(arr, n, i-1, -1, j-1, false, false, false),
					MathSteps:    []models.MathStep{},
				})
				j = j - 1
			} else {
				break
			}
		}

		steps = append(steps, models.StepState{
			Line:         7,
			Action:       "Insert key " + intToString(key) + " at A[" + intToString(j+1) + "]",
			Status:       "swapping",
			HudVariables: buildInsertionSortHud(i, j, key, n),
			ArrayState:   buildInsertionSortArrayState(arr, n, i-1, -1, j, false, false, true),
			MathSteps:    []models.MathStep{},
		})

		arr[j+1] = key

		steps = append(steps, models.StepState{
			Line:         7,
			Action:       "Key Inserted",
			Status:       "checking",
			HudVariables: buildInsertionSortHud(i, j, key, n),
			ArrayState:   buildInsertionSortArrayState(arr, n, i, -1, -1, false, false, false),
			MathSteps:    []models.MathStep{},
		})
	}

	steps = append(steps, models.StepState{
		Line:         0,
		Action:       "Array is completely sorted.",
		Status:       "found",
		HudVariables: buildInsertionSortHud(n, -1, 0, n),
		ArrayState:   buildInsertionSortArrayState(arr, n, n-1, -1, -1, false, false, false),
		MathSteps:    []models.MathStep{},
	})

	return steps
}
