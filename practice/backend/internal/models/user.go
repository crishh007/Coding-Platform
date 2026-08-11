package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                  primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Username            string             `json:"username" bson:"username"`
	Email               string             `json:"email" bson:"email"`
	Password            string             `json:"-" bson:"password"` // never expose password in JSON
	Role                string             `json:"role" bson:"role"`
	PasswordResetToken  string             `json:"-" bson:"password_reset_token,omitempty"`
	PasswordResetExpiry *time.Time         `json:"-" bson:"password_reset_expiry,omitempty"`
	CreatedAt           time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt           time.Time          `json:"updated_at" bson:"updated_at"`
}
