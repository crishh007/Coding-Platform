import os
import re

source_file = "src/pages/ResumeBuilder.jsx"
output_dir = "src/pages/resume"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(source_file, "r", encoding="utf-8") as f:
    content = f.read()

# Common imports to add
react_imports = "import React, { useState, useEffect, useCallback, useRef } from 'react';\n"
router_imports = "import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';\n"
lucide_imports = "import { Plus, Edit3, Trash2, Download, Eye, FileText, CheckCircle2, Code, User, GraduationCap, BookOpen, FolderGit2, Briefcase, Wrench, Award, Trophy, ChevronLeft, ChevronRight, X, ExternalLink, Sparkles, Move, Wand2, UploadCloud } from 'lucide-react';\n"
axios_imports = "import axios from 'axios';\n"
dnd_imports = "import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';\nimport { CSS } from '@dnd-kit/utilities';\n"
latex_import = "import { generateLatex } from '../../utils/latexGenerator';\n"

api_base = "const API_BASE = 'http://127.0.0.1:8080/api/resumes';\n"

# Extract utilities
utils_match = re.search(r'(const SAMPLE_RESUME.*?)/\* ════', content, re.DOTALL)
utils_content = utils_match.group(1).strip()

with open(os.path.join(output_dir, "ResumeShared.jsx"), "w", encoding="utf-8") as f:
    f.write(react_imports + lucide_imports + axios_imports + dnd_imports + api_base + "\n" + utils_content + "\n\nexport { SAMPLE_RESUME, useDebounce, SortableItem, DynamicListSection, BulletListEditor, TagInput, ProgressStepper, API_BASE };\n")

# Extract preview
preview_match = re.search(r'/\* ════+.*?RESUME PREVIEW.*?════+ \*/(.*)/\* ════+.*?MAIN ROUTER.*?════+ \*/', content, re.DOTALL)
preview_content = preview_match.group(1).strip()

with open(os.path.join(output_dir, "ResumePreview.jsx"), "w", encoding="utf-8") as f:
    f.write(react_imports + router_imports + lucide_imports + latex_import + "import { API_BASE } from './ResumeShared';\n\n" + preview_content + "\n\nexport { ResumePreviewContent };\nexport default ResumePreview;\n")


# Extract dashboard
dashboard_match = re.search(r'/\* ════+.*?RESUME DASHBOARD.*?════+ \*/(.*)/\* ════+.*?RESUME CREATE.*?════+ \*/', content, re.DOTALL)
dashboard_content = dashboard_match.group(1).strip()

with open(os.path.join(output_dir, "ResumeDashboard.jsx"), "w", encoding="utf-8") as f:
    f.write(react_imports + router_imports + lucide_imports + axios_imports + "import { API_BASE, SAMPLE_RESUME } from './ResumeShared';\nimport { ResumePreviewContent } from './ResumePreview';\n\n" + dashboard_content + "\n\nexport default ResumeDashboard;\n")

# Extract create
create_match = re.search(r'/\* ════+.*?RESUME CREATE.*?════+ \*/(.*)/\* ════+.*?RESUME EDITOR.*?════+ \*/', content, re.DOTALL)
create_content = create_match.group(1).strip()

with open(os.path.join(output_dir, "ResumeCreate.jsx"), "w", encoding="utf-8") as f:
    f.write(react_imports + router_imports + lucide_imports + axios_imports + "import { API_BASE } from './ResumeShared';\n\n" + create_content + "\n\nexport default ResumeCreate;\n")

# Extract editor
editor_match = re.search(r'/\* ════+.*?RESUME EDITOR.*?════+ \*/(.*)/\* ════+.*?RESUME PREVIEW.*?════+ \*/', content, re.DOTALL)
editor_content = editor_match.group(1).strip()

with open(os.path.join(output_dir, "ResumeEditor.jsx"), "w", encoding="utf-8") as f:
    f.write(react_imports + router_imports + lucide_imports + axios_imports + "import { API_BASE, useDebounce, DynamicListSection, BulletListEditor, TagInput, ProgressStepper } from './ResumeShared';\nimport { ResumePreviewContent } from './ResumePreview';\n\n" + editor_content + "\n\nexport default ResumeEditor;\n")

# Recreate the router file
router_content = f"""{react_imports}
{router_imports}
import ResumeDashboard from './ResumeDashboard';
import ResumeCreate from './ResumeCreate';
import ResumeEditor from './ResumeEditor';
import ResumePreview from './ResumePreview';

const ResumeBuilder = () => (
  <Routes>
    <Route path="/" element={{<ResumeDashboard />}} />
    <Route path="/create" element={{<ResumeCreate />}} />
    <Route path="/:id/edit" element={{<ResumeEditor />}} />
    <Route path="/:id/preview" element={{<ResumePreview />}} />
  </Routes>
);

export default ResumeBuilder;
"""

with open(os.path.join(output_dir, "ResumeBuilder.jsx"), "w", encoding="utf-8") as f:
    f.write(router_content)

print("ResumeBuilder split successfully.")
