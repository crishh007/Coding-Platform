package models

type ChangePasswordInput struct {
	OldPassword string `json:"old_password" binding:"required,max=72"`
	NewPassword string `json:"new_password" binding:"required,min=8,max=72"`
}
