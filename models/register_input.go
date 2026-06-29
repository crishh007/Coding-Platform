package models

type RegisterInput struct {
	// alphanum only; 3–30 chars prevents injection and excessively long usernames
	Username string `json:"username" binding:"required,alphanum,min=3,max=30"`
	Email    string `json:"email"    binding:"required,email"`
	// max=72 is critical: bcrypt silently truncates at 72 bytes
	Password string `json:"password" binding:"required,min=8,max=72"`
}
