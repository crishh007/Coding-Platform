package models

type UpdateProfileInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}
