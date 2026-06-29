package models

type ResetPasswordInput struct {
	// token is the signed, time-limited value emailed to the user
	Token       string `json:"token"        binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8,max=72"`
}
