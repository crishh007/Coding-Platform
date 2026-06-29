package models

type UpdateProfileInput struct {
	Username string `json:"username"         binding:"required,alphanum,min=3,max=30"`
	Email    string `json:"email"            binding:"required,email"`
	// Required only when changing email — enforced in controller
	CurrentPassword string `json:"current_password"`
}
