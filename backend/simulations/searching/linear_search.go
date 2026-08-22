package searching

import "skillsync-learning-system/models"

func buildLinearHud(arr []int, i int) []models.HudVariable {
	iStr := "-"
	aiStr := "-"
	if i != -1 {
		iStr = intToString(i)
		if i >= 0 && i < len(arr) {
			aiStr = intToString(arr[i])
		}
	}
	return []models.HudVariable{
		{"i", iStr},
		{"A[i]", aiStr},
	}
}

func GenerateLinearSearchSteps(arr []int, target int) []models.StepState {
	var steps []models.StepState

	for i := 0; i < len(arr); i++ {
		steps = append(steps, models.StepState{
			Line:         1,
			Action:       "Check loop condition: i (" + intToString(i) + ") < len (" + intToString(len(arr)) + ").",
			Status:       "checking",
			HudVariables: buildLinearHud(arr, i),
			ArrayState:   buildLinearArrayState(arr, i, -1),
		})

		if arr[i] == target {
			steps = append(steps, models.StepState{
				Line:         2,
				Action:       "Check if A[" + intToString(i) + "] == target: " + intToString(arr[i]) + " == " + intToString(target) + " is True.",
				Status:       "checking",
				HudVariables: buildLinearHud(arr, i),
				ArrayState:   buildLinearArrayState(arr, i, -1),
			})
			steps = append(steps, models.StepState{
				Line:         3,
				Action:       "Target found at index " + intToString(i) + "! Return i.",
				Status:       "found",
				HudVariables: buildLinearHud(arr, i),
				ArrayState:   buildLinearArrayState(arr, -1, i),
			})
			return steps
		} else {
			steps = append(steps, models.StepState{
				Line:         2,
				Action:       "Check if A[" + intToString(i) + "] == target: " + intToString(arr[i]) + " == " + intToString(target) + " is False.",
				Status:       "checking",
				HudVariables: buildLinearHud(arr, i),
				ArrayState:   buildLinearArrayState(arr, i, -1),
			})
		}
	}

	steps = append(steps, models.StepState{
		Line:         1,
		Action:       "Check loop condition: i (" + intToString(len(arr)) + ") < len (" + intToString(len(arr)) + ") is False. Loop ends.",
		Status:       "checking",
		HudVariables: buildLinearHud(arr, -1),
		ArrayState:   buildLinearArrayState(arr, -1, -1),
	})

	steps = append(steps, models.StepState{
		Line:         4,
		Action:       "Target not found in array. Return -1.",
		Status:       "not_found",
		HudVariables: buildLinearHud(arr, -1),
		ArrayState:   buildLinearArrayState(arr, -1, -1),
	})

	return steps
}

