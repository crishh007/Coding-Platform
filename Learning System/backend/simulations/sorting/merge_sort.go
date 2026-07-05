package sorting

import (
	"codemastery-learning-system/models"
)

func buildMergeSortHud(currSize, leftStart, mid, rightEnd, i, j, k, n int) []models.HudVariable {
	return []models.HudVariable{
		{"currSize", intToString(currSize)},
		{"leftStart", intToString(leftStart)},
		{"mid", intToString(mid)},
		{"rightEnd", intToString(rightEnd)},
		{"i", intToString(i)},
		{"j", intToString(j)},
		{"k", intToString(k)},
		{"n", intToString(n)},
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func generateSpacedRow(arr []int, currSize int, n int, blockColors map[int]string, activeLeft, activeRight, activeTarget int, isHidden map[int]bool) []models.ArrayCellState {
	var row []models.ArrayCellState
	for i := 0; i < n; i++ {
		color := "transparent"
		if c, ok := blockColors[i]; ok {
			color = c
		}

		if i == activeLeft || i == activeRight {
			color = "rgba(251, 146, 60, 0.7)" // Orange for active pointers
		} else if i == activeTarget {
			color = "rgba(59, 130, 246, 0.7)" // Blue for target write
		}

		dim := false
		if hide, ok := isHidden[i]; ok && hide {
			color = "hidden"
			dim = true
		}

		row = append(row, models.ArrayCellState{
			Value: arr[i],
			Color: color,
			Dim:   dim,
		})

		// Add spacer if it's the end of a currSize block, except for the very last element
		if (i+1)%currSize == 0 && i < n-1 {
			row = append(row, models.ArrayCellState{Value: -999, Color: "transparent"})
		}
	}
	return row
}

func generateArrowRow(currSize int, n int, activeLeft, activeRight int) []models.ArrayCellState {
	var row []models.ArrayCellState
	for i := 0; i < n; i++ {
		dim := true
		if i == activeLeft || i == activeRight {
			dim = false // Show arrow!
		}

		row = append(row, models.ArrayCellState{
			Value: -888,
			Color: "transparent",
			Dim:   dim,
		})

		if (i+1)%currSize == 0 && i < n-1 {
			row = append(row, models.ArrayCellState{Value: -999, Color: "transparent"})
		}
	}
	return row
}

func GenerateMergeSortSteps(req models.SimulationRequest) []models.StepState {
	arr := make([]int, len(req.Array))
	copy(arr, req.Array)
	n := len(arr)
	var steps []models.StepState

	if n == 0 {
		return steps
	}

	var history [][]models.ArrayCellState

	// Add the completely unsorted array to history so it's always at the top
	history = append(history, generateSpacedRow(arr, n, n, map[int]string{}, -1, -1, -1, map[int]bool{}))

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Start Iterative Merge Sort",
		Status:       "checking",
		HudVariables: buildMergeSortHud(1, 0, 0, 0, 0, 0, 0, n),
		MatrixState:  [][]models.ArrayCellState{history[0]},
		MathSteps:    []models.MathStep{},
	})

	for currSize := 1; currSize < n; currSize *= 2 {

		steps = append(steps, models.StepState{
			Line:         3,
			Action:       "Pass starting with currSize = " + intToString(currSize),
			Status:       "checking",
			HudVariables: buildMergeSortHud(currSize, 0, 0, 0, 0, 0, 0, n),
			MatrixState:  append(history, generateSpacedRow(arr, currSize, n, map[int]string{}, -1, -1, -1, map[int]bool{})),
			MathSteps:    []models.MathStep{},
		})

		sourceRowColors := make(map[int]string)
		for i := 0; i < n; i++ {
			sourceRowColors[i] = "rgba(107, 114, 128, 0.4)" // Gray for pending blocks
		}

		currentMatrix := append([][]models.ArrayCellState(nil), history...)
		currentMatrix = append(currentMatrix, generateSpacedRow(arr, currSize, n, sourceRowColors, -1, -1, -1, map[int]bool{}))

		// Arrow Row
		currentMatrix = append(currentMatrix, generateArrowRow(currSize, n, -1, -1))

		targetArr := make([]int, n)
		copy(targetArr, arr)
		targetHidden := make(map[int]bool)
		for i := 0; i < n; i++ {
			targetHidden[i] = true
		}
		targetRowColors := make(map[int]string)

		currentMatrix = append(currentMatrix, generateSpacedRow(targetArr, currSize, n, targetRowColors, -1, -1, -1, targetHidden))

		for leftStart := 0; leftStart < n-1; leftStart += 2 * currSize {

			mid := min(leftStart+currSize-1, n-1)
			rightEnd := min(leftStart+2*currSize-1, n-1)

			for i := leftStart; i <= mid; i++ {
				sourceRowColors[i] = "rgba(34, 197, 94, 0.4)" // Green for left block
			}
			for i := mid + 1; i <= rightEnd; i++ {
				sourceRowColors[i] = "rgba(251, 146, 60, 0.4)" // Orange for right block
			}

			currentMatrix[len(currentMatrix)-3] = generateSpacedRow(arr, currSize, n, sourceRowColors, -1, -1, -1, map[int]bool{})
			currentMatrix[len(currentMatrix)-2] = generateArrowRow(currSize, n, -1, -1)

			steps = append(steps, models.StepState{
				Line:         9,
				Action:       "Merging blocks: [" + intToString(leftStart) + " to " + intToString(mid) + "] and [" + intToString(mid+1) + " to " + intToString(rightEnd) + "]",
				Status:       "checking",
				HudVariables: buildMergeSortHud(currSize, leftStart, mid, rightEnd, 0, 0, 0, n),
				MatrixState:  append([][]models.ArrayCellState(nil), currentMatrix...),
				MathSteps:    []models.MathStep{},
			})

			n1 := mid - leftStart + 1
			n2 := rightEnd - mid

			L := make([]int, n1)
			R := make([]int, n2)

			for i := 0; i < n1; i++ {
				L[i] = arr[leftStart+i]
			}
			for j := 0; j < n2; j++ {
				R[j] = arr[mid+1+j]
			}

			i, j, k := 0, 0, leftStart

			for i < n1 && j < n2 {
				steps = append(steps, models.StepState{
					Line:         22,
					Action:       "Compare L[" + intToString(i) + "] and R[" + intToString(j) + "]",
					Status:       "checking",
					HudVariables: buildMergeSortHud(currSize, leftStart, mid, rightEnd, i, j, k, n),
					MatrixState:  append([][]models.ArrayCellState(nil), currentMatrix[:len(currentMatrix)-3]...),
					MathSteps:    []models.MathStep{},
				})

				currentMatrix[len(currentMatrix)-3] = generateSpacedRow(arr, currSize, n, sourceRowColors, leftStart+i, mid+1+j, -1, map[int]bool{})
				currentMatrix[len(currentMatrix)-2] = generateArrowRow(currSize, n, leftStart+i, mid+1+j)
				steps[len(steps)-1].MatrixState = append([][]models.ArrayCellState(nil), currentMatrix...)

				if L[i] <= R[j] {
					targetArr[k] = L[i]
					targetHidden[k] = false
					targetRowColors[k] = "rgba(59, 130, 246, 0.7)" // Blue

					currentMatrix[len(currentMatrix)-3] = generateSpacedRow(arr, currSize, n, sourceRowColors, leftStart+i, -1, -1, map[int]bool{})
					currentMatrix[len(currentMatrix)-2] = generateArrowRow(currSize, n, leftStart+i, -1)
					currentMatrix[len(currentMatrix)-1] = generateSpacedRow(targetArr, currSize, n, targetRowColors, -1, -1, k, targetHidden)

					steps = append(steps, models.StepState{
						Line:         24,
						Action:       "Take L[" + intToString(i) + "]",
						Status:       "swapping",
						HudVariables: buildMergeSortHud(currSize, leftStart, mid, rightEnd, i, j, k, n),
						MatrixState:  append([][]models.ArrayCellState(nil), currentMatrix...),
						MathSteps:    []models.MathStep{},
					})
					i++
				} else {
					targetArr[k] = R[j]
					targetHidden[k] = false
					targetRowColors[k] = "rgba(59, 130, 246, 0.7)" // Blue

					currentMatrix[len(currentMatrix)-3] = generateSpacedRow(arr, currSize, n, sourceRowColors, -1, mid+1+j, -1, map[int]bool{})
					currentMatrix[len(currentMatrix)-2] = generateArrowRow(currSize, n, -1, mid+1+j)
					currentMatrix[len(currentMatrix)-1] = generateSpacedRow(targetArr, currSize, n, targetRowColors, -1, -1, k, targetHidden)

					steps = append(steps, models.StepState{
						Line:         25,
						Action:       "Take R[" + intToString(j) + "]",
						Status:       "swapping",
						HudVariables: buildMergeSortHud(currSize, leftStart, mid, rightEnd, i, j, k, n),
						MatrixState:  append([][]models.ArrayCellState(nil), currentMatrix...),
						MathSteps:    []models.MathStep{},
					})
					j++
				}
				targetRowColors[k] = "transparent"
				k++
			}

			for i < n1 {
				targetArr[k] = L[i]
				targetHidden[k] = false
				targetRowColors[k] = "rgba(59, 130, 246, 0.7)"

				currentMatrix[len(currentMatrix)-3] = generateSpacedRow(arr, currSize, n, sourceRowColors, leftStart+i, -1, -1, map[int]bool{})
				currentMatrix[len(currentMatrix)-2] = generateArrowRow(currSize, n, leftStart+i, -1)
				currentMatrix[len(currentMatrix)-1] = generateSpacedRow(targetArr, currSize, n, targetRowColors, -1, -1, k, targetHidden)

				steps = append(steps, models.StepState{
					Line:         27,
					Action:       "Take remaining L[" + intToString(i) + "]",
					Status:       "swapping",
					HudVariables: buildMergeSortHud(currSize, leftStart, mid, rightEnd, i, j, k, n),
					MatrixState:  append([][]models.ArrayCellState(nil), currentMatrix...),
					MathSteps:    []models.MathStep{},
				})
				targetRowColors[k] = "transparent"
				i++
				k++
			}

			for j < n2 {
				targetArr[k] = R[j]
				targetHidden[k] = false
				targetRowColors[k] = "rgba(59, 130, 246, 0.7)"

				currentMatrix[len(currentMatrix)-3] = generateSpacedRow(arr, currSize, n, sourceRowColors, -1, mid+1+j, -1, map[int]bool{})
				currentMatrix[len(currentMatrix)-2] = generateArrowRow(currSize, n, -1, mid+1+j)
				currentMatrix[len(currentMatrix)-1] = generateSpacedRow(targetArr, currSize, n, targetRowColors, -1, -1, k, targetHidden)

				steps = append(steps, models.StepState{
					Line:         28,
					Action:       "Take remaining R[" + intToString(j) + "]",
					Status:       "swapping",
					HudVariables: buildMergeSortHud(currSize, leftStart, mid, rightEnd, i, j, k, n),
					MatrixState:  append([][]models.ArrayCellState(nil), currentMatrix...),
					MathSteps:    []models.MathStep{},
				})
				targetRowColors[k] = "transparent"
				j++
				k++
			}

			for idx := leftStart; idx <= rightEnd; idx++ {
				arr[idx] = targetArr[idx]
			}

			for idx := leftStart; idx <= rightEnd; idx++ {
				sourceRowColors[idx] = "transparent"
				targetRowColors[idx] = "rgba(107, 114, 128, 0.4)"
			}
		}

		history = append(history, generateSpacedRow(arr, currSize*2, n, map[int]string{}, -1, -1, -1, map[int]bool{}))
	}

	steps = append(steps, models.StepState{
		Line:         12,
		Action:       "Array is completely sorted.",
		Status:       "found",
		HudVariables: buildMergeSortHud(n, 0, 0, 0, 0, 0, 0, n),
		MatrixState:  append(history, generateSpacedRow(arr, n, n, map[int]string{}, -1, -1, -1, map[int]bool{})),
		MathSteps:    []models.MathStep{},
	})

	return steps
}
