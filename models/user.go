package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model

	Username string `json:"username" gorm:"unique;not null"`
	Email    string `json:"email"    gorm:"unique;not null"`
	Password string `json:"-"        gorm:"not null"`
	Role     string `json:"role"     gorm:"default:user"`

	// Password reset — token is stored as a bcrypt hash; never stored in plain text
	PasswordResetToken  string     `json:"-" gorm:"default:null"`
	PasswordResetExpiry *time.Time `json:"-" gorm:"default:null"`
}
