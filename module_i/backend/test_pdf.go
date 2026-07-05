package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/ledongthuc/pdf"
)

func main() {
	file, err := os.Open("dummy_resume.pdf")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	stat, _ := file.Stat()
	reader, err := pdf.NewReader(file, stat.Size())
	if err != nil {
		panic(err)
	}
	fmt.Println("Reader created, num pages:", reader.NumPage())

	var textBuilder strings.Builder
	for pageIndex := 1; pageIndex <= reader.NumPage(); pageIndex++ {
		p := reader.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}
		text, err := p.GetPlainText(nil)
		if err != nil {
			panic(err)
		}
		textBuilder.WriteString(text)
	}
	fmt.Println("Extracted:")
	fmt.Println(textBuilder.String())
}
