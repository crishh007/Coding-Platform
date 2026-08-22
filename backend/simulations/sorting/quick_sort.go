package sorting

import "skillsync-learning-system/models"

func buildQuickSortHud(low, high, pivotIdx, n int) []models.HudVariable {
	return []models.HudVariable{
		{"low", intToString(low)},
		{"high", intToString(high)},
		{"pivot", intToString(pivotIdx)},
		{"n", intToString(n)},
	}
}

func buildQuickSortArrayState(arr []int, n int, low, high, pivotIdx, i, j int, swapping bool, sortedUpTo int, sorted map[int]bool) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		var pointers []string

		if idx >= low && idx <= high {
			color = "rgba(107, 114, 128, 0.4)" // gray for current partition
		}

		if idx == pivotIdx {
			pointers = append(pointers, "pivot")
			color = "rgba(59, 130, 246, 0.7)" // blue for pivot
		}

		if idx == i && !swapping {
			pointers = append(pointers, "i")
		}

		if idx == j {
			pointers = append(pointers, "j")
			color = "rgba(251, 146, 60, 0.7)" // orange for comparing
		}

		if swapping && (idx == i || idx == j || idx == pivotIdx) {
			color = "rgba(251, 146, 60, 0.7)" // orange for swapping
			if idx == i {
				pointers = append(pointers, "i")
			}
		}

		if sorted[idx] || idx <= sortedUpTo {
			color = "rgba(34, 197, 94, 0.7)" // green for sorted
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

func quickSortRecursion(arr []int, low, high, n int, sorted map[int]bool, steps *[]models.StepState) {
	if low < high {
		*steps = append(*steps, models.StepState{
			Line:         2,
			Action:       "if low < high",
			Status:       "checking",
			HudVariables: buildQuickSortHud(low, high, -1, n),
			ArrayState:   buildQuickSortArrayState(arr, n, low, high, -1, -1, -1, false, -1, sorted),
			MathSteps:    []models.MathStep{},
		})

		pi := partition(arr, low, high, n, sorted, steps)
		sorted[pi] = true

		*steps = append(*steps, models.StepState{
			Line:         3,
			Action:       "Pivot placed at " + intToString(pi),
			Status:       "checking",
			HudVariables: buildQuickSortHud(low, high, pi, n),
			ArrayState:   buildQuickSortArrayState(arr, n, low, high, pi, -1, -1, false, -1, sorted),
			MathSteps:    []models.MathStep{},
		})

		*steps = append(*steps, models.StepState{
			Line:         4,
			Action:       "Recursively sort left of pivot",
			Status:       "checking",
			HudVariables: buildQuickSortHud(low, pi-1, pi, n),
			ArrayState:   buildQuickSortArrayState(arr, n, low, pi-1, -1, -1, -1, false, -1, sorted),
			MathSteps:    []models.MathStep{},
		})
		quickSortRecursion(arr, low, pi-1, n, sorted, steps)

		*steps = append(*steps, models.StepState{
			Line:         5,
			Action:       "Recursively sort right of pivot",
			Status:       "checking",
			HudVariables: buildQuickSortHud(pi+1, high, pi, n),
			ArrayState:   buildQuickSortArrayState(arr, n, pi+1, high, -1, -1, -1, false, -1, sorted),
			MathSteps:    []models.MathStep{},
		})
		quickSortRecursion(arr, pi+1, high, n, sorted, steps)
	} else if low == high {
		sorted[low] = true
	}
}

func partition(arr []int, low, high, n int, sorted map[int]bool, steps *[]models.StepState) int {
	pivot := arr[high]
	i := low - 1

	*steps = append(*steps, models.StepState{
		Line:         3,
		Action:       "Set pivot to A[" + intToString(high) + "] = " + intToString(pivot),
		Status:       "checking",
		HudVariables: buildQuickSortHud(low, high, high, n),
		ArrayState:   buildQuickSortArrayState(arr, n, low, high, high, i, -1, false, -1, sorted),
		MathSteps:    []models.MathStep{},
	})

	for j := low; j < high; j++ {
		*steps = append(*steps, models.StepState{
			Line:         3,
			Action:       "Check if A[" + intToString(j) + "] <= pivot",
			Status:       "checking",
			HudVariables: buildQuickSortHud(low, high, high, n),
			ArrayState:   buildQuickSortArrayState(arr, n, low, high, high, i, j, false, -1, sorted),
			MathSteps:    []models.MathStep{},
		})

		if arr[j] <= pivot {
			i++
			*steps = append(*steps, models.StepState{
				Line:         3,
				Action:       "Swap A[" + intToString(i) + "] and A[" + intToString(j) + "]",
				Status:       "swapping",
				HudVariables: buildQuickSortHud(low, high, high, n),
				ArrayState:   buildQuickSortArrayState(arr, n, low, high, high, i, j, true, -1, sorted),
				MathSteps:    []models.MathStep{},
			})
			arr[i], arr[j] = arr[j], arr[i]
		}
	}

	*steps = append(*steps, models.StepState{
		Line:         3,
		Action:       "Swap pivot into position " + intToString(i+1),
		Status:       "swapping",
		HudVariables: buildQuickSortHud(low, high, high, n),
		ArrayState:   buildQuickSortArrayState(arr, n, low, high, high, i+1, high, true, -1, sorted),
		MathSteps:    []models.MathStep{},
	})
	arr[i+1], arr[high] = arr[high], arr[i+1]

	return i + 1
}

func GenerateQuickSortSteps(req models.SimulationRequest) []models.StepState {
	arr := make([]int, len(req.Array))
	copy(arr, req.Array)
	n := len(arr)
	var steps []models.StepState
	sorted := make(map[int]bool)

	if n == 0 {
		return steps
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Start Quick Sort",
		Status:       "checking",
		HudVariables: buildQuickSortHud(0, n-1, -1, n),
		ArrayState:   buildQuickSortArrayState(arr, n, 0, n-1, -1, -1, -1, false, -1, sorted),
		MathSteps:    []models.MathStep{},
	})

	quickSortRecursion(arr, 0, n-1, n, sorted, &steps)

	steps = append(steps, models.StepState{
		Line:         0,
		Action:       "Array is completely sorted.",
		Status:       "found",
		HudVariables: buildQuickSortHud(0, n-1, -1, n),
		ArrayState:   buildQuickSortArrayState(arr, n, -1, -1, -1, -1, -1, false, n-1, sorted),
		MathSteps:    []models.MathStep{},
	})

	return steps
}
