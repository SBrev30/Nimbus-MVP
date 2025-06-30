@@ .. @@
interface ChaptersPageProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
+  onSelectChapter?: (chapterId: string, chapterTitle: string) => void;
  onCreateChapter?: () => void;
+  onEditChapter?: (chapterId: string, chapterTitle: string) => void;
}

@@ .. @@
export function ChaptersPage({ 
  projectId, 
  projectTitle, 
  onBack, 
+  onSelectChapter,
  onCreateChapter,
+  onEditChapter 
}: ChaptersPageProps) {

@@ .. @@
  const handlePreviewChapter = (chapter: Chapter) => {
    setChapterToPreview(chapter);
    setShowPreviewModal(true);
  };

@@ .. @@
      {/* Chapter Preview Modal */}
      {showPreviewModal && chapterToPreview && (
        <ChapterPreviewModal
          chapter={chapterToPreview}
          onClose={() => setShowPreviewModal(false)}
+          onEditChap
}ter={onSelectChapter}
        />
      )}