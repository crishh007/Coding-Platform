package main

import (
    "context"
    "log"

    "codemastery-learning-system/config"
    "codemastery-learning-system/database"
    "codemastery-learning-system/models"
    "go.mongodb.org/mongo-driver/v2/bson"
)

// statsForDifficulty returns deterministic submission / accepted counts for a given difficulty.
func statsForDifficulty(diff string) (submissions, accepted int) {
    switch diff {
    case "Easy":
        submissions = 8000
        accepted = int(0.72 * float64(submissions)) // ≈ 5760
    case "Medium":
        submissions = 5000
        accepted = int(0.49 * float64(submissions)) // ≈ 2450
    case "Hard":
        submissions = 2000
        accepted = int(0.28 * float64(submissions)) // ≈ 560
    default:
        submissions, accepted = 0, 0
    }
    return
}

func main() {
    cfg := config.LoadConfig()
    db := database.InitDB(cfg)
    ctx := context.Background()

    // Iterate over all lessons and update their practice question stats.
    cur, err := db.Collection("lessons").Find(ctx, bson.D{})
    if err != nil {
        log.Fatalf("Failed to fetch lessons: %v", err)
    }
    defer cur.Close(ctx)

    for cur.Next(ctx) {
        var lesson models.Lesson
        if err := cur.Decode(&lesson); err != nil {
            log.Printf("Decode error: %v", err)
            continue
        }
        subCnt, accCnt := statsForDifficulty(lesson.Difficulty)
        // Update each practice question inside the lesson.
        for i := range lesson.Practice.Questions {
            lesson.Practice.Questions[i].SubmissionCount = subCnt
            lesson.Practice.Questions[i].AcceptedCount = accCnt
        }
        // Write back the updated lesson.
        filter := bson.M{"_id": lesson.ID}
        update := bson.M{"$set": bson.M{"practice.questions": lesson.Practice.Questions}}
        if _, err := db.Collection("lessons").UpdateOne(ctx, filter, update); err != nil {
            log.Printf("Failed to update lesson %s: %v", lesson.ID, err)
        }
    }
    if err := cur.Err(); err != nil {
        log.Printf("Cursor error: %v", err)
    }
    log.Println("Practice question stats updated.")
}
