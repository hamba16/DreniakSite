import { MediaLibrary } from "./media-library";

export default function MediaPage() {
  return <main><span className="eyebrow">CONTENT</span><h1>Media Library</h1><p className="admin-lead">Upload images and video for use across editable pages. Existing files in public/images remain static site assets.</p><MediaLibrary /></main>;
}
