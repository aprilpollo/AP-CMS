import PageContainer from "@/shared/PageContainer"
import MediaLibraryView from "./MediaLibraryView"

function MediaPage() {
  return (
    <PageContainer
      title="Media"
      description="Upload and manage media files."
      className="p-4 md:p-6"
    >
      <MediaLibraryView />
    </PageContainer>
  )
}

export default MediaPage
