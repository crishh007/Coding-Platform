import fpdf

pdf = fpdf.FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="John Doe Resume", ln=1, align='C')
pdf.cell(200, 10, txt="Software Engineer", ln=2, align='L')
pdf.output("dummy_resume.pdf")
