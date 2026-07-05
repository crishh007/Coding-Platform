package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PersonalInfo struct {
	FullName   string `bson:"full_name" json:"full_name"`
	Email      string `bson:"email" json:"email"`
	Phone      string `bson:"phone" json:"phone"`
	Location   string `bson:"location" json:"location"`
	LinkedIn   string `bson:"linkedin" json:"linkedin"`
	GitHub     string `bson:"github" json:"github"`
	Website    string `bson:"website" json:"website"`
	HackerRank string `bson:"hackerrank" json:"hackerrank"`
	Codeforces string `bson:"codeforces" json:"codeforces"`
	Portfolio  string `bson:"portfolio" json:"portfolio"`
}

type Education struct {
	Institution  string `bson:"institution" json:"institution"`
	Degree       string `bson:"degree" json:"degree"`
	FieldOfStudy string `bson:"field_of_study" json:"field_of_study"`
	StartDate    string `bson:"start_date" json:"start_date"`
	EndDate      string `bson:"end_date" json:"end_date"`
	Score        string `bson:"score" json:"score"` // CGPA or %
	ScoreType    string `bson:"score_type" json:"score_type"` // "CGPA" or "Percentage"
	Location     string `bson:"location" json:"location"`
}

type Experience struct {
	Company         string   `bson:"company" json:"company"`
	Title           string   `bson:"title" json:"title"`
	Location        string   `bson:"location" json:"location"`
	StartDate       string   `bson:"start_date" json:"start_date"`
	EndDate         string   `bson:"end_date" json:"end_date"`
	Description     []string `bson:"description" json:"description"`
	CertificateLink string   `bson:"certificate_link" json:"certificate_link"`
}

type Project struct {
	Name         string   `bson:"name" json:"name"`
	Technologies []string `bson:"technologies" json:"technologies"`
	Description  []string `bson:"description" json:"description"`
	Link         string   `bson:"link" json:"link"`
	LiveLink     string   `bson:"live_link" json:"live_link"`
	Duration     string   `bson:"duration" json:"duration"`
}

type Certification struct {
	Name          string `bson:"name" json:"name"`
	Issuer        string `bson:"issuer" json:"issuer"`
	Date          string `bson:"date" json:"date"`
	CredentialURL string `bson:"credential_url" json:"credential_url"`
}

type Extracurricular struct {
	Organization    string   `bson:"organization" json:"organization"`
	Role            string   `bson:"role" json:"role"`
	StartDate       string   `bson:"start_date" json:"start_date"`
	EndDate         string   `bson:"end_date" json:"end_date"`
	Location        string   `bson:"location" json:"location"`
	Description     []string `bson:"description" json:"description"`
	CertificateLink string   `bson:"certificate_link" json:"certificate_link"`
}

type TechnicalSkills struct {
	Languages      []string `bson:"languages" json:"languages"`
	Frameworks     []string `bson:"frameworks" json:"frameworks"`
	Databases      []string `bson:"databases" json:"databases"`
	DeveloperTools []string `bson:"developer_tools" json:"developer_tools"`
	Platforms      []string `bson:"platforms" json:"platforms"`
	Other          []string `bson:"other" json:"other"`
}

type CustomSection struct {
	Title string   `bson:"title" json:"title"`
	Items []string `bson:"items" json:"items"`
}

type Resume struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID           primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name             string             `bson:"name" json:"name"`
	TargetRole       string             `bson:"target_role" json:"target_role"`
	TemplateName     string             `bson:"template_name" json:"template_name"`
	PersonalInfo     PersonalInfo       `bson:"personal_info" json:"personal_info"`
	Summary          string             `bson:"summary" json:"summary"`
	Education        []Education        `bson:"education" json:"education"`
	Skills           []string           `bson:"skills" json:"skills"` // kept for backward compat
	TechnicalSkills  TechnicalSkills    `bson:"technical_skills" json:"technical_skills"`
	Coursework       []string           `bson:"coursework" json:"coursework"`
	Experience       []Experience       `bson:"experience" json:"experience"`
	Projects         []Project          `bson:"projects" json:"projects"`
	Certifications   []Certification    `bson:"certifications" json:"certifications"`
	Extracurriculars []Extracurricular  `bson:"extracurriculars" json:"extracurriculars"`
	CustomSections   []CustomSection    `bson:"custom_sections" json:"custom_sections"`
	Achievements     []string           `bson:"achievements" json:"achievements"`
	SectionOrder     []string           `bson:"section_order" json:"section_order"`
	ATSScore         int                `bson:"ats_score" json:"ats_score"`
	CreatedAt        time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time          `bson:"updated_at" json:"updated_at"`
}
