package models

type SimulationRequest struct {
	Array        []int   `json:"array"`
	Target       int     `json:"target"`
	Original     [][]int `json:"original"`
	RotationType string  `json:"rotationType"`
	K            int     `json:"k"`
}

type HudVariable struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type ArrayCellState struct {
	Value    int      `json:"value"`
	Color    string   `json:"color"`
	Pointers []string `json:"pointers"`
	Dim      bool     `json:"dim"`
}

type MathStep struct {
	Label      string `json:"label"`
	Expression string `json:"expression"`
	Highlight  bool   `json:"highlight"`
}

type StepState struct {
	Line         int                  `json:"line"`
	Action       string               `json:"action"`
	Status       string               `json:"status"`
	HudVariables []HudVariable        `json:"hudVariables"`
	ArrayState   []ArrayCellState     `json:"arrayState,omitempty"`
	MatrixState  [][]ArrayCellState   `json:"matrixState,omitempty"`
	MathSteps    []MathStep           `json:"mathSteps"`
}
