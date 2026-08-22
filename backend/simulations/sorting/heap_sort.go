package sorting

import "skillsync-learning-system/models"

func buildHeapSortHud(n, i, heapSize int) []models.HudVariable {
	return []models.HudVariable{
		{"n", intToString(n)},
		{"i", intToString(i)},
		{"heapSize", intToString(heapSize)},
	}
}

func buildHeapSortArrayState(arr []int, n int, heapSize int, comparing1 int, comparing2 int, swapping1 int, swapping2 int, sortedUpTo int) []models.ArrayCellState {
	state := make([]models.ArrayCellState, len(arr))
	for idx := 0; idx < len(arr); idx++ {
		color := "transparent"
		var pointers []string

		if idx < heapSize {
			color = "rgba(107, 114, 128, 0.4)" // gray for heap region
		}

		if idx == comparing1 || idx == comparing2 {
			color = "rgba(251, 146, 60, 0.7)" // orange for comparing
		}

		if swapping1 != -1 && (idx == swapping1 || idx == swapping2) {
			color = "rgba(251, 146, 60, 0.7)" // orange for swapping
		}

		if idx >= sortedUpTo {
			color = "rgba(34, 197, 94, 0.7)" // green for sorted region
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

func heapify(arr []int, n, i, heapSize, originalN int, steps *[]models.StepState) {
	largest := i
	l := 2*i + 1
	r := 2*i + 2

	*steps = append(*steps, models.StepState{
		Line:         5,
		Action:       "Heapify at index " + intToString(i),
		Status:       "checking",
		HudVariables: buildHeapSortHud(originalN, i, heapSize),
		ArrayState:   buildHeapSortArrayState(arr, originalN, heapSize, i, -1, -1, -1, heapSize),
		MathSteps:    []models.MathStep{},
	})

	if l < heapSize {
		*steps = append(*steps, models.StepState{
			Line:         5,
			Action:       "Compare left child " + intToString(l) + " with largest " + intToString(largest),
			Status:       "checking",
			HudVariables: buildHeapSortHud(originalN, i, heapSize),
			ArrayState:   buildHeapSortArrayState(arr, originalN, heapSize, l, largest, -1, -1, heapSize),
			MathSteps:    []models.MathStep{},
		})
		if arr[l] > arr[largest] {
			largest = l
		}
	}

	if r < heapSize {
		*steps = append(*steps, models.StepState{
			Line:         5,
			Action:       "Compare right child " + intToString(r) + " with largest " + intToString(largest),
			Status:       "checking",
			HudVariables: buildHeapSortHud(originalN, i, heapSize),
			ArrayState:   buildHeapSortArrayState(arr, originalN, heapSize, r, largest, -1, -1, heapSize),
			MathSteps:    []models.MathStep{},
		})
		if arr[r] > arr[largest] {
			largest = r
		}
	}

	if largest != i {
		*steps = append(*steps, models.StepState{
			Line:         5,
			Action:       "Swap A[" + intToString(i) + "] and A[" + intToString(largest) + "]",
			Status:       "swapping",
			HudVariables: buildHeapSortHud(originalN, i, heapSize),
			ArrayState:   buildHeapSortArrayState(arr, originalN, heapSize, -1, -1, i, largest, heapSize),
			MathSteps:    []models.MathStep{},
		})

		arr[i], arr[largest] = arr[largest], arr[i]
		heapify(arr, n, largest, heapSize, originalN, steps)
	}
}

func GenerateHeapSortSteps(req models.SimulationRequest) []models.StepState {
	arr := make([]int, len(req.Array))
	copy(arr, req.Array)
	n := len(arr)
	var steps []models.StepState

	if n == 0 {
		return steps
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Start Heap Sort",
		Status:       "checking",
		HudVariables: buildHeapSortHud(n, -1, n),
		ArrayState:   buildHeapSortArrayState(arr, n, n, -1, -1, -1, -1, n),
		MathSteps:    []models.MathStep{},
	})

	for i := n/2 - 1; i >= 0; i-- {
		steps = append(steps, models.StepState{
			Line:         1,
			Action:       "Build Max Heap (i=" + intToString(i) + ")",
			Status:       "checking",
			HudVariables: buildHeapSortHud(n, i, n),
			ArrayState:   buildHeapSortArrayState(arr, n, n, i, -1, -1, -1, n),
			MathSteps:    []models.MathStep{},
		})
		heapify(arr, n, i, n, n, &steps)
	}

	for i := n - 1; i > 0; i-- {
		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Extract max to A[" + intToString(i) + "]",
			Status:       "swapping",
			HudVariables: buildHeapSortHud(n, i, i+1),
			ArrayState:   buildHeapSortArrayState(arr, n, i+1, -1, -1, 0, i, i+1),
			MathSteps:    []models.MathStep{},
		})

		arr[0], arr[i] = arr[i], arr[0]

		steps = append(steps, models.StepState{
			Line:         4,
			Action:       "Reduce heap size",
			Status:       "checking",
			HudVariables: buildHeapSortHud(n, i, i),
			ArrayState:   buildHeapSortArrayState(arr, n, i, -1, -1, -1, -1, i),
			MathSteps:    []models.MathStep{},
		})

		heapify(arr, n, 0, i, n, &steps)
	}

	steps = append(steps, models.StepState{
		Line:         0,
		Action:       "Array is completely sorted.",
		Status:       "found",
		HudVariables: buildHeapSortHud(n, -1, 0),
		ArrayState:   buildHeapSortArrayState(arr, n, 0, -1, -1, -1, -1, 0),
		MathSteps:    []models.MathStep{},
	})

	return steps
}
