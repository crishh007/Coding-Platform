package models

type ForgotPasswordInput struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordInput struct {
	Email       string `json:"email" binding:"required,email"`
	NewPassword string `json:"new_password" binding:"required"`
}
