package models

type LoginInput struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,max=72"`
}

type ForgotPasswordInput struct {
	Email string `json:"email" binding:"required,email,max=254"`
}
