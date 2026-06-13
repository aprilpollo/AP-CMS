import PageContainer from "@/shared/PageContainer"
import MediaLibraryView from "./MediaLibraryView"

function MediaPage() {
  return (
    <PageContainer
      title="Media"
      description="Upload and manage media files."
    >
      <MediaLibraryView />
    </PageContainer>
  )
}

export default MediaPage
