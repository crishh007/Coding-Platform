package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"uniqueIndex;not null" json:"username"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Role      string         `gorm:"default:'user'" json:"role"` // admin, moderator, user
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Category struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"uniqueIndex;not null" json:"name"`
	Description string         `json:"description"`
	OrderIndex  int            `gorm:"default:0" json:"order_index"`
	Tags        []Tag          `gorm:"many2many:category_tags;" json:"tags"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Tag struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"uniqueIndex;not null" json:"name"`
}

type Discussion struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	CategoryID  uint           `gorm:"not null" json:"category_id"`
	Category    Category       `json:"category"`
	AuthorID    uint           `gorm:"not null" json:"author_id"`
	Author      User           `json:"author"`
	Tags        []Tag          `gorm:"many2many:discussion_tags;" json:"tags"`
	Status      string         `gorm:"default:'active'" json:"status"` // active, locked, hidden
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Thread struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	DiscussionID uint           `gorm:"not null" json:"discussion_id"`
	Discussion   Discussion     `json:"-"`
	ParentID     *uint          `json:"parent_id"` // For nested replies (Phase 2)
	AuthorID     uint           `gorm:"not null" json:"author_id"`
	Author       User           `json:"author"`
	Content      string         `gorm:"not null" json:"content"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type ForumSetting struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	Key             string `gorm:"uniqueIndex;not null" json:"key"`
	Value           string `gorm:"not null" json:"value"`
	Description     string `json:"description"`
}

// Phase 2: Comments & Reactions
type Comment struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	ThreadID     uint           `gorm:"not null" json:"thread_id"`
	AuthorID     uint           `gorm:"not null" json:"author_id"`
	Author       User           `json:"author"`
	Content      string         `gorm:"type:text;not null" json:"content"`
	Upvotes      int            `gorm:"default:0" json:"upvotes"`
	Status       string         `gorm:"default:'active'" json:"status"` // active, deleted, hidden
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Reaction struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	TargetType   string    `gorm:"not null" json:"target_type"` // "comment", "thread", "solution"
	TargetID     uint      `gorm:"not null" json:"target_id"`
	AuthorID     uint      `gorm:"not null" json:"author_id"`
	ReactionType string    `gorm:"not null" json:"reaction_type"` // "upvote", "helpful", "emoji_id"
	CreatedAt    time.Time `json:"created_at"`
}

// Phase 3: Solutions
type Solution struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Type        string         `gorm:"not null" json:"type"` // "PDF", "Code", "Link", "Document"
	AuthorID    uint           `gorm:"not null" json:"author_id"`
	Author      User           `json:"author"`
	Tags        []Tag          `gorm:"many2many:solution_tags;" json:"tags"`
	IsPublic    bool           `gorm:"default:true" json:"is_public"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type SolutionVersion struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	SolutionID uint      `gorm:"not null" json:"solution_id"`
	VersionNum int       `gorm:"not null" json:"version_num"`
	FileURL    string    `gorm:"not null" json:"file_url"`
	CreatedAt  time.Time `json:"created_at"`
}

// Phase 4: Blogs
type Blog struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Excerpt     string         `gorm:"type:text" json:"excerpt"`
	Content     string         `gorm:"type:text;not null" json:"content"`
	AuthorID    uint           `gorm:"not null" json:"author_id"`
	Author      User           `json:"author"`
	Tags        []Tag          `gorm:"many2many:blog_tags;" json:"tags"`
	Status      string         `gorm:"default:'draft'" json:"status"` // "draft", "published", "archived"
	PublishedAt *time.Time     `json:"published_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Phase 5: Reputation & Voting
type Reputation struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	UserID   uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Score    int       `gorm:"default:0" json:"score"`
	Level    int       `gorm:"default:1" json:"level"`
	Badge    string    `gorm:"default:'Newcomer'" json:"badge"`
	UpdateAt time.Time `json:"updated_at"`
}
