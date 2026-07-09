export const generateLatex = (resume) => {
  const sanitize = (str) => {
    if (!str) return '';
    return str.toString()
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  };

  // Helper: don't sanitize URLs used in \href{} — only sanitize display text
  const sanitizeUrl = (url) => {
    if (!url) return '';
    return url.replace(/%/g, '\\%').replace(/#/g, '\\#');
  };

  const personal = resume.personal_info || {};
  const education = resume.education || [];
  const experience = resume.experience || [];
  const projects = resume.projects || [];
  const coursework = resume.coursework || [];
  const technicalSkills = resume.technical_skills || {};
  const extracurriculars = resume.extracurriculars || [];
  const certifications = resume.certifications || [];
  const skills = resume.skills || [];

  // Build contact links line
  let contactLinks = [];
  if (personal.phone) {
    contactLinks.push(`\\href{tel:${personal.phone}}{ \\raisebox{-0.1\\height}\\faPhone\\ \\underline{${sanitize(personal.phone)}} ~}`);
  }
  if (personal.email) {
    contactLinks.push(`\\href{mailto:${personal.email}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${sanitize(personal.email)}}} ~`);
  }
  if (personal.linkedin) {
    const liDisplay = personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '');
    contactLinks.push(`\\href{${sanitizeUrl(personal.linkedin)}}{\\raisebox{-0.2\\height}\\faLinkedinSquare\\ \\underline{${sanitize(liDisplay)}}}  ~`);
  }
  if (personal.github) {
    const ghDisplay = personal.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
    contactLinks.push(`\\href{${sanitizeUrl(personal.github)}}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{${sanitize(ghDisplay)}}} ~`);
  }
  if (personal.hackerrank) {
    const hrDisplay = personal.hackerrank.replace(/^https?:\/\/(www\.)?hackerrank\.com\//i, '').replace(/\/$/, '');
    contactLinks.push(`\\href{${sanitizeUrl(personal.hackerrank)}}{\\raisebox{-0.2\\height}\\faHackerrank\\ \\underline{${sanitize(hrDisplay)}}} ~`);
  }
  if (personal.codeforces) {
    const cfDisplay = personal.codeforces.replace(/^https?:\/\/(www\.)?codeforces\.com\/profile\//i, '').replace(/\/$/, '');
    contactLinks.push(`\\href{${sanitizeUrl(personal.codeforces)}}{\\raisebox{-0.2\\height}\\faPoll\\ \\underline{${sanitize(cfDisplay)}}}`);
  }

  // ===== PREAMBLE =====
  let latex = `%-------------------------
% Resume in Latex
% Author : Abey George
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\usepackage{graphicx}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\RequirePackage{tikz}
\\RequirePackage{xcolor}
\\RequirePackage{fontawesome}
\\usepackage{tikz}
\\usetikzlibrary{svg.path}


\\definecolor{cvblue}{HTML}{0E5484}
\\definecolor{black}{HTML}{130810}
\\definecolor{darkcolor}{HTML}{0F4539}
\\definecolor{cvgreen}{HTML}{3BD80D}
\\definecolor{taggreen}{HTML}{00E278}
\\definecolor{SlateGrey}{HTML}{2E2E2E}
\\definecolor{LightGrey}{HTML}{666666}
\\colorlet{name}{black}
\\colorlet{tagline}{darkcolor}
\\colorlet{heading}{darkcolor}
\\colorlet{headingrule}{cvblue}
\\colorlet{accent}{darkcolor}
\\colorlet{emphasis}{SlateGrey}
\\colorlet{body}{LightGrey}

\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-0.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\classesList}[4]{
    \\item\\small{
        {#1 #2 #3 #4 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\large#1} & \\textbf{\\small #2} \\\\
      \\textit{\\large#3} & \\textit{\\small #4} \\\\
      
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}


\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}


\\newcommand\\sbullet[1][.5]{\\mathbin{\\vcenter{\\hbox{\\scalebox{#1}{$\\bullet$}}}}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------


\\begin{center}
    {\\Huge \\scshape ${sanitize(personal.full_name || 'Your Name')}} \\\\ \\vspace{1pt}
    ${sanitize(personal.location || '')} \\\\ \\vspace{1pt}
    \\small ${contactLinks.join('\n    ')}
    \\vspace{-8pt}
\\end{center}
`;

  // ===== EDUCATION =====
  if (education.length > 0) {
    latex += `\n%-----------EDUCATION-----------\n\\section{EDUCATION}\n`;
    education.forEach(edu => {
      const scoreLabel = edu.score_type === 'Percentage' ? 'Percentage' : 'CGPA';
      const scoreDisplay = edu.score_type === 'Percentage' ? `${sanitize(edu.score)}\\%` : sanitize(edu.score);
      const degreeLine = edu.field_of_study
        ? `${sanitize(edu.degree)} - ${sanitize(edu.field_of_study)} - \\textbf{${scoreLabel}} - \\textbf{${scoreDisplay}}`
        : `${sanitize(edu.degree)} - \\textbf{${scoreLabel}} - \\textbf{${scoreDisplay}}`;
      latex += `  \\resumeSubHeadingListStart
    \\resumeSubheading
      {${sanitize(edu.institution)}}{${sanitize(edu.start_date)} -- ${sanitize(edu.end_date)}}
      {${degreeLine}}{${sanitize(edu.location || '')}}
  \\resumeSubHeadingListEnd\n`;
    });
  }

  // ===== COURSEWORK / SKILLS =====
  if (coursework.length > 0) {
    latex += `\n%------RELEVANT COURSEWORK-------
\\section{COURSEWORK / SKILLS}
    \\begin{multicols}{4}
        \\begin{itemize}[itemsep=-2pt, parsep=5pt]\n`;
    coursework.forEach(course => {
      latex += `            \\item ${sanitize(course)}\n`;
    });
    latex += `        \\end{itemize}
    \\end{multicols}
    \\vspace*{2.0\\multicolsep}\n`;
  }

  // ===== PROJECTS =====
  if (projects.length > 0) {
    latex += `\n%-----------PROJECTS-----------
\\section{PROJECTS}
    \\vspace{-5pt}
    \\resumeSubHeadingListStart\n`;
    projects.forEach((proj, idx) => {
      const linkIcon = proj.link ? ` \\href{${sanitizeUrl(proj.link)}}{\\raisebox{-0.1\\height}\\faExternalLink }` : '';
      const techStr = (proj.technologies || []).map(t => sanitize(t)).join(', ');
      const duration = proj.duration ? sanitize(proj.duration) : '';
      latex += `       \\resumeProjectHeading
          {\\href{${sanitizeUrl(proj.link || '')}}{\\textbf{\\large{\\underline{${sanitize(proj.name)}}}}}${linkIcon} $|$ \\large{\\underline{${techStr}}}}{${duration}}\n`;
      latex += `          \\resumeItemListStart\n`;
      (proj.description || []).forEach(desc => {
        latex += `            \\resumeItem{\\normalsize{${sanitize(desc)}}}\n`;
      });
      if (proj.live_link) {
        latex += `            \\resumeItem{\\textcolor{accent} {\\href{${sanitizeUrl(proj.live_link)}} {\\underline{\\normalsize{Live site here}}}}}\n`;
      }
      latex += `          \\resumeItemListEnd\n`;
      if (idx < projects.length - 1) {
        latex += `          \\vspace{-13pt}\n`;
      }
    });
    latex += `    \\resumeSubHeadingListEnd
\\vspace{-12pt}\n`;
  }

  // ===== EXPERIENCE / INTERNSHIP =====
  if (experience.length > 0) {
    latex += `\n%-----------EXPERIENCE-----------
\\section{INTERNSHIP}
  \\resumeSubHeadingListStart\n`;
    experience.forEach(exp => {
      const certIcon = exp.certificate_link ? ` \\href{${sanitizeUrl(exp.certificate_link)}}{\\raisebox{-0.1\\height}\\faExternalLink }` : '';
      latex += `\n    \\resumeSubheading
      {${sanitize(exp.company)}${certIcon}}{${sanitize(exp.start_date)} -- ${sanitize(exp.end_date)}} 
      {\\underline{${sanitize(exp.title)}}}{${sanitize(exp.location || '')}}
      \\resumeItemListStart\n`;
      (exp.description || []).forEach(desc => {
        latex += `        \\resumeItem{\\normalsize{${sanitize(desc)}}}\n`;
      });
      latex += `      \\resumeItemListEnd\n`;
    });
    latex += `  \\resumeSubHeadingListEnd
\\vspace{-12pt}\n`;
  }

  // ===== TECHNICAL SKILLS =====
  const hasCategories = technicalSkills && (
    (technicalSkills.languages && technicalSkills.languages.length > 0) ||
    (technicalSkills.frameworks && technicalSkills.frameworks.length > 0) ||
    (technicalSkills.databases && technicalSkills.databases.length > 0) ||
    (technicalSkills.developer_tools && technicalSkills.developer_tools.length > 0) ||
    (technicalSkills.platforms && technicalSkills.platforms.length > 0) ||
    (technicalSkills.other && technicalSkills.other.length > 0)
  );
  const hasFlatSkills = skills.length > 0;

  if (hasCategories || hasFlatSkills) {
    latex += `\n%-----------PROGRAMMING SKILLS-----------
\\section{TECHNICAL SKILLS}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{\n`;
    if (hasCategories) {
      if (technicalSkills.languages?.length > 0) {
        latex += `     \\textbf{\\normalsize{Languages:}}{ \\normalsize{${technicalSkills.languages.map(s => sanitize(s)).join(', ')}}} \\\\\n`;
      }
      if (technicalSkills.developer_tools?.length > 0) {
        latex += `     \\textbf{\\normalsize{Developer Tools:}}{ \\normalsize{${technicalSkills.developer_tools.map(s => sanitize(s)).join(', ')}}} \\\\\n`;
      }
      if (technicalSkills.frameworks?.length > 0) {
        latex += `     \\textbf{\\normalsize{Technologies/Frameworks:}}{\\normalsize{ ${technicalSkills.frameworks.map(s => sanitize(s)).join(', ')}}} \\\\\n`;
      }
      if (technicalSkills.databases?.length > 0) {
        latex += `     \\textbf{\\normalsize{Databases:}}{ \\normalsize{${technicalSkills.databases.map(s => sanitize(s)).join(', ')}}} \\\\\n`;
      }
      if (technicalSkills.platforms?.length > 0) {
        latex += `     \\textbf{\\normalsize{Platforms/Cloud:}}{ \\normalsize{${technicalSkills.platforms.map(s => sanitize(s)).join(', ')}}} \\\\\n`;
      }
      if (technicalSkills.other?.length > 0) {
        latex += `     \\textbf{\\normalsize{Other:}}{ \\normalsize{${technicalSkills.other.map(s => sanitize(s)).join(', ')}}} \\\\\n`;
      }
    } else {
      latex += `     \\textbf{\\normalsize{Skills/Technologies:}}{ \\normalsize{${skills.map(s => sanitize(s)).join(', ')}}} \\\\\n`;
    }
    latex += `    }}
 \\end{itemize}
 \\vspace{-15pt}\n`;
  }

  // ===== EXTRACURRICULARS =====
  if (extracurriculars.length > 0) {
    latex += `\n%-----------INVOLVEMENT---------------
\\section{EXTRACURRICULAR}
    \\resumeSubHeadingListStart\n`;
    extracurriculars.forEach(ext => {
      const certIcon = ext.certificate_link ? ` \\href{${sanitizeUrl(ext.certificate_link)}}{\\raisebox{-0.1\\height}\\faExternalLink }` : '';
      latex += `        \\resumeSubheading{${sanitize(ext.organization)}${certIcon}}{${sanitize(ext.start_date || '')} -- ${sanitize(ext.end_date || '')}}{\\underline{${sanitize(ext.role)}}}{${sanitize(ext.location || '')}}\n`;
      if (ext.description && ext.description.length > 0) {
        latex += `            \\resumeItemListStart\n`;
        ext.description.forEach(desc => {
          latex += `                \\resumeItem{\\normalsize{${sanitize(desc)}}}\n`;
        });
        latex += `            \\resumeItemListEnd\n`;
      }
    });
    latex += `    \\resumeSubHeadingListEnd
 \\vspace{-11pt}\n`;
  }

  // ===== CERTIFICATIONS =====
  if (certifications.length > 0) {
    latex += `\n %-----------CERTIFICATIONS---------------
\\section{CERTIFICATIONS}\n\n`;
    // Group certifications in rows of 3
    for (let i = 0; i < certifications.length; i++) {
      const cert = certifications[i];
      const displayName = cert.issuer ? `${sanitize(cert.name)} - ${sanitize(cert.issuer)}` : sanitize(cert.name);
      const url = cert.credential_url ? sanitizeUrl(cert.credential_url) : '#';
      latex += `$\\sbullet[.75] \\hspace{0.1cm}$ {\\href{${url}}{${displayName}}}`;
      if ((i + 1) % 3 === 0 && i < certifications.length - 1) {
        latex += `\\\\\n\n`;
      } else if (i < certifications.length - 1) {
        latex += ` \\hspace{1.6cm}\n`;
      }
    }
    latex += `\n`;
  }

  latex += `\n\\end{document}\n`;
  return latex;
};
